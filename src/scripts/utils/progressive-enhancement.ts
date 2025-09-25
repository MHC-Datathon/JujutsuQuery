/**
 * Progressive Enhancement utilities for ClearLane Initiative
 * Ensures core functionality works without JavaScript, enhanced with JS
 */

export interface ProgressiveConfig {
  enableAnimations: boolean;
  enableInteractivity: boolean;
  enableAdvancedFeatures: boolean;
  fallbackToStatic: boolean;
}

export const DEFAULT_PROGRESSIVE_CONFIG: ProgressiveConfig = {
  enableAnimations: true,
  enableInteractivity: true,
  enableAdvancedFeatures: true,
  fallbackToStatic: true,
};

/**
 * Feature detection and progressive enhancement manager
 */
export class ProgressiveEnhancementManager {
  private features = {
    javascript: true,
    svg: false,
    canvas: false,
    webgl: false,
    intersectionObserver: false,
    webWorkers: false,
    localStorage: false,
    fetch: false,
    css: {
      grid: false,
      flexbox: false,
      customProperties: false,
      transforms: false,
    }
  };

  private config: ProgressiveConfig;
  private enhancementLevel: 'basic' | 'enhanced' | 'advanced' = 'basic';

  constructor(config: Partial<ProgressiveConfig> = {}) {
    this.config = { ...DEFAULT_PROGRESSIVE_CONFIG, ...config };
    this.detectFeatures();
    this.determineEnhancementLevel();
    this.applyEnhancements();
  }

  private detectFeatures(): void {
    // SVG Support
    this.features.svg = !!(
      document.createElementNS &&
      document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect
    );

    // Canvas Support
    this.features.canvas = !!document.createElement('canvas').getContext;

    // WebGL Support
    if (this.features.canvas) {
      try {
        const canvas = document.createElement('canvas');
        this.features.webgl = !!(
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl')
        );
      } catch (e) {
        this.features.webgl = false;
      }
    }

    // Intersection Observer
    this.features.intersectionObserver = 'IntersectionObserver' in window;

    // Web Workers
    this.features.webWorkers = typeof Worker !== 'undefined';

    // Local Storage
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this.features.localStorage = true;
    } catch (e) {
      this.features.localStorage = false;
    }

    // Fetch API
    this.features.fetch = 'fetch' in window;

    // CSS Features
    this.detectCSSFeatures();
  }

  private detectCSSFeatures(): void {
    const testElement = document.createElement('div');
    const style = testElement.style;

    // CSS Grid
    this.features.css.grid = 'grid' in style || 'msGrid' in style;

    // Flexbox
    this.features.css.flexbox =
      'flex' in style ||
      'webkitFlex' in style ||
      'msFlex' in style;

    // Custom Properties
    this.features.css.customProperties =
      window.CSS && window.CSS.supports &&
      window.CSS.supports('(--foo: red)');

    // 3D Transforms
    this.features.css.transforms =
      'transform' in style ||
      'webkitTransform' in style;
  }

  private determineEnhancementLevel(): void {
    if (this.features.svg && this.features.canvas && this.features.intersectionObserver) {
      if (this.features.webgl && this.features.webWorkers) {
        this.enhancementLevel = 'advanced';
      } else {
        this.enhancementLevel = 'enhanced';
      }
    } else {
      this.enhancementLevel = 'basic';
    }

    console.log(`Progressive Enhancement Level: ${this.enhancementLevel}`);
  }

  private applyEnhancements(): void {
    // Set CSS class for styling hooks
    document.documentElement.classList.add(`pe-${this.enhancementLevel}`);

    // Set feature classes
    Object.entries(this.features).forEach(([feature, supported]) => {
      if (typeof supported === 'boolean') {
        const className = supported ? `pe-${feature}` : `pe-no-${feature}`;
        document.documentElement.classList.add(className);
      } else if (typeof supported === 'object') {
        // Handle nested objects like CSS features
        Object.entries(supported).forEach(([subfeature, subsupported]) => {
          const className = subsupported ?
            `pe-${feature}-${subfeature}` :
            `pe-no-${feature}-${subfeature}`;
          document.documentElement.classList.add(className);
        });
      }
    });
  }

  getEnhancementLevel(): string {
    return this.enhancementLevel;
  }

  hasFeature(feature: string): boolean {
    const keys = feature.split('.');
    let current: any = this.features;

    for (const key of keys) {
      if (current[key] === undefined) return false;
      current = current[key];
    }

    return !!current;
  }

  getFeatures() {
    return { ...this.features };
  }
}

/**
 * Graceful degradation handler for chart components
 */
export class ChartGracefulDegradation {
  private static readonly FALLBACK_STRATEGIES = {
    'interactive-chart': 'static-image',
    'animated-chart': 'static-chart',
    'complex-visualization': 'data-table',
    '3d-chart': '2d-chart',
  };

