/**
 * Mobile optimization utilities for ClearLane data visualizations
 * Ensures excellent touch experience and responsive performance
 */

export interface MobileConfig {
  touchEnabled: boolean;
  gestureSupport: boolean;
  adaptiveUI: boolean;
  performanceOptimized: boolean;
}

export const DEFAULT_MOBILE_CONFIG: MobileConfig = {
  touchEnabled: true,
  gestureSupport: true,
  adaptiveUI: true,
  performanceOptimized: true,
};

/**
 * Touch interaction manager for data visualizations
 */
export class TouchInteractionManager {
  private element: HTMLElement;
  private config: MobileConfig;
  private touchState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    lastTapTime: 0,
    touchCount: 0,
    isScrolling: false,
    isPinching: false,
  };

  private gestureCallbacks = {
    tap: [] as Array<(e: TouchEvent) => void>,
    doubleTap: [] as Array<(e: TouchEvent) => void>,
    longPress: [] as Array<(e: TouchEvent) => void>,
    swipe: [] as Array<(direction: string, distance: number) => void>,
    pinch: [] as Array<(scale: number) => void>,
    pan: [] as Array<(deltaX: number, deltaY: number) => void>,
  };

  private longPressTimer: number | null = null;
  private doubleTapTimer: number | null = null;

  constructor(element: HTMLElement, config: Partial<MobileConfig> = {}) {
    this.element = element;
    this.config = { ...DEFAULT_MOBILE_CONFIG, ...config };

    if (this.config.touchEnabled) {
      this.initTouchHandlers();
    }
  }

  private initTouchHandlers(): void {
    // Prevent default touch behaviors that interfere with custom gestures
    this.element.style.touchAction = 'manipulation';

    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: false,
    });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));

    // Add visual feedback for touch interactions
    this.addTouchFeedback();
  }

  private addTouchFeedback(): void {
    this.element.addEventListener('touchstart', () => {
      this.element.classList.add('touch-active');
    });

    this.element.addEventListener('touchend', () => {
      setTimeout(() => {
        this.element.classList.remove('touch-active');
      }, 100);
    });
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    const now = Date.now();

    this.touchState = {
      ...this.touchState,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      touchCount: e.touches.length,
      isScrolling: false,
      isPinching: e.touches.length > 1,
    };

    // Long press detection
    this.longPressTimer = window.setTimeout(() => {
      if (!this.touchState.isScrolling) {
        this.triggerCallback('longPress', e);
      }
    }, 500);

    // Double tap detection
    if (now - this.touchState.lastTapTime < 300) {
      this.clearTimeout(this.doubleTapTimer);
      this.triggerCallback('doubleTap', e);
    } else {
      this.doubleTapTimer = window.setTimeout(() => {
        // Single tap after delay
        if (!this.touchState.isScrolling) {
          this.triggerCallback('tap', e);
        }
      }, 300);
    }

    this.touchState.lastTapTime = now;
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault(); // Prevent scrolling during chart interaction

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchState.startX;
    const deltaY = touch.clientY - this.touchState.startY;

    this.touchState.currentX = touch.clientX;
    this.touchState.currentY = touch.clientY;

    // Detect if user is scrolling (small movements don't count as scrolling)
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      this.touchState.isScrolling = true;
      this.clearTimeout(this.longPressTimer);
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && this.config.gestureSupport) {
      this.handlePinchGesture(e);
      return;
    }

    // Handle pan gesture
    if (this.touchState.isScrolling && this.gestureCallbacks.pan.length > 0) {
      this.triggerCallback('pan', deltaX, deltaY);
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    this.clearTimeout(this.longPressTimer);

    const deltaX = this.touchState.currentX - this.touchState.startX;
    const deltaY = this.touchState.currentY - this.touchState.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Detect swipe gesture
    if (distance > 50 && this.touchState.isScrolling) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      this.triggerCallback('swipe', direction, distance);
    }

    // Reset touch state
    this.touchState.isPinching = false;
    this.touchState.touchCount = 0;
  }

  private handleTouchCancel(): void {
    this.clearTimeout(this.longPressTimer);
    this.clearTimeout(this.doubleTapTimer);
  }

  private handlePinchGesture(e: TouchEvent): void {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    // Store initial distance on first pinch
    if (!this.touchState.isPinching) {
      this.touchState.isPinching = true;
      (this.touchState as any).initialPinchDistance = currentDistance;
      return;
    }

    const scale = currentDistance / (this.touchState as any).initialPinchDistance;
    this.triggerCallback('pinch', scale);
  }

  private getSwipeDirection(deltaX: number, deltaY: number): string {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  private clearTimeout(timer: number | null): void {
    if (timer) {
      window.clearTimeout(timer);
    }
  }

  private triggerCallback(gesture: keyof typeof this.gestureCallbacks, ...args: any[]): void {
    this.gestureCallbacks[gesture].forEach(callback => {
      try {
        callback.apply(null, args);
      } catch (error) {
        console.error(`Error in ${gesture} callback:`, error);
      }
    });
  }

  // Public API for registering gesture callbacks
  onTap(callback: (e: TouchEvent) => void): void {
    this.gestureCallbacks.tap.push(callback);
  }

  onDoubleTap(callback: (e: TouchEvent) => void): void {
    this.gestureCallbacks.doubleTap.push(callback);
  }

  onLongPress(callback: (e: TouchEvent) => void): void {
    this.gestureCallbacks.longPress.push(callback);
  }

  onSwipe(callback: (direction: string, distance: number) => void): void {
    this.gestureCallbacks.swipe.push(callback);
  }

  onPinch(callback: (scale: number) => void): void {
    this.gestureCallbacks.pinch.push(callback);
  }

  onPan(callback: (deltaX: number, deltaY: number) => void): void {
    this.gestureCallbacks.pan.push(callback);
  }
}

