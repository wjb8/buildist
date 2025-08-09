# Buildist Global Styles System

This directory contains the global styling system for the Buildist app, providing consistent design tokens, reusable styles, and styled components across the entire application.

## Architecture Overview

The styling system follows a design token approach with:

- **Theme** (`theme.ts`) - Design tokens (colors, typography, spacing, etc.)
- **Common Styles** (`common.ts`) - Reusable style utilities and patterns
- **Styled Components** (`../components/StyledComponents.tsx`) - Reusable UI components
- **Index** (`index.ts`) - Main export file for easy importing

## Quick Start

```typescript
// Import everything from the main styles file
import { colors, spacing, typography, commonStyles } from "@styles";

// Or import specific items
import { colors } from "@styles";
import { StyledButton, StyledText } from "@components/StyledComponents";
```

## Design Tokens

### Colors

```typescript
import { colors } from "@styles";

// Primary brand colors
colors.primary.main; // Main brand color
colors.primary.light; // Light variant
colors.primary.dark; // Dark variant

// Semantic colors
colors.success.main; // Success state
colors.warning.main; // Warning state
colors.error.main; // Error state

// Text colors
colors.text.primary; // Main text
colors.text.secondary; // Secondary text
colors.text.disabled; // Disabled text
colors.text.inverse; // Text on dark backgrounds

// Background colors
colors.background.primary; // Main background
colors.background.secondary; // Secondary background
colors.background.tertiary; // Tertiary background
```

### Typography

```typescript
import { typography } from "@styles";

// Font sizes
typography.fontSize.xs; // 10px
typography.fontSize.sm; // 12px
typography.fontSize.base; // 14px
typography.fontSize.lg; // 16px
typography.fontSize.xl; // 18px
typography.fontSize["2xl"]; // 20px
typography.fontSize["3xl"]; // 24px
typography.fontSize["4xl"]; // 30px
typography.fontSize["5xl"]; // 36px

// Font weights
typography.fontWeight.normal; // 400
typography.fontWeight.medium; // 500
typography.fontWeight.semibold; // 600
typography.fontWeight.bold; // 700
typography.fontWeight.extrabold; // 800

// Line heights
typography.lineHeight.tight; // 1.2
typography.lineHeight.normal; // 1.4
typography.lineHeight.relaxed; // 1.6
typography.lineHeight.loose; // 1.8
```

### Spacing

```typescript
import { spacing } from "@styles";

// Base spacing unit is 4px
spacing.xs; // 4px
spacing.sm; // 8px
spacing.md; // 16px
spacing.lg; // 24px
spacing.xl; // 32px
spacing["2xl"]; // 48px
spacing["3xl"]; // 64px
spacing["4xl"]; // 96px
```

### Border Radius

```typescript
import { borderRadius } from "@styles";

borderRadius.none; // 0px
borderRadius.sm; // 4px
borderRadius.md; // 8px
borderRadius.lg; // 12px
borderRadius.xl; // 16px
borderRadius["2xl"]; // 24px
borderRadius.full; // 9999px (circular)
```

## Common Styles

### Layout Utilities

