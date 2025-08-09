// Theme configuration for Buildist
// This creates semantic mappings from design tokens

import {
  colorTokens,
  typographyTokens,
  spacingTokens,
  borderRadiusTokens,
  shadowTokens,
  layoutTokens,
  animationTokens,
  zIndexTokens,
} from "./tokens";

// Semantic color mappings
export const colors = {
  // Direct access to color tokens
  ...colorTokens,

  // Semantic color mappings for common use cases
  text: {
    primary: colorTokens.neutral.black,
    secondary: colorTokens.neutral.dark,
    disabled: colorTokens.neutral.mediumDark,
    inverse: colorTokens.neutral.lightest,
    link: colorTokens.primary.main,
    success: colorTokens.success.dark,
    warning: colorTokens.warning.dark,
    error: colorTokens.error.main,
  },

  background: {
    primary: colorTokens.neutral.lightest,
    secondary: colorTokens.neutral.lighter,
    tertiary: colorTokens.neutral.light,
    overlay: "rgba(0, 0, 0, 0.5)",
    card: colorTokens.neutral.lightest,
    input: colorTokens.neutral.lightest,
    button: {
      primary: colorTokens.primary.main,
      secondary: colorTokens.neutral.lightest,
      danger: colorTokens.error.main,
      disabled: colorTokens.neutral.mediumLight,
    },
  },

  border: {
    light: colorTokens.neutral.light,
    medium: colorTokens.neutral.mediumLight,
    dark: colorTokens.neutral.mediumDark,
    primary: colorTokens.primary.main,
    error: colorTokens.error.main,
    success: colorTokens.success.main,
    warning: colorTokens.warning.main,
  },

  // Interactive states
  interactive: {
    hover: {
      primary: colorTokens.primary.dark,
      secondary: colorTokens.primary.lightest,
      danger: colorTokens.error.dark,
    },
    active: {
      primary: colorTokens.primary.darker,
      secondary: colorTokens.primary.lighter,
      danger: colorTokens.error.darker,
    },
    focus: {
      primary: colorTokens.primary.light,
      error: colorTokens.error.light,
    },
  },
} as const;

// Typography with semantic mappings
export const typography = {
  // Direct access to typography tokens
  ...typographyTokens,

  // Font families (will be configured based on platform)
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
    mono: "System",
  },

  // Semantic text styles
  text: {
    display: {
      fontSize: typographyTokens.fontSize["5xl"],
      fontWeight: typographyTokens.fontWeight.extrabold,
      lineHeight: typographyTokens.fontSize["5xl"] * typographyTokens.lineHeight.tight,
    },
    heading: {
      large: {
        fontSize: typographyTokens.fontSize["4xl"],
        fontWeight: typographyTokens.fontWeight.bold,
        lineHeight: typographyTokens.fontSize["4xl"] * typographyTokens.lineHeight.tight,
      },
      medium: {
        fontSize: typographyTokens.fontSize["3xl"],
        fontWeight: typographyTokens.fontWeight.bold,
        lineHeight: typographyTokens.fontSize["3xl"] * typographyTokens.lineHeight.tight,
      },
      small: {
        fontSize: typographyTokens.fontSize["2xl"],
        fontWeight: typographyTokens.fontWeight.semibold,
        lineHeight: typographyTokens.fontSize["2xl"] * typographyTokens.lineHeight.normal,
      },
    },
    body: {
      large: {
        fontSize: typographyTokens.fontSize.lg,
        fontWeight: typographyTokens.fontWeight.normal,
        lineHeight: typographyTokens.fontSize.lg * typographyTokens.lineHeight.normal,
      },
      medium: {
        fontSize: typographyTokens.fontSize.base,
        fontWeight: typographyTokens.fontWeight.normal,
        lineHeight: typographyTokens.fontSize.base * typographyTokens.lineHeight.normal,
      },
      small: {
        fontSize: typographyTokens.fontSize.sm,
        fontWeight: typographyTokens.fontWeight.normal,
        lineHeight: typographyTokens.fontSize.sm * typographyTokens.lineHeight.normal,
      },
    },
    caption: {
      fontSize: typographyTokens.fontSize.xs,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.fontSize.xs * typographyTokens.lineHeight.normal,
    },
    button: {
      large: {
        fontSize: typographyTokens.fontSize.lg,
        fontWeight: typographyTokens.fontWeight.medium,
        lineHeight: typographyTokens.fontSize.lg * typographyTokens.lineHeight.normal,
      },
      medium: {
        fontSize: typographyTokens.fontSize.base,
        fontWeight: typographyTokens.fontWeight.medium,
        lineHeight: typographyTokens.fontSize.base * typographyTokens.lineHeight.normal,
      },
      small: {
        fontSize: typographyTokens.fontSize.sm,
        fontWeight: typographyTokens.fontWeight.medium,
        lineHeight: typographyTokens.fontSize.sm * typographyTokens.lineHeight.normal,
      },
    },
  },
} as const;

