/**
 * Screen Reader Support Utilities for WCAG 2.1 AA Compliance
 * Provides comprehensive screen reader compatibility
 */

/**
 * Screen reader detection result
 */
export interface ScreenReaderInfo {
  detected: boolean;
  name?: string;
  version?: string;
}

/**
 * Announcement priority
 */
export type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Screen reader announcement manager
 */
export class ScreenReaderManager {
  private liveRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;
  private announcementHistory: Array<{ message: string; timestamp: number }> = [];
  private maxHistorySize = 100;

  constructor() {
    this.initializeLiveRegions();
  }

  /**
   * Initialize live regions for announcements
   */
  private initializeLiveRegions(): void {
    // Create polite live region
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.applyScreenReaderOnlyStyles(this.liveRegion);
    document.body.appendChild(this.liveRegion);

    // Create assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    this.applyScreenReaderOnlyStyles(this.assertiveRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  /**
   * Apply screen reader only styles
   */
  private applyScreenReaderOnlyStyles(element: HTMLElement): void {
    Object.assign(element.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    });
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: AnnouncementPriority = 'polite'): void {
    const region = priority === 'assertive' ? this.assertiveRegion : this.liveRegion;

    if (!region) {
      console.error('Live region not initialized');
      return;
    }

    // Check for duplicate announcements
    if (region.textContent === message) {
      return;
    }

    // Add to history
    this.announcementHistory.push({
      message,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.announcementHistory.length > this.maxHistorySize) {
      this.announcementHistory.shift();
    }

    // Clear and set new message
    region.textContent = '';

    // Use setTimeout to ensure screen readers register the change
    setTimeout(() => {
      if (region) {
        region.textContent = message;
      }
    }, 100);
  }

  /**
   * Announce polite message
   */
  announcePolite(message: string): void {
    this.announce(message, 'polite');
  }

  /**
   * Announce assertive message
   */
  announceAssertive(message: string): void {
    this.announce(message, 'assertive');
  }

  /**
   * Announce cell navigation
   */
  announceCellNavigation(from: string, to: string): void {
    this.announcePolite(`Navigated from ${from} to ${to}`);
  }

  /**
   * Announce cell value
   */
  announceCellValue(cellId: string, value: any, type?: string): void {
    const formattedValue = this.formatValue(value);
    const typeText = type ? `, type: ${type}` : '';
    this.announcePolite(`${cellId}, value: ${formattedValue}${typeText}`);
  }

  /**
   * Announce cell selection
   */
  announceCellSelection(cellIds: string[]): void {
    const count = cellIds.length;
    const cellList = cellIds.slice(0, 3).join(', ');
    const more = count > 3 ? ` and ${count - 3} more` : '';

    this.announcePolite(`Selected ${count} cells: ${cellList}${more}`);
  }

  /**
   * Announce error
   */
  announceError(cellId: string, error: string): void {
    this.announceAssertive(`Error in ${cellId}: ${error}`);
  }

  /**
   * Announce success
   */
  announceSuccess(message: string): void {
    this.announcePolite(`Success: ${message}`);
  }

  /**
   * Announce warning
   */
  announceWarning(message: string): void {
    this.announcePolite(`Warning: ${message}`);
  }

  /**
   * Format value for screen reader
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'empty';
    }

    if (typeof value === 'number') {
      if (Number.isNaN(value)) {
        return 'not a number';
      }
      if (!Number.isFinite(value)) {
        return value > 0 ? 'positive infinity' : 'negative infinity';
      }
      return value.toLocaleString();
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'string') {
      return value === '' ? 'empty' : value;
    }

    if (Array.isArray(value)) {
      return `${value.length} items`;
    }

    if (typeof value === 'object') {
      return 'complex data';
    }

    return String(value);
  }

  /**
   * Get announcement history
   */
  getHistory(count: number = 10): Array<{ message: string; timestamp: number }> {
    return this.announcementHistory.slice(-count);
  }

  /**
   * Clear announcement history
   */
  clearHistory(): void {
    this.announcementHistory = [];
  }

  /**
   * Clean up live regions
   */
  destroy(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
    }
    if (this.assertiveRegion && this.assertiveRegion.parentNode) {
      this.assertiveRegion.parentNode.removeChild(this.assertiveRegion);
    }
    this.announcementHistory = [];
  }
}

/**
 * Detect screen reader
 */
export function detectScreenReader(): ScreenReaderInfo {
  // Check for common screen reader indicators
  const hasSpeechSynthesis = 'speechSynthesis' in window;
  const hasVoiceControl = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Check for screen reader specific attributes
  const hasSrOnly = document.querySelector('.sr-only, [aria-live]') !== null;

  // Check for common screen reader browser signatures
  const userAgent = navigator.userAgent.toLowerCase();
  const isJaws = /jaws/.test(userAgent);
  const isNvda = /nvda/.test(userAgent);
  const isVoiceOver = /voiceover/.test(userAgent);
  const isTalkBack = /talkback/.test(userAgent);

  let name: string | undefined;
  if (isJaws) name = 'JAWS';
  else if (isNvda) name = 'NVDA';
  else if (isVoiceOver) name = 'VoiceOver';
  else if (isTalkBack) name = 'TalkBack';

  return {
    detected: hasSpeechSynthesis || hasVoiceControl || hasSrOnly || isJaws || isNvda || isVoiceOver || isTalkBack,
    name,
  };
}

/**
 * Create screen reader only element
 */
export function createScreenReaderOnlyElement(content: string): HTMLElement {
  const element = document.createElement('span');
  element.className = 'sr-only';
  element.textContent = content;
  element.setAttribute('aria-hidden', 'false');

  Object.assign(element.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  });

  return element;
}

/**
 * Add screen reader only label
 */
export function addScreenReaderLabel(element: HTMLElement, label: string): void {
  const labelElement = createScreenReaderOnlyElement(label);
  element.insertBefore(labelElement, element.firstChild);
}

/**
 * Remove screen reader only label
 */
export function removeScreenReaderLabel(element: HTMLElement): void {
  const srOnly = element.querySelector('.sr-only');
  if (srOnly) {
    element.removeChild(srOnly);
  }
}

/**
 * Announce to screen readers (utility function)
 */
export function announceToScreenReader(message: string, priority: AnnouncementPriority = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  Object.assign(announcement.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  });

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Screen reader compatibility utilities
 */
export const screenReaderUtils = {
  detectScreenReader,
  createScreenReaderOnlyElement,
  addScreenReaderLabel,
  removeScreenReaderLabel,
  announceToScreenReader,
};

/**
 * Global screen reader manager instance
 */
export const screenReaderManager = new ScreenReaderManager();