/**
 * Responsive UI adapter for different screen sizes
 */
export class ResponsiveUIAdapter {
  private breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
  };

  private currentBreakpoint = 'desktop';
  private adaptationCallbacks: Array<(breakpoint: string) => void> = [];

  constructor() {
    this.detectBreakpoint();
    this.setupResizeListener();
  }

  private detectBreakpoint(): void {
    const width = window.innerWidth;
    let newBreakpoint = 'desktop';

    if (width <= this.breakpoints.mobile) {
      newBreakpoint = 'mobile';
    } else if (width <= this.breakpoints.tablet) {
      newBreakpoint = 'tablet';
    }

    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      this.triggerAdaptations();
    }
  }

  private setupResizeListener(): void {
    let resizeTimer: number;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        this.detectBreakpoint();
      }, 250);
    });
  }

  private triggerAdaptations(): void {
    this.adaptationCallbacks.forEach(callback => {
      try {
        callback(this.currentBreakpoint);
      } catch (error) {
        console.error('Error in responsive adaptation:', error);
      }
    });

    // Update CSS custom property for responsive styling
    document.documentElement.style.setProperty('--current-breakpoint', this.currentBreakpoint);
  }

  onBreakpointChange(callback: (breakpoint: string) => void): void {
    this.adaptationCallbacks.push(callback);
    // Trigger immediately for current state
    callback(this.currentBreakpoint);
  }

  getCurrentBreakpoint(): string {
    return this.currentBreakpoint;
  }

  isMobile(): boolean {
    return this.currentBreakpoint === 'mobile';
  }

  isTablet(): boolean {
    return this.currentBreakpoint === 'tablet';
  }

  isDesktop(): boolean {
    return this.currentBreakpoint === 'desktop';
  }

  // Adaptive UI helpers
  getOptimalChartHeight(): number {
    switch (this.currentBreakpoint) {
      case 'mobile':
        return 250;
      case 'tablet':
        return 350;
      default:
        return 450;
    }
  }

  getOptimalFontSize(): number {
    switch (this.currentBreakpoint) {
      case 'mobile':
        return 12;
      case 'tablet':
        return 14;
      default:
        return 16;
    }
  }

  shouldUseMobileLayout(): boolean {
    return this.currentBreakpoint === 'mobile';
  }

  shouldSimplifyCharts(): boolean {
    return this.currentBreakpoint === 'mobile';
  }
}

