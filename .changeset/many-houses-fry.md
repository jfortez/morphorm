---
"morphorm": minor
---

Refactored Morphorm internals with a centralized render pipeline for scalar and array fields (`normalizeFields -> buildRenderModel -> render`), improved watch dependency resolution for array item index isolation, and removed orphan array child field rendering side effects.

Updated form UI styles to use semantic classes with shadcn-compatible CSS variable fallbacks and improved array section layout, spacing, and responsiveness.

Fixed collapsible behavior so array items are properly hidden when the section is collapsed.
