/**
 * ARIA Utilities for WCAG 2.1 AA Compliance
 * Provides helper functions for managing ARIA attributes
 */

/**
 * ARIA attribute types
 */
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-disabled'?: boolean;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-hidden'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-keyshortcuts'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-pressed'?: boolean | 'mixed';
  'aria-readonly'?: boolean;
  'aria-required'?: boolean;
  'aria-selected'?: boolean;
  'aria-sort'?: 'ascending' | 'descending' | 'none' | 'other';
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  role?: string;
}

/**
 * Generate ARIA label from cell data
 */
export function generateCellAriaLabel(params: {
  column: string;
  row: number;
  value?: any;
  type?: string;
  selected?: boolean;
  editable?: boolean;
  error?: string;
}): string {
  const { column, row, value, type, selected, editable, error } = params;

  let label = `Cell ${column}${row}`;

  if (type) {
    label += `, ${formatCellType(type)}`;
  }

  if (value !== undefined && value !== null && value !== '') {
    label += `, value: ${formatValue(value)}`;
  }

  if (selected) {
    label += ', selected';
  }

  if (editable) {
    label += ', editable';
  }

  if (error) {
    label += `, error: ${error}`;
  }

  return label;
}

/**
 * Format cell type for screen readers
 */
function formatCellType(type: string): string {
  const typeMap: Record<string, string> = {
    'input': 'Input',
    'output': 'Output',
    'transform': 'Transform',
    'filter': 'Filter',
    'aggregate': 'Aggregate',
    'validate': 'Validation',
    'analysis': 'Analysis',
    'prediction': 'Prediction',
    'decision': 'Decision',
    'explain': 'Explanation',
  };

  return typeMap[type] || type;
}

/**
 * Format value for screen readers
 */
function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
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
 * Set ARIA attributes on element
 */
export function setAriaAttributes(element: HTMLElement, attributes: Partial<AriaAttributes>): void {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, String(value));
    }
  });
}

/**
 * Create ARIA live region
 */
export function createLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const region = document.createElement('div');
  region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  region.style.position = 'absolute';
  region.style.width = '1px';
  region.style.height = '1px';
  region.style.padding = '0';
  region.style.margin = '-1px';
  region.style.overflow = 'hidden';
  region.style.clip = 'rect(0, 0, 0, 0)';
  region.style.whiteSpace = 'nowrap';
  region.style.borderWidth = '0';

  return region;
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const region = createLiveRegion(priority);
  document.body.appendChild(region);

  // Use setTimeout to ensure screen readers register the change
  setTimeout(() => {
    region.textContent = message;
  }, 100);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(region);
  }, 1000);
}

/**
 * Generate ARIA description for spreadsheet grid
 */
export function generateGridAriaDescription(params: {
  rows: number;
  columns: number;
  title?: string;
  description?: string;
}): string {
  const { rows, columns, title, description } = params;

  let ariaDescription = '';

  if (title) {
    ariaDescription += `${title}. `;
  }

  if (description) {
    ariaDescription += `${description}. `;
  }

  ariaDescription += `Spreadsheet with ${rows} rows and ${columns} columns. `;
  ariaDescription += `Use arrow keys to navigate, Enter to edit, Escape to cancel.`;

  return ariaDescription;
}

/**
 * Get ARIA role for cell type
 */
export function getCellRole(type: string): string {
  const roleMap: Record<string, string> = {
    'input': 'textbox',
    'output': 'status',
    'transform': 'region',
    'filter': 'region',
    'aggregate': 'region',
    'validate': 'alert',
    'analysis': 'region',
    'prediction': 'status',
    'decision': 'region',
    'explain': 'region',
  };

  return roleMap[type] || 'gridcell';
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(attributes: AriaAttributes): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check aria-live and aria-atomic combination
  if (attributes['aria-live'] && attributes['aria-atomic'] === undefined) {
    errors.push('aria-live should be used with aria-atomic set to true for better screen reader support');
  }

  // Check aria-expanded and aria-controls combination
  if (attributes['aria-expanded'] && !attributes['aria-controls']) {
    errors.push('aria-expanded should be used with aria-controls to indicate what is being expanded');
  }

  // Check aria-label vs aria-labelledby
  if (attributes['aria-label'] && attributes['aria-labelledby']) {
    errors.push('Use either aria-label or aria-labelledby, not both');
  }

  // Check aria-valuenow, aria-valuemin, aria-valuemax combination
  if (attributes['aria-valuenow']) {
    if (attributes['aria-valuemin'] === undefined || attributes['aria-valuemax'] === undefined) {
      errors.push('aria-valuenow should be used with aria-valuemin and aria-valuemax');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * ARIA label generators for common patterns
 */
export const AriaLabelGenerators = {
  /**
   * Generate label for button
   */
  button: (label: string, pressed?: boolean, expanded?: boolean): string => {
    let ariaLabel = label;
    if (pressed !== undefined) {
      ariaLabel += `, ${pressed ? 'pressed' : 'not pressed'}`;
    }
    if (expanded !== undefined) {
      ariaLabel += `, ${expanded ? 'expanded' : 'collapsed'}`;
    }
    return ariaLabel;
  },

  /**
   * Generate label for link
   */
  link: (label: string, external?: boolean): string => {
    let ariaLabel = label;
    if (external) {
      ariaLabel += ', opens in new tab';
    }
    return ariaLabel;
  },

  /**
   * Generate label for form field
   */
  formField: (label: string, required?: boolean, invalid?: boolean): string => {
    let ariaLabel = label;
    if (required) {
      ariaLabel += ', required';
    }
    if (invalid) {
      ariaLabel += ', invalid';
    }
    return ariaLabel;
  },

  /**
   * Generate label for menu item
   */
  menuItem: (label: string, disabled?: boolean): string => {
    let ariaLabel = label;
    if (disabled) {
      ariaLabel += ', disabled';
    }
    return ariaLabel;
  },
};

/**
 * ARIA relationship helpers
 */
export const AriaRelationships = {
  /**
   * Link label to element
   */
  labelBy: (elementId: string): string => elementId,

  /**
   * Link description to element
   */
  describedBy: (elementId: string): string => elementId,

  /**
   * Link controls
   */
  controls: (elementId: string): string => elementId,

  /**
   * Link flow to
   */
  flowTo: (elementId: string): string => elementId,
};

/**
 * Export all utilities
 */
export const ariaUtils = {
  generateCellAriaLabel,
  setAriaAttributes,
  createLiveRegion,
  announce,
  generateGridAriaDescription,
  getCellRole,
  validateAriaAttributes,
  ...AriaLabelGenerators,
  ...ARelationships,
};