```typescript
import { layoutStyles } from "@styles";

// Flexbox utilities
layoutStyles.flex; // flex: 1
layoutStyles.flexRow; // flexDirection: 'row'
layoutStyles.flexColumn; // flexDirection: 'column'
layoutStyles.flexCenter; // center both axes
layoutStyles.flexCenterVertical; // center vertically
layoutStyles.flexCenterHorizontal; // center horizontally
layoutStyles.flexSpaceBetween; // space-between
layoutStyles.flexSpaceAround; // space-around

// Position utilities
layoutStyles.absolute; // position: 'absolute'
layoutStyles.relative; // position: 'relative'
layoutStyles.top0; // top: 0
layoutStyles.bottom0; // bottom: 0
layoutStyles.left0; // left: 0
layoutStyles.right0; // right: 0

// Size utilities
layoutStyles.fullWidth; // width: '100%'
layoutStyles.fullHeight; // height: '100%'

// Spacing utilities (padding)
layoutStyles.p0,
  layoutStyles.p1,
  layoutStyles.p2,
  layoutStyles.p3,
  layoutStyles.p4,
  layoutStyles.p5;
layoutStyles.px0,
  layoutStyles.px1,
  layoutStyles.px2,
  layoutStyles.px3,
  layoutStyles.px4,
  layoutStyles.px5;
layoutStyles.py0,
  layoutStyles.py1,
  layoutStyles.py2,
  layoutStyles.py3,
  layoutStyles.py4,
  layoutStyles.py5;
layoutStyles.pt0,
  layoutStyles.pt1,
  layoutStyles.pt2,
  layoutStyles.pt3,
  layoutStyles.pt4,
  layoutStyles.pt5;
layoutStyles.pb0,
  layoutStyles.pb1,
  layoutStyles.pb2,
  layoutStyles.pb3,
  layoutStyles.pb4,
  layoutStyles.pb5;
layoutStyles.pl0,
  layoutStyles.pl1,
  layoutStyles.pl2,
  layoutStyles.pl3,
  layoutStyles.pl4,
  layoutStyles.pl5;
layoutStyles.pr0,
  layoutStyles.pr1,
  layoutStyles.pr2,
  layoutStyles.pr3,
  layoutStyles.pr4,
  layoutStyles.pr5;

// Spacing utilities (margin)
layoutStyles.m0,
  layoutStyles.m1,
  layoutStyles.m2,
  layoutStyles.m3,
  layoutStyles.m4,
  layoutStyles.m5;
layoutStyles.mx0,
  layoutStyles.mx1,
  layoutStyles.mx2,
  layoutStyles.mx3,
  layoutStyles.mx4,
  layoutStyles.mx5;
layoutStyles.my0,
  layoutStyles.my1,
  layoutStyles.my2,
  layoutStyles.my3,
  layoutStyles.my4,
  layoutStyles.my5;
layoutStyles.mt0,
  layoutStyles.mt1,
  layoutStyles.mt2,
  layoutStyles.mt3,
  layoutStyles.mt4,
  layoutStyles.mt5;
layoutStyles.mb0,
  layoutStyles.mb1,
  layoutStyles.mb2,
  layoutStyles.mb3,
  layoutStyles.mb4,
  layoutStyles.mb5;
layoutStyles.ml0,
  layoutStyles.ml1,
  layoutStyles.ml2,
  layoutStyles.ml3,
  layoutStyles.ml4,
  layoutStyles.ml5;
layoutStyles.mr0,
  layoutStyles.mr1,
  layoutStyles.mr2,
  layoutStyles.mr3,
  layoutStyles.mr4,
  layoutStyles.mr5;

// Border utilities
layoutStyles.border0, layoutStyles.border1, layoutStyles.border2, layoutStyles.border4;
layoutStyles.borderLight, layoutStyles.borderMedium, layoutStyles.borderDark;

// Background utilities
layoutStyles.bgPrimary,
  layoutStyles.bgSecondary,
  layoutStyles.bgTertiary,
  layoutStyles.bgTransparent;

// Shadow utilities
layoutStyles.shadowSm, layoutStyles.shadowMd, layoutStyles.shadowLg, layoutStyles.shadowXl;

// Common patterns
layoutStyles.centerContainer; // Centered container with padding
layoutStyles.rowCenter; // Row with centered items
layoutStyles.rowSpaceBetween; // Row with space-between
layoutStyles.card; // Card with shadow and padding
layoutStyles.section; // Section with vertical margin
layoutStyles.divider; // Horizontal divider line
```

### Text Styles

```typescript
import { textStyles } from "@styles";

// Heading styles
textStyles.h1, textStyles.h2, textStyles.h3, textStyles.h4;

// Body text styles
textStyles.bodyLarge, textStyles.body, textStyles.bodySmall;

// Special text styles
textStyles.caption,
  textStyles.button,
  textStyles.link,
  textStyles.error,
  textStyles.success,
  textStyles.warning;
```

### Button Styles

```typescript
import { buttonStyles } from "@styles";

// Button variants
buttonStyles.primary, buttonStyles.secondary, buttonStyles.text, buttonStyles.danger;

// Button states
buttonStyles.primaryPressed, buttonStyles.primaryDisabled;
buttonStyles.secondaryPressed, buttonStyles.secondaryDisabled;
buttonStyles.textPressed;
buttonStyles.dangerPressed, buttonStyles.dangerDisabled;
```

