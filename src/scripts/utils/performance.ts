/**
 * Performance optimization utilities for ClearLane data visualizations
 * Handles lazy loading, caching, and resource management
 */

export interface PerformanceConfig {
  lazyLoadThreshold: number;
  cacheTimeout: number;
  chunkSize: number;
  maxConcurrentRequests: number;
}

export const DEFAULT_PERF_CONFIG: PerformanceConfig = {
  lazyLoadThreshold: 100, // pixels from viewport
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  chunkSize: 1000, // records per chunk
  maxConcurrentRequests: 3,
};

/**
 * Intersection Observer for lazy loading visualizations
 */
export class LazyLoadManager {
  private observer: IntersectionObserver | null = null;
  private config: PerformanceConfig;
  private loadedElements = new Set<Element>();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_PERF_CONFIG, ...config };
    this.init();
  }

  private init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllElements();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
            this.loadElement(entry.target);
          }
        });
      },
      {
        rootMargin: `${this.config.lazyLoadThreshold}px`,
        threshold: 0.1,
      }
    );
  }

  observe(element: Element): void {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback: load immediately
      this.loadElement(element);
    }
  }

  private loadElement(element: Element): void {
    if (this.loadedElements.has(element)) return;

    this.loadedElements.add(element);
    element.classList.add('lazy-loading');

    // Emit custom event for components to handle loading
    const loadEvent = new CustomEvent('lazy-load', {
      detail: { element },
      bubbles: true,
    });
    element.dispatchEvent(loadEvent);
  }

  private loadAllElements(): void {
    // Fallback loading for all lazy elements
    const lazyElements = document.querySelectorAll('[data-lazy-load]');
    lazyElements.forEach((element) => this.loadElement(element));
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadedElements.clear();
  }
}

/**
 * Data chunking and progressive loading
 */
export class DataChunkManager {
  private config: PerformanceConfig;
  private activeRequests = new Map<string, Promise<any>>();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_PERF_CONFIG, ...config };
  }

  async loadDataInChunks<T>(
    dataLoader: () => Promise<T[]>,
    onChunkLoaded: (chunk: T[], isComplete: boolean) => void,
    chunkSize: number = this.config.chunkSize
  ): Promise<T[]> {
    try {
      const allData = await dataLoader();
      const chunks = this.chunkArray(allData, chunkSize);

      // Load first chunk immediately
      if (chunks.length > 0) {
        onChunkLoaded(chunks[0], chunks.length === 1);
      }

      // Load remaining chunks with delay
      for (let i = 1; i < chunks.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay
        onChunkLoaded(chunks[i], i === chunks.length - 1);
      }

      return allData;
    } catch (error) {
      console.error('Error loading data in chunks:', error);
      throw error;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async loadWithConcurrencyLimit<T>(
    requests: (() => Promise<T>)[]
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];

      const promise = request().then((result) => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= this.config.maxConcurrentRequests) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }
}

/**
 * Memory-efficient data processing
 */
