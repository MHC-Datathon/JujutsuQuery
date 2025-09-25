/**
 * Accessibility utilities for ClearLane data visualizations
 * Ensures WCAG 2.1 AA compliance and screen reader support
 */

export interface AccessibilityConfig {
  announceUpdates: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderSupport: boolean;
}

export const DEFAULT_A11Y_CONFIG: AccessibilityConfig = {
  announceUpdates: true,
  keyboardNavigation: true,
  highContrast: false,
  reducedMotion: false,
  screenReaderSupport: true,
};

/**
 * ARIA Live Region Manager for announcing dynamic content changes
 */
export class LiveRegionManager {
  private liveRegion: HTMLElement;
  private politenessLevel: 'polite' | 'assertive';

  constructor(politenessLevel: 'polite' | 'assertive' = 'polite') {
    this.politenessLevel = politenessLevel;
    this.liveRegion = this.createLiveRegion();
  }

  private createLiveRegion(): HTMLElement {
    const existing = document.getElementById('chart-live-region');
    if (existing) return existing;

    const liveRegion = document.createElement('div');
    liveRegion.id = 'chart-live-region';
    liveRegion.setAttribute('aria-live', this.politenessLevel);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');

    // Make it invisible but accessible to screen readers
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  announce(message: string, delay = 100): void {
    // Small delay to ensure screen readers pick up the change
    setTimeout(() => {
      this.liveRegion.textContent = message;

      // Clear after announcement to avoid repetition
      setTimeout(() => {
        this.liveRegion.textContent = '';
      }, 1000);
    }, delay);
  }

  announceDataUpdate(chartType: string, recordCount: number): void {
    this.announce(
      `${chartType} chart updated with ${recordCount.toLocaleString()} data points`
    );
  }

  announceFilterChange(filterType: string, value: string): void {
    this.announce(`Filter applied: ${filterType} set to ${value}`);
  }

  announceError(error: string): void {
    this.announce(`Error: ${error}`, 0);
  }
}

/**
 * Keyboard navigation handler for data visualizations
 */
export class KeyboardNavigationHandler {
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = -1;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    this.updateFocusableElements();
    this.attachEventListeners();
    this.setupInitialTabIndex();
  }

  private updateFocusableElements(): void {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[data-focusable="true"]'
    ].join(',');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[];
  }

  private setupInitialTabIndex(): void {
    // Ensure container is focusable if it has no focusable children
    if (this.focusableElements.length === 0) {
      this.container.setAttribute('tabindex', '0');
      this.container.setAttribute('role', 'application');
      this.container.setAttribute(
        'aria-label',
        'Data visualization. Use arrow keys to navigate.'
      );
    }
  }

  private attachEventListeners(): void {
    this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Update focusable elements when DOM changes
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });

    observer.observe(this.container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'hidden'],
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const { key, ctrlKey, shiftKey, altKey } = e;

    // Handle arrow key navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
      this.handleArrowNavigation(key);
      return;
    }

    // Handle Enter/Space for activation
    if ((key === 'Enter' || key === ' ') && this.canActivateCurrentElement()) {
      e.preventDefault();
      this.activateCurrentElement();
      return;
    }

    // Handle Escape for deactivation/reset
    if (key === 'Escape') {
      e.preventDefault();
      this.handleEscape();
      return;
    }

    // Handle Tab navigation (let browser handle, but update our tracking)
    if (key === 'Tab') {
      setTimeout(() => this.updateCurrentFocusIndex(), 0);
      return;
    }

    // Handle keyboard shortcuts
    if (ctrlKey || altKey) {
      this.handleShortcuts(key, { ctrlKey, shiftKey, altKey });
    }
  }

  private handleArrowNavigation(key: string): void {
    if (this.focusableElements.length === 0) {
      this.handleChartNavigation(key);
      return;
    }

    let newIndex = this.currentFocusIndex;

    switch (key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = Math.max(0, this.currentFocusIndex - 1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = Math.min(this.focusableElements.length - 1, this.currentFocusIndex + 1);
        break;
    }

    if (newIndex !== this.currentFocusIndex) {
      this.focusElement(newIndex);
    }
  }

  private handleChartNavigation(key: string): void {
    // Emit custom events for chart components to handle
    const direction = key.replace('Arrow', '').toLowerCase();
    const event = new CustomEvent('chart-navigate', {
      detail: { direction },
      bubbles: true,
    });

    this.container.dispatchEvent(event);
  }

  private focusElement(index: number): void {
    if (index >= 0 && index < this.focusableElements.length) {
      this.currentFocusIndex = index;
      this.focusableElements[index].focus();

      // Announce focus change to screen readers
      this.announceFocusChange(this.focusableElements[index]);
    }
  }

  private canActivateCurrentElement(): boolean {
    const currentElement = this.focusableElements[this.currentFocusIndex];
    return currentElement && (
      currentElement.tagName === 'BUTTON' ||
      currentElement.getAttribute('role') === 'button' ||
      currentElement.hasAttribute('data-activatable')
    );
  }

  private activateCurrentElement(): void {
    const currentElement = this.focusableElements[this.currentFocusIndex];
    if (currentElement) {
      currentElement.click();
    }
  }

  private handleEscape(): void {
    // Reset to first focusable element or container
    if (this.focusableElements.length > 0) {
      this.focusElement(0);
    } else {
      this.container.focus();
    }

    // Emit escape event for components to handle
    const event = new CustomEvent('chart-escape', { bubbles: true });
    this.container.dispatchEvent(event);
  }

  private handleShortcuts(key: string, modifiers: any): void {
    const shortcuts: Record<string, string> = {
      'd': 'toggle-data-table',
      'h': 'show-help',
      'r': 'reset-view',
      'f': 'toggle-fullscreen',
    };

    const action = shortcuts[key.toLowerCase()];
    if (action) {
      const event = new CustomEvent('chart-shortcut', {
        detail: { action, modifiers },
        bubbles: true,
      });

      this.container.dispatchEvent(event);
    }
  }

  private updateCurrentFocusIndex(): void {
    const activeElement = document.activeElement as HTMLElement;
    this.currentFocusIndex = this.focusableElements.indexOf(activeElement);
  }

  private announceFocusChange(element: HTMLElement): void {
    const label = element.getAttribute('aria-label') ||
                  element.getAttribute('title') ||
                  element.textContent ||
                  element.tagName.toLowerCase();

    liveRegionManager.announce(`Focused: ${label}`);
  }
}

