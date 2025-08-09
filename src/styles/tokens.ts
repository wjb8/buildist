// Design tokens - raw values only
// These are the foundation of the design system

export const colorTokens = {
  // Primary brand colors (blue-based)
  primary: {
    lightest: "#E3F2FD",
    lighter: "#BBDEFB",
    light: "#90CAF9",
    mediumLight: "#64B5F6",
    medium: "#42A5F5",
    main: "#007AFF", // Main brand color
    mediumDark: "#1E88E5",
    dark: "#1976D2",
    darker: "#1565C0",
    darkest: "#0D47A1",
  },

  // Secondary colors (purple-based)
  secondary: {
    lightest: "#F3E5F5",
    lighter: "#E1BEE7",
    light: "#CE93D8",
    mediumLight: "#BA68C8",
    medium: "#AB47BC",
    main: "#9C27B0",
    mediumDark: "#8E24AA",
    dark: "#7B1FA2",
    darker: "#6A1B9A",
    darkest: "#4A148C",
  },

  // Semantic colors
  success: {
    lightest: "#E8F5E8",
    lighter: "#C8E6C9",
    light: "#A5D6A7",
    mediumLight: "#81C784",
    medium: "#66BB6A",
    main: "#4CAF50",
    mediumDark: "#43A047",
    dark: "#388E3C",
    darker: "#2E7D32",
    darkest: "#1B5E20",
  },

  warning: {
    lightest: "#FFF8E1",
    lighter: "#FFECB3",
    light: "#FFE082",
    mediumLight: "#FFD54F",
    medium: "#FFCA28",
    main: "#FFC107",
    mediumDark: "#FFB300",
    dark: "#FFA000",
    darker: "#FF8F00",
    darkest: "#FF6F00",
  },

  error: {
    lightest: "#FFEBEE",
    lighter: "#FFCDD2",
    light: "#EF9A9A",
    mediumLight: "#E57373",
    medium: "#EF5350",
    main: "#FF3B30", // iOS error color
    mediumDark: "#E53935",
    dark: "#D32F2F",
    darker: "#C62828",
    darkest: "#B71C1C",
  },

  // Neutral colors (grays)
  neutral: {
    lightest: "#FAFAFA",
    lighter: "#F5F5F5",
    light: "#EEEEEE",
    mediumLight: "#E0E0E0",
    medium: "#9E9E9E",
    mediumDark: "#BDBDBD",
    dark: "#757575",
    darker: "#616161",
    darkest: "#424242",
    black: "#212121",
  },
} as const;

export const typographyTokens = {
  // Font sizes (in pixels)
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 30,
    "5xl": 36,
  },

  // Font weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Line heights (multipliers)
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

export const spacingTokens = {
  // Base spacing unit is 4px
  // This creates a consistent rhythm throughout the app
  xs: 4, // 4px
  sm: 8, // 8px
  md: 16, // 16px
  lg: 24, // 24px
  xl: 32, // 32px
  "2xl": 48, // 48px
  "3xl": 64, // 64px
  "4xl": 96, // 96px
} as const;

export const borderRadiusTokens = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999, // For circular elements
} as const;

export const shadowTokens = {
  // iOS shadows with Android elevation
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

export const layoutTokens = {
  // Header heights
  header: {
    height: 56,
    largeHeight: 96,
  },

  // Tab bar height
  tabBar: {
    height: 49,
  },

  // Common component sizes
  button: {
    height: 48,
    minWidth: 88,
  },

  input: {
    height: 48,
  },
} as const;

export const animationTokens = {
  // Animation durations (in milliseconds)
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const zIndexTokens = {
  // Z-index scale for layering
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Export all tokens
export const tokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  shadows: shadowTokens,
  layout: layoutTokens,
  animation: animationTokens,
  zIndex: zIndexTokens,
} as const;

// Type exports
export type ColorTokens = typeof colorTokens;
export type TypographyTokens = typeof typographyTokens;
export type SpacingTokens = typeof spacingTokens;
export type BorderRadiusTokens = typeof borderRadiusTokens;
export type ShadowTokens = typeof shadowTokens;
export type LayoutTokens = typeof layoutTokens;
export type AnimationTokens = typeof animationTokens;
export type ZIndexTokens = typeof zIndexTokens;
export type Tokens = typeof tokens;