export class DataProcessor {
  private worker: Worker | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if ('Worker' in window) {
      try {
        // Create inline worker for data processing
        const workerCode = `
          self.addEventListener('message', function(e) {
            const { type, data, options } = e.data;

            try {
              let result;
              switch(type) {
                case 'aggregate':
                  result = aggregateData(data, options);
                  break;
                case 'filter':
                  result = filterData(data, options);
                  break;
                case 'sort':
                  result = sortData(data, options);
                  break;
                default:
                  throw new Error('Unknown processing type: ' + type);
              }

              self.postMessage({ success: true, result });
            } catch (error) {
              self.postMessage({ success: false, error: error.message });
            }
          });

          function aggregateData(data, options) {
            const { groupBy, aggregates } = options;
            const groups = {};

            data.forEach(item => {
              const key = item[groupBy];
              if (!groups[key]) {
                groups[key] = { [groupBy]: key };
                aggregates.forEach(agg => {
                  groups[key][agg.field] = [];
                });
              }

              aggregates.forEach(agg => {
                groups[key][agg.field].push(item[agg.field]);
              });
            });

            // Calculate final aggregates
            Object.values(groups).forEach(group => {
              aggregates.forEach(agg => {
                const values = group[agg.field];
                switch(agg.operation) {
                  case 'sum':
                    group[agg.field] = values.reduce((a, b) => a + b, 0);
                    break;
                  case 'avg':
                    group[agg.field] = values.reduce((a, b) => a + b, 0) / values.length;
                    break;
                  case 'count':
                    group[agg.field] = values.length;
                    break;
                  case 'max':
                    group[agg.field] = Math.max(...values);
                    break;
                  case 'min':
                    group[agg.field] = Math.min(...values);
                    break;
                }
              });
            });

            return Object.values(groups);
          }

          function filterData(data, options) {
            const { filters } = options;
            return data.filter(item => {
              return filters.every(filter => {
                const value = item[filter.field];
                switch(filter.operator) {
                  case 'equals':
                    return value === filter.value;
                  case 'greater':
                    return value > filter.value;
                  case 'less':
                    return value < filter.value;
                  case 'contains':
                    return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                  default:
                    return true;
                }
              });
            });
          }

          function sortData(data, options) {
            const { field, direction = 'asc' } = options;
            return [...data].sort((a, b) => {
              const aVal = a[field];
              const bVal = b[field];
              const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              return direction === 'desc' ? -result : result;
            });
          }
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
      } catch (error) {
        console.warn('Web Worker initialization failed:', error);
      }
    }
  }

  async processData(
    type: 'aggregate' | 'filter' | 'sort',
    data: any[],
    options: any
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread processing
        resolve(this.processDataSync(type, data, options));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Data processing timeout'));
      }, 30000); // 30 second timeout

      this.worker.onmessage = (e) => {
        clearTimeout(timeout);
        const { success, result, error } = e.data;

        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      };

      this.worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      this.worker.postMessage({ type, data, options });
    });
  }

  private processDataSync(type: string, data: any[], options: any): any[] {
    // Synchronous fallback implementations
    switch (type) {
      case 'filter':
        return data.filter((item) => {
          return options.filters.every((filter: any) => {
            const value = item[filter.field];
            switch (filter.operator) {
              case 'equals':
                return value === filter.value;
              case 'greater':
                return value > filter.value;
              case 'less':
                return value < filter.value;
              case 'contains':
                return String(value)
                  .toLowerCase()
                  .includes(String(filter.value).toLowerCase());
              default:
                return true;
            }
          });
        });

      case 'sort':
        return [...data].sort((a, b) => {
          const aVal = a[options.field];
          const bVal = b[options.field];
          const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return options.direction === 'desc' ? -result : result;
        });

      default:
        return data;
    }
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

/**
 * Resource preloader for visualization assets
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>();

  async preloadCSVData(urls: string[]): Promise<void> {
    const promises = urls.map(async (url) => {
      if (this.preloadedResources.has(url)) return;

      try {
        const response = await fetch(url);
        if (response.ok) {
          // Store in cache or memory for faster access
          const text = await response.text();
          this.preloadedResources.add(url);

          // Optionally cache in localStorage for persistence
          if (this.shouldCacheLocally(url)) {
            localStorage.setItem(`preloaded_${url}`, text);
          }
        }
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error);
      }
    });

    await Promise.all(promises);
  }

  private shouldCacheLocally(url: string): boolean {
    // Only cache smaller datasets locally
    const smallDatasets = ['hourly_agg.csv', 'top5_routes_ace.csv'];
    return smallDatasets.some((dataset) => url.includes(dataset));
  }

  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map((url) => {
      if (this.preloadedResources.has(url)) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.preloadedResources.add(url);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`);
          resolve(); // Don't fail the entire preload process
        };
        img.src = url;
      });
    });

    await Promise.all(promises);
  }

  async preloadLibraries(scripts: { src: string; async?: boolean }[]): Promise<void> {
    const promises = scripts.map((script) => {
      if (this.preloadedResources.has(script.src)) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        const scriptElement = document.createElement('script');
        scriptElement.src = script.src;
        scriptElement.async = script.async !== false;

        scriptElement.onload = () => {
          this.preloadedResources.add(script.src);
          resolve();
        };

        scriptElement.onerror = () => {
          reject(new Error(`Failed to load script: ${script.src}`));
        };

        document.head.appendChild(scriptElement);
      });
    });

    await Promise.allSettled(promises); // Don't fail if some scripts fail
  }
}

/**
 * Performance monitoring and reporting
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private startTimes = new Map<string, number>();

  startTiming(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time recorded for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;

    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }

    this.metrics.get(label)!.push(duration);
    this.startTimes.delete(label);

    return duration;
  }

  getMetrics(label: string) {
    const times = this.metrics.get(label) || [];

    if (times.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }

    return {
      count: times.length,
      avg: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }

  reportMetrics(): void {
    console.group('ClearLane Performance Metrics');

    this.metrics.forEach((times, label) => {
      const stats = this.getMetrics(label);
      console.log(`${label}: ${stats.avg.toFixed(2)}ms avg (${stats.count} samples)`);
    });

    // Core Web Vitals if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log(`${entry.name}: ${entry.value?.toFixed(2)}ms`);
          });
        });

        observer.observe({ entryTypes: ['paint', 'navigation'] });
      } catch (error) {
        console.warn('Performance observation failed:', error);
      }
    }

    console.groupEnd();
  }

  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Global instances
export const lazyLoadManager = new LazyLoadManager();
export const dataChunkManager = new DataChunkManager();
export const dataProcessor = new DataProcessor();
export const resourcePreloader = new ResourcePreloader();
export const performanceMonitor = new PerformanceMonitor();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  lazyLoadManager.disconnect();
  dataProcessor.destroy();
});

// Auto-report metrics in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => performanceMonitor.reportMetrics(), 2000);
  });
}