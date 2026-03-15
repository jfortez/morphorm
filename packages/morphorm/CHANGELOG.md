# Morphorm

## 0.2.3

### Patch Changes

- 5b52306: fix missing types

## 0.2.2

### Patch Changes

- 41e41e0: Removed deprecated form-field and form-hook components. Simplified internal context and form handling logic.

## 0.2.1

### Patch Changes

- ae336ca: Add custom type override for array fields
- 428f644: add trigger components for composition
- 2fa08b2: support for multiple forms based on scope

## 0.2.0

### Minor Changes

- 52335ab: Refactored Morphorm internals with a centralized render pipeline for scalar and array fields (`normalizeFields -> buildRenderModel -> render`), improved watch dependency resolution for array item index isolation, and removed orphan array child field rendering side effects.

  Updated form UI styles to use semantic classes with shadcn-compatible CSS variable fallbacks and improved array section layout, spacing, and responsiveness.

  Fixed collapsible behavior so array items are properly hidden when the section is collapsed.

## 0.1.5

### Patch Changes

- 76458dc: add reactive watch tests for dynamic field updates

## 0.1.4

### Patch Changes

- 82c4112: remove `fieldTransformer` use `fields` instead

## 0.1.3

### Patch Changes

- c604255: add fields

## 0.1.2

### Patch Changes

- 779cdd5: fix: fix form.Field to form.AppField error

## 0.1.1

### Patch Changes

- init morphorm package
