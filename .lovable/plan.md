# Refine Food Options interface

## What will change
- Make Food Options read-only by default, with compact food rows and no persistent management icons.
- Add collapsible category headers with smooth, restrained open/close behavior.
- Add one `Edit` / `Done` control per category; only that category shows reorder, rename, delete, and option-management controls while editing.
- Keep `Add Option` available in every expanded category, including normal viewing mode.
- Add a compact, case-insensitive search across all food options, showing each match with its category.
- Reduce the visual prominence of `Add Category` and place it after the category list.
- Rename the Training navigation label on both mobile and desktop.

## Technical details
- Preserve the current Food Options queries, mutations, ordering behavior, and database structure.
- Keep category expansion and edit state local to the Meals interface.
- Reuse existing buttons, dialogs, confirmation flows, semantic colors, and Lexend typography.
- Leave Daily Target, Meal Plan, Body Measurements, and Training behavior unchanged.

## Validation
- Check normal, expanded, collapsed, editing, search, add, rename, delete, and reorder states.
- Verify the 393px mobile layout has no always-visible icon rows and that desktop remains compact.
- Confirm existing food data persists unchanged and navigation reads `Training` in both layouts.
