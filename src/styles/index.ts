// Main styles export file
// Import all styles and theme from here for consistency

export * from './theme';
export * from './common';

// Re-export common styles for easier access
export { commonStyles } from './common';
export { layoutStyles, textStyles, buttonStyles, inputStyles } from './common';

// Export theme as default for convenience
export { theme as default } from './theme';