/**
 * Mobile-specific chart optimizations
 */
export class MobileChartOptimizer {
  private static readonly MOBILE_PERFORMANCE_THRESHOLDS = {
    maxDataPoints: 500,
    animationDuration: 300,
    updateThrottling: 100,
  };

  static optimizeDataForMobile<T>(data: T[], maxPoints?: number): T[] {
    const limit = maxPoints || this.MOBILE_PERFORMANCE_THRESHOLDS.maxDataPoints;

    if (data.length <= limit) {
      return data;
    }

    // Sample data points evenly across the dataset
    const step = Math.floor(data.length / limit);
    const optimized: T[] = [];

    for (let i = 0; i < data.length; i += step) {
      optimized.push(data[i]);
    }

    // Always include the last data point
    if (optimized[optimized.length - 1] !== data[data.length - 1]) {
      optimized.push(data[data.length - 1]);
    }

    return optimized;
  }

  static getMobileAnimationConfig(): { duration: number; easing: string } {
    return {
      duration: this.MOBILE_PERFORMANCE_THRESHOLDS.animationDuration,
      easing: 'ease-out',
    };
  }

  static createMobileFriendlyTooltip(content: string): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'mobile-tooltip';
    tooltip.innerHTML = content;

    // Make tooltip touch-friendly
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      max-width: 250px;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transform: translateX(-50%);
    `;

    return tooltip;
  }

  static addMobileTouchTargets(element: HTMLElement): void {
    // Ensure touch targets are at least 44x44px (iOS guideline)
    const touchElements = element.querySelectorAll('button, [role="button"], .interactive');

    touchElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computed = getComputedStyle(htmlEl);
      const width = parseFloat(computed.width);
      const height = parseFloat(computed.height);

      if (width < 44 || height < 44) {
        htmlEl.style.minWidth = '44px';
        htmlEl.style.minHeight = '44px';
        htmlEl.style.display = 'inline-flex';
        htmlEl.style.alignItems = 'center';
        htmlEl.style.justifyContent = 'center';
      }
    });
  }
}

/**
 * Performance monitor for mobile devices
 */
export class MobilePerformanceMonitor {
  private static readonly PERFORMANCE_BUDGET = {
    memory: 50 * 1024 * 1024, // 50MB
    fps: 30, // minimum FPS
    loadTime: 3000, // 3 seconds
  };

  private memoryUsage: number = 0;
  private frameRate: number = 60;
  private loadStartTime: number = 0;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.loadStartTime = performance.now();

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      this.monitorMemory();
    }

    // Monitor frame rate
    this.monitorFrameRate();

    // Monitor load time
    window.addEventListener('load', () => {
      this.checkLoadTime();
    });
  }

  private monitorMemory(): void {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize;

      if (this.memoryUsage > MobilePerformanceMonitor.PERFORMANCE_BUDGET.memory) {
        console.warn('Memory usage exceeding mobile budget:', this.memoryUsage / 1024 / 1024, 'MB');
        this.triggerPerformanceWarning('memory');
      }
    };

    // Check memory every 5 seconds
    setInterval(checkMemory, 5000);
    checkMemory();
  }

  private monitorFrameRate(): void {
    let lastTime = performance.now();
    let frameCount = 0;

    const countFrames = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        this.frameRate = Math.round((frameCount * 1000) / (currentTime - lastTime));

        if (this.frameRate < MobilePerformanceMonitor.PERFORMANCE_BUDGET.fps) {
          this.triggerPerformanceWarning('fps');
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(countFrames);
    };

    requestAnimationFrame(countFrames);
  }

  private checkLoadTime(): void {
    const loadTime = performance.now() - this.loadStartTime;

    if (loadTime > MobilePerformanceMonitor.PERFORMANCE_BUDGET.loadTime) {
      this.triggerPerformanceWarning('loadTime');
    }
  }

  private triggerPerformanceWarning(metric: string): void {
    const event = new CustomEvent('mobile-performance-warning', {
      detail: {
        metric,
        value: metric === 'memory' ? this.memoryUsage :
               metric === 'fps' ? this.frameRate :
               performance.now() - this.loadStartTime
      }
    });

    document.dispatchEvent(event);
  }

  getMetrics() {
    return {
      memory: this.memoryUsage,
      frameRate: this.frameRate,
      loadTime: performance.now() - this.loadStartTime,
    };
  }
}

/**
 * Mobile-specific loading states and feedback
 */
export class MobileLoadingManager {
  static showMobileSpinner(container: HTMLElement, message = 'Loading...'): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'mobile-loading-spinner';
    spinner.innerHTML = `
      <div class="spinner-ring"></div>
      <div class="spinner-message">${message}</div>
    `;

    spinner.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      z-index: 1000;
    `;