// Spacing with semantic mappings
export const spacing = {
  // Direct access to spacing tokens
  ...spacingTokens,

  // Semantic spacing for common use cases
  component: {
    padding: {
      small: spacingTokens.sm,
      medium: spacingTokens.md,
      large: spacingTokens.lg,
    },
    margin: {
      small: spacingTokens.sm,
      medium: spacingTokens.md,
      large: spacingTokens.lg,
    },
    gap: {
      tight: spacingTokens.xs,
      normal: spacingTokens.sm,
      loose: spacingTokens.md,
    },
  },

  layout: {
    screen: {
      padding: spacingTokens.lg,
      margin: spacingTokens.md,
    },
    section: {
      margin: spacingTokens.lg,
      padding: spacingTokens.md,
    },
    card: {
      padding: spacingTokens.md,
      margin: spacingTokens.sm,
    },
  },
} as const;

// Border radius with semantic mappings
export const borderRadius = {
  // Direct access to border radius tokens
  ...borderRadiusTokens,

  // Semantic border radius for common use cases
  component: {
    button: borderRadiusTokens.md,
    input: borderRadiusTokens.md,
    card: borderRadiusTokens.md,
    modal: borderRadiusTokens.lg,
    badge: borderRadiusTokens.full,
  },
} as const;

// Shadows with semantic mappings
export const shadows = {
  // Direct access to shadow tokens
  ...shadowTokens,

  // Semantic shadows for common use cases
  component: {
    button: shadowTokens.sm,
    card: shadowTokens.sm,
    modal: shadowTokens.lg,
    dropdown: shadowTokens.md,
    tooltip: shadowTokens.sm,
  },
} as const;

// Layout with semantic mappings
export const layout = {
  // Direct access to layout tokens
  ...layoutTokens,

  // Screen dimensions (will be set dynamically)
  screen: {
    width: 0,
    height: 0,
  },

  // Semantic layout for common use cases
  component: {
    button: {
      height: layoutTokens.button.height,
      minWidth: layoutTokens.button.minWidth,
      padding: {
        horizontal: spacingTokens.lg,
        vertical: spacingTokens.md,
      },
    },
    input: {
      height: layoutTokens.input.height,
      padding: {
        horizontal: spacingTokens.md,
        vertical: spacingTokens.sm,
      },
    },
    card: {
      padding: spacingTokens.md,
      margin: spacingTokens.sm,
    },
  },
} as const;

// Animation with semantic mappings
export const animation = {
  // Direct access to animation tokens
  ...animationTokens,

  // Semantic animation for common use cases
  component: {
    button: {
      press: animationTokens.fast,
      hover: animationTokens.normal,
    },
    modal: {
      open: animationTokens.normal,
      close: animationTokens.fast,
    },
    transition: {
      fast: animationTokens.fast,
      normal: animationTokens.normal,
      slow: animationTokens.slow,
    },
  },
} as const;

// Z-index with semantic mappings
export const zIndex = {
  // Direct access to z-index tokens
  ...zIndexTokens,

  // Semantic z-index for common use cases
  component: {
    button: zIndexTokens.base,
    card: zIndexTokens.base,
    modal: zIndexTokens.modal,
    dropdown: zIndexTokens.dropdown,
    tooltip: zIndexTokens.tooltip,
    toast: zIndexTokens.toast,
  },
} as const;

// Export the complete theme
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
  zIndex,
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Layout = typeof layout;
export type Animation = typeof animation;
export type ZIndex = typeof zIndex;