### Input Styles

```typescript
import { inputStyles } from "@styles";

inputStyles.base; // Base input styling
inputStyles.focused; // Focused state
inputStyles.error; // Error state
inputStyles.disabled; // Disabled state
inputStyles.label; // Input label
inputStyles.helperText; // Helper text below input
```

## Styled Components

### StyledView

```typescript
import { StyledView } from '@components/StyledComponents';

// Basic usage
<StyledView>
  <Text>Content</Text>
</StyledView>

// With props
<StyledView center card section>
  <Text>Centered card content</Text>
</StyledView>

// With custom styles
<StyledView
  center
  style={{ backgroundColor: 'red' }}
>
  <Text>Custom styled content</Text>
</StyledView>
```

### StyledText

```typescript
import { StyledText } from '@components/StyledComponents';

// Basic usage
<StyledText>Regular text</StyledText>

// With variants
<StyledText variant="h1">Heading 1</StyledText>
<StyledText variant="bodyLarge">Large body text</StyledText>
<StyledText variant="caption">Caption text</StyledText>

// With colors
<StyledText color="primary">Primary colored text</StyledText>
<StyledText color="error">Error text</StyledText>
<StyledText color="#FF0000">Custom color</StyledText>

// With modifiers
<StyledText center bold>Centered bold text</StyledText>
```

### StyledButton

```typescript
import { StyledButton } from '@components/StyledComponents';

// Basic usage
<StyledButton onPress={handlePress}>
  Click me
</StyledButton>

// With variants
<StyledButton variant="primary" onPress={handlePress}>
  Primary Button
</StyledButton>

<StyledButton variant="secondary" onPress={handlePress}>
  Secondary Button
</StyledButton>

<StyledButton variant="danger" onPress={handlePress}>
  Danger Button
</StyledButton>

// With sizes
<StyledButton size="small" onPress={handlePress}>
  Small Button
</StyledButton>

<StyledButton size="large" onPress={handlePress}>
  Large Button
</StyledButton>

// With modifiers
<StyledButton
  variant="primary"
  fullWidth
  disabled={isLoading}
  onPress={handlePress}
>
  {isLoading ? 'Loading...' : 'Submit'}
</StyledButton>
```

### StyledInput

```typescript
import { StyledInput } from '@components/StyledComponents';

// Basic usage
<StyledInput placeholder="Enter text" />

// With label and helper text
<StyledInput
  label="Email Address"
  placeholder="Enter your email"
  helperText="We'll never share your email"
/>

// With error state
<StyledInput
  label="Password"
  placeholder="Enter password"
  error="Password is required"
/>

// Full width
<StyledInput
  label="Full Name"
  placeholder="Enter your full name"
  fullWidth
/>
```

### StyledCard

```typescript
import { StyledCard } from '@components/StyledComponents';

// Basic usage
<StyledCard>
  <Text>Card content</Text>
</StyledCard>

// With padding variants
<StyledCard padding="small">
  <Text>Small padding</Text>
</StyledCard>

<StyledCard padding="large">
  <Text>Large padding</Text>
</StyledCard>

// With shadow variants
<StyledCard shadow="none">
  <Text>No shadow</Text>
</StyledCard>

<StyledCard shadow="large">
  <Text>Large shadow</Text>
</StyledCard>
```

### StyledDivider

```typescript
import { StyledDivider } from '@components/StyledComponents';

// Horizontal divider
<StyledDivider />

// Vertical divider
<StyledDivider vertical />

// Custom styling
<StyledDivider
  thickness={2}
  color="red"
  margin={16}
/>
```

### StyledBadge

```typescript
import { StyledBadge } from '@components/StyledComponents';

// Basic usage
<StyledBadge>New</StyledBadge>

// With variants
<StyledBadge variant="success">Success</StyledBadge>
<StyledBadge variant="warning">Warning</StyledBadge>
<StyledBadge variant="error">Error</StyledBadge>

// With sizes
<StyledBadge size="small">Small</StyledBadge>
<StyledBadge size="large">Large</StyledBadge>
```

