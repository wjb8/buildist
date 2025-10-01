import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "./theme";

// Common layout styles
export const layoutStyles = StyleSheet.create({
  // Flexbox utilities
  flex: { flex: 1 },
  flex1: { flex: 1 },
  flexRow: { flexDirection: "row" },
  row: { flexDirection: "row" },
  flexColumn: { flexDirection: "column" },
  flexCenter: { justifyContent: "center", alignItems: "center" },
  center: { justifyContent: "center", alignItems: "center" },
  flexCenterVertical: { justifyContent: "center" },
  flexCenterHorizontal: { alignItems: "center" },
  flexSpaceBetween: { justifyContent: "space-between" },
  spaceBetween: { justifyContent: "space-between" },
  flexSpaceAround: { justifyContent: "space-around" },
  flexWrap: { flexWrap: "wrap" },

  // Position utilities
  absolute: { position: "absolute" },
  relative: { position: "relative" },
  top0: { top: 0 },
  bottom0: { bottom: 0 },
  left0: { left: 0 },
  right0: { right: 0 },

  // Size utilities
  fullWidth: { width: "100%" },
  fullHeight: { height: "100%" },
  wAuto: { width: "auto" },
  hAuto: { height: "auto" },

  // Spacing utilities
  p0: { padding: 0 },
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  p5: { padding: spacing.xl },

  px0: { paddingHorizontal: 0 },
  px1: { paddingHorizontal: spacing.xs },
  px2: { paddingHorizontal: spacing.sm },
  px3: { paddingHorizontal: spacing.md },
  px4: { paddingHorizontal: spacing.lg },
  px5: { paddingHorizontal: spacing.xl },

  py0: { paddingVertical: 0 },
  py1: { paddingVertical: spacing.xs },
  py2: { paddingVertical: spacing.sm },
  py3: { paddingVertical: spacing.md },
  py4: { paddingVertical: spacing.lg },
  py5: { paddingVertical: spacing.xl },

  pt0: { paddingTop: 0 },
  pt1: { paddingTop: spacing.xs },
  pt2: { paddingTop: spacing.sm },
  pt3: { paddingTop: spacing.md },
  pt4: { paddingTop: spacing.lg },
  pt5: { paddingTop: spacing.xl },

  pb0: { paddingBottom: 0 },
  pb1: { paddingBottom: spacing.xs },
  pb2: { paddingBottom: spacing.sm },
  pb3: { paddingBottom: spacing.md },
  pb4: { paddingBottom: spacing.lg },
  pb5: { paddingBottom: spacing.xl },

  pl0: { paddingLeft: 0 },
  pl1: { paddingLeft: spacing.xs },
  pl2: { paddingLeft: spacing.sm },
  pl3: { paddingLeft: spacing.md },
  pl4: { paddingLeft: spacing.lg },
  pl5: { paddingLeft: spacing.xl },

  pr0: { paddingRight: 0 },
  pr1: { paddingRight: spacing.xs },
  pr2: { paddingRight: spacing.sm },
  pr3: { paddingRight: spacing.md },
  pr4: { paddingRight: spacing.lg },
  pr5: { paddingRight: spacing.xl },

  // Margin utilities
  m0: { margin: 0 },
  m1: { margin: spacing.xs },
  m2: { margin: spacing.sm },
  m3: { margin: spacing.md },
  m4: { margin: spacing.lg },
  m5: { margin: spacing.xl },

  mx0: { marginHorizontal: 0 },
  mx1: { marginHorizontal: spacing.xs },
  mx2: { marginHorizontal: spacing.sm },
  mx3: { marginHorizontal: spacing.md },
  mx4: { marginHorizontal: spacing.lg },
  mx5: { marginHorizontal: spacing.xl },

  my0: { marginVertical: 0 },
  my1: { marginVertical: spacing.xs },
  my2: { marginVertical: spacing.sm },
  my3: { marginVertical: spacing.md },
  my4: { marginVertical: spacing.lg },
  my5: { marginVertical: spacing.xl },

  mt0: { marginTop: 0 },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },

  mb0: { marginBottom: 0 },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },

  ml0: { marginLeft: 0 },
  ml1: { marginLeft: spacing.xs },
  ml2: { marginLeft: spacing.sm },
  ml3: { marginLeft: spacing.md },
  ml4: { marginLeft: spacing.lg },
  ml5: { marginLeft: spacing.xl },

  mr0: { marginRight: 0 },
  mr1: { marginRight: spacing.xs },
  mr2: { marginRight: spacing.sm },
  mr3: { marginRight: spacing.md },
  mr4: { marginRight: spacing.lg },
  mr5: { marginRight: spacing.xl },

  // Border radius utilities
  roundedNone: { borderRadius: borderRadius.none },
  roundedSm: { borderRadius: borderRadius.sm },
  roundedMd: { borderRadius: borderRadius.md },
  roundedLg: { borderRadius: borderRadius.lg },
  roundedXl: { borderRadius: borderRadius.xl },
  roundedFull: { borderRadius: borderRadius.full },

  // Border utilities
  border0: { borderWidth: 0 },
  border1: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border4: { borderWidth: 4 },

  borderLight: { borderColor: colors.border.light },
  borderMedium: { borderColor: colors.border.medium },
  borderDark: { borderColor: colors.border.dark },

  // Background utilities
  bgPrimary: { backgroundColor: colors.background.primary },
  bgSecondary: { backgroundColor: colors.background.secondary },
  bgTertiary: { backgroundColor: colors.background.tertiary },
  bgTransparent: { backgroundColor: "transparent" },

  // Shadow utilities
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
  shadowXl: shadows.xl,

  // Common layout patterns
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },

  section: {
    marginVertical: spacing.md,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
});