  static enhanceChart(
    container: HTMLElement,
    chartType: string,
    enhancementLevel: string
  ): void {
    const fallbackContent = container.querySelector('.chart-fallback');
    const enhancedContent = container.querySelector('.chart-enhanced');

    switch (enhancementLevel) {
      case 'advanced':
        this.enableAdvancedFeatures(container, chartType);
        break;
      case 'enhanced':
        this.enableBasicInteractivity(container, chartType);
        break;
      case 'basic':
      default:
        this.useStaticFallback(container);
        break;
    }

    // Hide fallback content if enhancement succeeds
    if (enhancedContent && enhancementLevel !== 'basic') {
      fallbackContent?.setAttribute('aria-hidden', 'true');
      fallbackContent?.setAttribute('hidden', '');
      enhancedContent.removeAttribute('aria-hidden');
      enhancedContent.removeAttribute('hidden');
    }
  }

  private static enableAdvancedFeatures(container: HTMLElement, chartType: string): void {
    // Enable all features: animations, interactions, advanced visuals
    container.classList.add('pe-advanced');

    // Dispatch event for chart components to initialize advanced features
    const event = new CustomEvent('chart-enhance', {
      detail: {
        level: 'advanced',
        features: ['animations', 'interactions', 'webgl', 'workers']
      }
    });
    container.dispatchEvent(event);
  }

  private static enableBasicInteractivity(container: HTMLElement, chartType: string): void {
    // Enable basic interactions but limited animations
    container.classList.add('pe-enhanced');

    const event = new CustomEvent('chart-enhance', {
      detail: {
        level: 'enhanced',
        features: ['basic-interactions', 'hover-effects']
      }
    });
    container.dispatchEvent(event);
  }

  private static useStaticFallback(container: HTMLElement): void {
    // Use static content, disable all enhancements
    container.classList.add('pe-basic');

    const staticElements = container.querySelectorAll('.static-only');
    staticElements.forEach(el => {
      el.removeAttribute('hidden');
      el.removeAttribute('aria-hidden');
    });

    // Show data table alternative if available
    const dataTable = container.querySelector('.chart-data-table');
    if (dataTable) {
      dataTable.removeAttribute('hidden');
    }
  }
}

/**
 * No-JavaScript fallback handler
 */
export class NoScriptFallbackManager {
  static generateNoScriptContent(chartType: string, data: any[]): string {
    switch (chartType) {
      case 'temporal-chart':
        return this.generateTemporalFallback(data);
      case 'heatmap':
        return this.generateHeatmapFallback(data);
      case 'bar-chart':
        return this.generateBarChartFallback(data);
      default:
        return this.generateGenericFallback(data);
    }
  }

  private static generateTemporalFallback(data: any[]): string {
    const table = this.createTable(
      'Violations by Hour and Day',
      ['Day', 'Peak Hour', 'Total Violations'],
      data.map(d => [d.weekday, `${d.hour}:00`, d.violations.toLocaleString()])
    );

    return `
      <noscript>
        <div class="noscript-fallback">
          <h3>Temporal Analysis - Static View</h3>
          <p>This interactive chart shows violation patterns throughout the week. JavaScript is required for the full interactive experience.</p>
          ${table}
          <p><strong>Key Finding:</strong> Peak violations occur during weekday morning hours (7-10 AM), directly impacting student commutes.</p>
        </div>
      </noscript>
    `;
  }

  private static generateHeatmapFallback(data: any[]): string {
    const topHotspots = data.slice(0, 10);
    const table = this.createTable(
      'Top Violation Hotspots',
      ['Rank', 'Location', 'Violations'],
      topHotspots.map((spot, i) => [
        (i + 1).toString(),
        spot.stop_name,
        spot.violations.toLocaleString()
      ])
    );

    return `
      <noscript>
        <div class="noscript-fallback">
          <h3>Geographic Hotspots - Static View</h3>
          <p>This interactive map shows violation concentrations across NYC. JavaScript is required for the full interactive experience.</p>
          ${table}
          <p><strong>Key Finding:</strong> Violations are highly concentrated at specific locations, with the top 10 locations accounting for over 40% of all violations.</p>
        </div>
      </noscript>
    `;
  }

  private static generateBarChartFallback(data: any[]): string {
    const table = this.createTable(
      'Chart Data',
      ['Category', 'Value'],
      data.map(d => [d.label || d.name, d.value.toLocaleString()])
    );

    return `
      <noscript>
        <div class="noscript-fallback">
          <h3>Data Visualization - Static View</h3>
          <p>This interactive chart displays the data below. JavaScript is required for the full interactive experience.</p>
          ${table}
        </div>
      </noscript>
    `;
  }

  private static generateGenericFallback(data: any[]): string {
    return `
      <noscript>
        <div class="noscript-fallback">
          <h3>Data Visualization - Static View</h3>
          <p>This page contains interactive data visualizations that require JavaScript. Please enable JavaScript for the full experience.</p>
          <p>Data summary: ${data.length} records available for analysis.</p>
          <p><a href="#data-tables">View data in accessible table format</a></p>
        </div>
      </noscript>
    `;
  }

