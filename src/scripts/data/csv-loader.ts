/**
 * CSV Data Loading Strategy for ClearLane Initiative
 * Progressive loading with caching and error handling
 */

import Papa from 'papaparse';
import { DATASETS, LOADING_PRIORITIES, type DatasetConfig } from '../../data/datasets';

interface CachedData<T = any> {
  data: T[];
  timestamp: number;
  ttl: number;
}

interface LoaderOptions {
  useCache?: boolean;
  transform?: (row: any) => any;
  filter?: (row: any) => boolean;
  limit?: number;
  skipRows?: number;
}

class CSVDataLoader {
  private cache = new Map<string, CachedData>();
  private loadingPromises = new Map<string, Promise<any[]>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Load CSV data with caching and progressive enhancement
   */
  async loadDataset(
    datasetKey: keyof typeof DATASETS,
    options: LoaderOptions = {}
  ): Promise<any[]> {
    const config = DATASETS[datasetKey];
    if (!config) {
      throw new Error(`Dataset ${datasetKey} not found in configuration`);
    }

    const cacheKey = `${datasetKey}_${JSON.stringify(options)}`;

    // Check cache first
    if (options.useCache !== false) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Start loading
    const loadPromise = this.performLoad(config, options);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;

      // Cache the result
      if (options.useCache !== false && data.length > 0) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: this.CACHE_TTL
        });
      }

      this.loadingPromises.delete(cacheKey);
      return data;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Perform the actual CSV loading and parsing
   */
  private async performLoad(config: DatasetConfig, options: LoaderOptions): Promise<any[]> {
    try {
      console.log(`Loading dataset: ${config.name} from ${config.path}`);

      const response = await fetch(config.path);
      if (!response.ok) {
        throw new Error(`Failed to load ${config.name}: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: options.transform,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn(`CSV parsing warnings for ${config.name}:`, results.errors);
            }

            let data = results.data;

            // Apply filter if provided
            if (options.filter) {
              data = data.filter(options.filter);
            }

            // Apply limit if provided
            if (options.limit) {
              data = data.slice(options.skipRows || 0, (options.skipRows || 0) + options.limit);
            }

            console.log(`Loaded ${data.length} rows from ${config.name}`);
            resolve(data);
          },
          error: (error) => {
            console.error(`Error parsing CSV for ${config.name}:`, error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`Failed to load dataset ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Load multiple datasets concurrently
   */
  async loadMultiple(
    datasetKeys: Array<keyof typeof DATASETS>,
    options: LoaderOptions = {}
  ): Promise<Record<string, any[]>> {
    const loadPromises = datasetKeys.map(async (key) => {
      const data = await this.loadDataset(key, options);
      return { key, data };
    });

    const results = await Promise.allSettled(loadPromises);
    const successfulResults: Record<string, any[]> = {};

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults[result.value.key] = result.value.data;
      } else {
        console.error(`Failed to load dataset ${datasetKeys[index]}:`, result.reason);
      }
    });

    return successfulResults;
  }

  /**
   * Progressive loading strategy based on priorities
   */
  async loadByPriority(priority: keyof typeof LOADING_PRIORITIES): Promise<Record<string, any[]>> {
    const datasetKeys = LOADING_PRIORITIES[priority];
    return this.loadMultiple(datasetKeys as Array<keyof typeof DATASETS>);
  }

  /**
   * Load critical data for hero section and initial page load
   */
  async loadCriticalData(): Promise<{
    topRoutes: any[];
    hourlyPatterns: any[];
    monthlyTrends: any[];
  }> {
    const data = await this.loadByPriority('CRITICAL');

    return {
      topRoutes: data.TOP_ROUTES || [],
      hourlyPatterns: data.HOURLY_PATTERNS || [],
      monthlyTrends: data.MONTHLY_TRENDS || []
    };
  }

  /**
   * Get data from cache if still valid
   */
  private getFromCache(key: string): any[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('CSV data cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const csvLoader = new CSVDataLoader();

/**
 * Convenience functions for common data loading patterns
 */

// Load data for temporal heatmap (study hall analysis)
export async function loadTemporalData() {
  const data = await csvLoader.loadMultiple(['HOURLY_PATTERNS', 'WEEKDAY_PATTERNS']);

  return {
    hourlyData: data.HOURLY_PATTERNS || [],
    weeklyData: data.WEEKDAY_PATTERNS || []
  };
}

// Load data for geographic visualizations (CUNY proximity analysis)
export async function loadGeographicData() {
  const data = await csvLoader.loadMultiple(['VIOLATION_HOTSPOTS', 'ROUTE_PATHS']);

  return {
    hotspots: data.VIOLATION_HOTSPOTS || [],
    routePaths: data.ROUTE_PATHS || []
  };
}

// Load route-specific analysis data
export async function loadRouteAnalysis(routeId?: string) {
  const options: LoaderOptions = {};

  if (routeId) {
    options.filter = (row) => row.bus_route_id === routeId || row['Route ID'] === routeId;
  }

  const data = await csvLoader.loadMultiple(['TOP_ROUTES_ACE', 'ROUTE_COUNTS'], options);

  return {
    aceAnalysis: data.TOP_ROUTES_ACE || [],
    routeCounts: data.ROUTE_COUNTS || []
  };
}

// Transform functions for specific data types
export const DataTransforms = {
  // Convert violation counts to numbers
  violations: (row: any) => ({
    ...row,
    violations: parseInt(row.violations) || 0
  }),

  // Parse coordinates for mapping
  coordinates: (row: any) => ({
    ...row,
    lat: parseFloat(row.avg_lat) || 0,
    lng: parseFloat(row.avg_lon) || 0,
    violations: parseInt(row.violations) || 0
  }),

  // Parse temporal data
  temporal: (row: any) => ({
    ...row,
    hour: parseInt(row.hour) || 0,
    violations: parseInt(row.violations) || 0,
    weekday: row.weekday
  }),

  // Parse route performance data
  routePerformance: (row: any) => ({
    ...row,
    routeId: row['Route ID'] || row.route_id,
    speedBefore: parseFloat(row.False) || 0,
    speedAfter: parseFloat(row.True) || 0,
    percentChange: parseFloat(row['Pct Change']) || 0
  })
};

export default csvLoader;