// Common text styles
export const textStyles = StyleSheet.create({
  // Heading styles
  h1: {
    fontSize: typography.fontSize["4xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.fontSize["4xl"] * typography.lineHeight.tight,
  },

  h2: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.fontSize["3xl"] * typography.lineHeight.tight,
  },

  h3: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: typography.fontSize["2xl"] * typography.lineHeight.normal,
  },

  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
  },

  // Body text styles
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },

  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },

  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },

  // Caption styles
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },

  // Button text styles
  buttonLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    textAlign: "center",
  },

  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    textAlign: "center",
  },

  buttonSmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    textAlign: "center",
  },

  // Link styles
  link: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.main,
    textDecorationLine: "underline",
  },

  // Error text
  error: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.error.main,
  },

  // Success text
  success: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.success.main,
  },

  // Warning text
  warning: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.warning.main,
  },
});

// Common button styles
export const buttonStyles = StyleSheet.create({
  // Primary button
  primary: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },

  primaryPressed: {
    backgroundColor: colors.primary.dark,
    ...shadows.md,
  },

  primaryDisabled: {
    backgroundColor: colors.neutral.mediumLight,
    opacity: 0.6,
  },

  // Secondary button
  secondary: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryPressed: {
    backgroundColor: colors.primary.lightest,
  },

  secondaryDisabled: {
    borderColor: colors.neutral.mediumLight,
    opacity: 0.6,
  },

  // Text button
  text: {
    backgroundColor: "transparent",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  textPressed: {
    backgroundColor: colors.neutral.lighter,
  },

  // Danger button
  danger: {
    backgroundColor: colors.error.main,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },

  dangerPressed: {
    backgroundColor: colors.error.dark,
  },

  dangerDisabled: {
    backgroundColor: colors.neutral.mediumLight,
    opacity: 0.6,
  },
});

// Common input styles
export const inputStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 40,
  },

  focused: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },

  error: {
    borderColor: colors.error.main,
    borderWidth: 2,
  },

  disabled: {
    backgroundColor: colors.background.secondary,
    color: colors.text.disabled,
    opacity: 0.6,
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

// Export all common styles
export const commonStyles = {
  layout: layoutStyles,
  text: textStyles,
  button: buttonStyles,
  input: inputStyles,
};