  private static createTable(caption: string, headers: string[], rows: string[][]): string {
    const headerHtml = headers.map(h => `<th scope="col">${h}</th>`).join('');
    const rowsHtml = rows.map(row =>
      `<tr>${row.map((cell, i) =>
        i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`
      ).join('')}</tr>`
    ).join('');

    return `
      <table class="fallback-table">
        <caption>${caption}</caption>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }
}

/**
 * Service Worker integration for offline functionality
 */
export class OfflineEnhancementManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async init(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        this.handleServiceWorkerUpdate();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private handleServiceWorkerUpdate(): void {
    if (!this.swRegistration) return;

    const newWorker = this.swRegistration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New content available
        this.showUpdateNotification();
      }
    });
  }

  private showUpdateNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <p>New content is available. Refresh to get the latest data.</p>
        <button onclick="window.location.reload()">Refresh</button>
        <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #2563eb;
      color: white;
      padding: 1rem;
      z-index: 10000;
      text-align: center;
    `;

    document.body.prepend(notification);
  }

  async cacheVisualizationData(urls: string[]): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open('clearlane-data-v1');
      await cache.addAll(urls);
      console.log('Visualization data cached for offline use');
    } catch (error) {
      console.error('Failed to cache visualization data:', error);
    }
  }
}

/**
 * Performance-based feature toggling
 */
export class AdaptiveFeatureManager {
  private performanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    devicePixelRatio: window.devicePixelRatio || 1,
  };

  private featureToggles = {
    animations: true,
    complexVisuals: true,
    realTimeUpdates: true,
    highResolution: true,
  };

  constructor() {
    this.measureInitialPerformance();
    this.adaptFeatures();
  }

  private measureInitialPerformance(): void {
    // Measure load time
    window.addEventListener('load', () => {
      this.performanceMetrics.loadTime = performance.now();
    });

    // Measure memory if available
    if ('memory' in performance) {
      this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Measure render performance
    this.measureRenderPerformance();
  }

  private measureRenderPerformance(): void {
    let frameCount = 0;
    let startTime = performance.now();

    const measureFrames = () => {
      frameCount++;

      if (frameCount === 60) { // Measure over 60 frames
        const endTime = performance.now();
        this.performanceMetrics.renderTime = (endTime - startTime) / 60;
        this.adaptFeatures();
      } else if (frameCount < 60) {
        requestAnimationFrame(measureFrames);
      }
    };

    requestAnimationFrame(measureFrames);
  }

  private adaptFeatures(): void {
    const isLowPerformance =
      this.performanceMetrics.loadTime > 5000 ||
      this.performanceMetrics.renderTime > 16.67 || // Below 60fps
      this.performanceMetrics.memoryUsage > 100 * 1024 * 1024; // Over 100MB

    const isHighDPI = this.performanceMetrics.devicePixelRatio > 1.5;

    if (isLowPerformance) {
      this.featureToggles.animations = false;
      this.featureToggles.complexVisuals = false;
      this.featureToggles.realTimeUpdates = false;

      document.documentElement.classList.add('pe-low-performance');
    }

    if (!isHighDPI) {
      this.featureToggles.highResolution = false;
    }

    // Communicate feature state to components
    const event = new CustomEvent('adaptive-features-updated', {
      detail: this.featureToggles
    });
    document.dispatchEvent(event);
  }

  getFeatureToggles() {
    return { ...this.featureToggles };
  }

  shouldUseFeature(feature: keyof typeof this.featureToggles): boolean {
    return this.featureToggles[feature];
  }
}

// Global instances
export const progressiveEnhancementManager = new ProgressiveEnhancementManager();
export const offlineEnhancementManager = new OfflineEnhancementManager();
export const adaptiveFeatureManager = new AdaptiveFeatureManager();

// Initialize progressive enhancement
document.addEventListener('DOMContentLoaded', () => {
  // Enhance all chart containers based on capabilities
  const chartContainers = document.querySelectorAll('[data-chart-type]');
  chartContainers.forEach((container) => {
    if (container instanceof HTMLElement) {
      const chartType = container.getAttribute('data-chart-type') || 'generic';
      ChartGracefulDegradation.enhanceChart(
        container,
        chartType,
        progressiveEnhancementManager.getEnhancementLevel()
      );
    }
  });

  // Initialize offline support
  offlineEnhancementManager.init();

  // Add CSS for noscript fallbacks
  if (!document.getElementById('noscript-styles')) {
    const style = document.createElement('style');
    style.id = 'noscript-styles';
    style.textContent = `
      .noscript-fallback {
        padding: 2rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        background: #f9fafb;
        margin: 1rem 0;
      }

      .fallback-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }

      .fallback-table th,
      .fallback-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }

      .fallback-table th {
        background: #f3f4f6;
        font-weight: 600;
      }

      .fallback-table tbody tr:hover {
        background: #f9fafb;
      }

      /* Low performance adaptations */
      .pe-low-performance * {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }

      .pe-low-performance .complex-visual {
        display: none;
      }

      .pe-low-performance .simplified-visual {
        display: block;
      }
    `;
    document.head.appendChild(style);
  }
});

// Export utilities for use in components
export { ChartGracefulDegradation, NoScriptFallbackManager };