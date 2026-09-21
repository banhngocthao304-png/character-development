# Add Muscle Balance to Training

## Goal
Add one compact, full-width Muscle Balance card between the Training calendar/progress area and session details. It will show a single lavender radar chart based on working-set credits, with no additional fitness analytics.

## Implementation
- Extend the existing exercise library with dedicated primary and secondary muscle-group arrays, preserving every exercise name and all current workout data.
- Populate sensible mappings for the current starter library across exactly: Glutes, Quads, Hamstrings, Back, Chest, Shoulders, Arms, and Core. Multi-primary exercises split their primary credit evenly; secondary groups receive 50% credit per working set.
- Read completed session exercises and their set counts from existing workout history. Ignore blank/zero sets and unmapped groups rather than inventing values.
- Add period calculations for This Week, Current Cycle, Last 30 Days, and All Time. Current Cycle remains the default and uses the same 15th–14th cycle already shown on Training.
- Add a focused Muscle Balance component using the existing Recharts setup and semantic lavender tokens: soft fill, thin outline, subtle points/grid, axis names, and a compact hover/tap tooltip showing set credits.
- Add the requested title/subtitle, period selector, methodology footnote, and the exact empty state when no positive set credits exist.
- Place the card full-width after the progress/calendar column and before Session Details, while retaining the current two-column desktop layout for the surrounding content and a natural no-scroll mobile layout.
- Invalidate the Muscle Balance query after session or exercise add/edit/delete operations so it refreshes automatically.

## Data safety
- Use an additive migration only; do not rename or delete exercises, sessions, notes, existing mappings, or any saved records.
- Leave Body Measurements and Meals unchanged.

## Verification
- Check credit splitting and secondary weighting with representative exercises.
- Verify all four periods, empty state, tooltip, and automatic refresh after exercise/session changes.
- Check Training at mobile and desktop sizes for no overflow, overlap, console errors, or regressions.

## Technical details
- Store new mappings as text arrays on `exercise_library`, while retaining the existing singular group fields used by the picker.
- Use a dedicated React Query key for radar source data and the existing local-date helpers for date boundaries.
- Keep chart values as raw set credits; visual scaling is handled by the radar chart without permanent percentages or score labels.