/**
 * Color contrast utilities for accessibility
 */
export class ColorContrastManager {
  private static readonly WCAG_AA_RATIO = 4.5;
  private static readonly WCAG_AAA_RATIO = 7;

  static calculateContrast(foreground: string, background: string): number {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  static meetsWCAGAA(foreground: string, background: string): boolean {
    return this.calculateContrast(foreground, background) >= this.WCAG_AA_RATIO;
  }

  static meetsWCAGAAA(foreground: string, background: string): boolean {
    return this.calculateContrast(foreground, background) >= this.WCAG_AAA_RATIO;
  }

  private static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const sRGB = [rgb.r, rgb.g, rgb.b].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static getAccessibleColorPalette(): string[] {
    return [
      '#1f77b4', // Blue
      '#ff7f0e', // Orange
      '#2ca02c', // Green
      '#d62728', // Red
      '#9467bd', // Purple
      '#8c564b', // Brown
      '#e377c2', // Pink
      '#7f7f7f', // Gray
      '#bcbd22', // Olive
      '#17becf', // Cyan
    ];
  }

  static generateAccessibleGradient(
    startColor: string,
    endColor: string,
    steps: number
  ): string[] {
    const colors: string[] = [];
    const start = this.hexToRgb(startColor);
    const end = this.hexToRgb(endColor);

    if (!start || !end) return [startColor, endColor];

    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);

      const r = Math.round(start.r + (end.r - start.r) * ratio);
      const g = Math.round(start.g + (end.g - start.g) * ratio);
      const b = Math.round(start.b + (end.b - start.b) * ratio);

      colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    return colors;
  }
}

/**
 * Data table generator for chart accessibility
 */