## Best Practices

### 1. Use Design Tokens

```typescript
// ✅ Good - Use design tokens
<View style={{ backgroundColor: colors.primary.main }}>
  <Text style={{ fontSize: typography.fontSize.lg }}>
    Content
  </Text>
</View>

// ❌ Bad - Hardcoded values
<View style={{ backgroundColor: '#007AFF' }}>
  <Text style={{ fontSize: 16 }}>
    Content
  </Text>
</View>
```

### 2. Use Common Styles

```typescript
// ✅ Good - Use common styles
<View style={[layoutStyles.flexCenter, layoutStyles.p3]}>
  <Text style={textStyles.h2}>Content</Text>
</View>

// ❌ Bad - Inline styles
<View style={{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16
}}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Content</Text>
</View>
```

### 3. Use Styled Components

```typescript
// ✅ Good - Use styled components
<StyledView center card>
  <StyledText variant="h3">Title</StyledText>
  <StyledText variant="body">Description</StyledText>
  <StyledButton variant="primary" onPress={handlePress}>
    Action
  </StyledButton>
</StyledView>

// ❌ Bad - Manual styling
<View style={[layoutStyles.flexCenter, layoutStyles.card]}>
  <Text style={textStyles.h3}>Title</Text>
  <Text style={textStyles.body}>Description</Text>
  <TouchableOpacity style={buttonStyles.primary} onPress={handlePress}>
    <Text style={textStyles.button}>Action</Text>
  </TouchableOpacity>
</View>
```

### 4. Combine Styles Properly

```typescript
// ✅ Good - Combine styles with arrays
<View style={[
  layoutStyles.card,
  layoutStyles.m3,
  { borderColor: colors.primary.main }
]}>

// ❌ Bad - Override styles
<View style={{
  ...layoutStyles.card,
  margin: 16, // This overrides the design token
  borderColor: colors.primary.main
}}>
```

## Migration Guide

### From Inline Styles

```typescript
// Before
<View style={{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32,
  backgroundColor: '#f5f5f5'
}}>
  <Text style={{
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16
  }}>
    Loading...
  </Text>
</View>

// After
<StyledView center style={{
  padding: spacing.xl,
  backgroundColor: colors.background.secondary
}}>
  <StyledText
    variant="h4"
    style={{ marginTop: spacing.md }}
  >
    Loading...
  </StyledText>
</StyledView>
```

### From StyleSheet.create

```typescript
// Before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
});

// After
import { colors, typography, spacing } from "@styles";
import { StyledView, StyledText } from "@components/StyledComponents";

// Use styled components directly
<StyledView style={{ flex: 1, backgroundColor: colors.background.primary }}>
  <StyledText variant="h3" style={{ marginBottom: spacing.md }}>
    Title
  </StyledText>
</StyledView>;
```

## Customization

### Adding New Colors

```typescript
// In theme.ts
export const colors = {
  // ... existing colors

  // Add new color palette
  custom: {
    50: "#F0F9FF",
    100: "#E0F2FE",
    500: "#0EA5E9",
    900: "#0C4A6E",
  },
};
```

### Adding New Typography Variants

```typescript
// In common.ts
export const textStyles = StyleSheet.create({
  // ... existing styles

  // Add new variant
  display: {
    fontSize: typography.fontSize["5xl"],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    lineHeight: typography.fontSize["5xl"] * typography.lineHeight.tight,
  },
});
```

### Adding New Styled Components

```typescript
// In StyledComponents.tsx
export const StyledIcon: React.FC<StyledIconProps> = ({ ... }) => {
  // Implementation
};
```

## Performance Considerations

- Design tokens are constants and won't cause re-renders
- Common styles are created once with StyleSheet.create
- Styled components use React.memo for performance optimization
- Avoid creating styles in render functions

## Accessibility

- All styled components support accessibility props
- Colors meet WCAG contrast requirements
- Typography scales are optimized for readability
- Touch targets meet minimum size requirements (48px)

## Future Enhancements

- Dark mode support
- Platform-specific styling
- Animation presets
- Responsive design utilities
- CSS-in-JS support
- Style validation and linting