    const ring = spinner.querySelector('.spinner-ring') as HTMLElement;
    ring.style.cssText = `
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #2563eb;
      border-radius: 50%;
      animation: mobile-spin 1s linear infinite;
    `;

    const message_el = spinner.querySelector('.spinner-message') as HTMLElement;
    message_el.style.cssText = `
      font-size: 14px;
      color: #666;
      text-align: center;
    `;

    // Add CSS animation
    if (!document.getElementById('mobile-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-spinner-styles';
      style.textContent = `
        @keyframes mobile-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(spinner);
    return spinner;
  }

  static hideMobileSpinner(container: HTMLElement): void {
    const spinner = container.querySelector('.mobile-loading-spinner');
    if (spinner) {
      container.removeChild(spinner);
    }
  }

  static showMobileToast(message: string, duration = 3000): void {
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = message;

    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      z-index: 10000;
      animation: mobile-toast-in 0.3s ease-out;
    `;

    // Add toast animation
    if (!document.getElementById('mobile-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-toast-styles';
      style.textContent = `
        @keyframes mobile-toast-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, duration);
  }
}

// Global instances
export const responsiveUIAdapter = new ResponsiveUIAdapter();
export const mobilePerformanceMonitor = new MobilePerformanceMonitor();

// Auto-initialize mobile optimizations
document.addEventListener('DOMContentLoaded', () => {
  // Add mobile class to body for CSS targeting
  responsiveUIAdapter.onBreakpointChange((breakpoint) => {
    document.body.className = document.body.className.replace(
      /\bmobile\b|\btablet\b|\bdesktop\b/g,
      ''
    );
    document.body.classList.add(breakpoint);
  });

  // Initialize touch interactions for chart elements
  const chartElements = document.querySelectorAll('[data-chart-id]');
  chartElements.forEach((element) => {
    if (element instanceof HTMLElement && responsiveUIAdapter.isMobile()) {
      const touchManager = new TouchInteractionManager(element);

      // Basic touch interactions for charts
      touchManager.onTap(() => {
        // Handle chart tap
        element.focus();
      });

      touchManager.onDoubleTap(() => {
        // Reset chart view
        const event = new CustomEvent('chart-reset', { bubbles: true });
        element.dispatchEvent(event);
      });

      touchManager.onLongPress(() => {
        // Show context menu or additional options
        const event = new CustomEvent('chart-context', { bubbles: true });
        element.dispatchEvent(event);
      });
    }
  });

  // Performance warning handling
  document.addEventListener('mobile-performance-warning', (e: any) => {
    const { metric, value } = e.detail;
    console.warn(`Mobile performance warning: ${metric}`, value);

    // Show user-friendly warning for severe performance issues
    if (metric === 'fps' && value < 15) {
      MobileLoadingManager.showMobileToast(
        'Performance is low. Some animations have been disabled.',
        5000
      );
    }
  });
});