export class AccessibleDataTable {
  static generateTable(
    data: any[],
    options: {
      caption: string;
      headers: string[];
      formatters?: Record<string, (value: any) => string>;
      sortable?: boolean;
      className?: string;
    }
  ): HTMLTableElement {
    const { caption, headers, formatters = {}, sortable = false, className = '' } = options;

    const table = document.createElement('table');
    table.className = `accessible-data-table ${className}`;
    table.setAttribute('role', 'table');

    // Caption
    const captionElement = document.createElement('caption');
    captionElement.textContent = caption;
    table.appendChild(captionElement);

    // Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach((header, index) => {
      const th = document.createElement('th');
      th.textContent = header;
      th.setAttribute('scope', 'col');

      if (sortable) {
        th.setAttribute('role', 'columnheader');
        th.setAttribute('tabindex', '0');
        th.setAttribute('aria-sort', 'none');
        th.classList.add('sortable');

        th.addEventListener('click', () => this.sortTable(table, index));
        th.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.sortTable(table, index);
          }
        });
      }

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');

    data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');

      headers.forEach((header, colIndex) => {
        const td = document.createElement('td');
        const key = header.toLowerCase().replace(/\s+/g, '_');
        const value = row[key] || row[header] || '';

        // Apply formatter if available
        const formatter = formatters[key] || formatters[header];
        td.textContent = formatter ? formatter(value) : String(value);

        // Add scope for row headers
        if (colIndex === 0) {
          td.setAttribute('scope', 'row');
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // Add keyboard navigation
    this.addTableKeyboardNavigation(table);

    return table;
  }

  private static sortTable(table: HTMLTableElement, columnIndex: number): void {
    const tbody = table.querySelector('tbody')!;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const th = table.querySelectorAll('th')[columnIndex];

    const currentSort = th.getAttribute('aria-sort');
    const newSort = currentSort === 'ascending' ? 'descending' : 'ascending';

    // Reset all other headers
    table.querySelectorAll('th[aria-sort]').forEach((header) => {
      if (header !== th) {
        header.setAttribute('aria-sort', 'none');
      }
    });

    // Set new sort
    th.setAttribute('aria-sort', newSort);

    // Sort rows
    rows.sort((a, b) => {
      const aText = a.cells[columnIndex].textContent || '';
      const bText = b.cells[columnIndex].textContent || '';

      // Try numeric comparison first
      const aNum = parseFloat(aText.replace(/[^\d.-]/g, ''));
      const bNum = parseFloat(bText.replace(/[^\d.-]/g, ''));

      let comparison = 0;

      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        comparison = aText.localeCompare(bText);
      }

      return newSort === 'descending' ? -comparison : comparison;
    });

    // Reappend sorted rows
    rows.forEach((row) => tbody.appendChild(row));

    // Announce sort change
    liveRegionManager.announce(
      `Table sorted by ${th.textContent} in ${newSort} order`
    );
  }

  private static addTableKeyboardNavigation(table: HTMLTableElement): void {
    let currentCell: HTMLTableCellElement | null = null;

    table.addEventListener('keydown', (e) => {
      if (!currentCell) return;

      const cells = Array.from(table.querySelectorAll('td, th'));
      const currentIndex = cells.indexOf(currentCell);

      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          newIndex = Math.min(cells.length - 1, currentIndex + 1);
          break;
        case 'ArrowLeft':
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          // Move to cell in same column, next row
          const colsPerRow = table.querySelectorAll('thead th').length;
          newIndex = Math.min(cells.length - 1, currentIndex + colsPerRow);
          break;
        case 'ArrowUp':
          // Move to cell in same column, previous row
          const colsPerRowUp = table.querySelectorAll('thead th').length;
          newIndex = Math.max(0, currentIndex - colsPerRowUp);
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = cells.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      currentCell = cells[newIndex] as HTMLTableCellElement;
      currentCell.focus();
    });

    // Track focus
    table.addEventListener('focusin', (e) => {
      if (e.target instanceof HTMLTableCellElement) {
        currentCell = e.target;
      }
    });
  }
}

/**
 * Motion preferences handler
 */
export class MotionManager {
  private static prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  static shouldAnimate(): boolean {
    return !this.prefersReducedMotion;
  }

  static getAnimationDuration(defaultDuration: number): number {
    return this.prefersReducedMotion ? 0 : defaultDuration;
  }

  static respectMotionPreference(element: HTMLElement): void {
    if (this.prefersReducedMotion) {
      element.style.animation = 'none';
      element.style.transition = 'none';
    }
  }
}

// Global instances
export const liveRegionManager = new LiveRegionManager();

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', () => {
  // Set up global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Alt + S: Skip to main content
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      const main = document.querySelector('main, #main-content, [role="main"]');
      if (main instanceof HTMLElement) {
        main.focus();
        main.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Initialize keyboard navigation for all chart containers
  const chartContainers = document.querySelectorAll('[data-chart-id]');
  chartContainers.forEach((container) => {
    if (container instanceof HTMLElement) {
      new KeyboardNavigationHandler(container);
    }
  });
});