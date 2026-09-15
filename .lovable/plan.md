# Lean typography and spacing refinement

## Goal
Make the full personal health diary noticeably lighter and denser while preserving Lexend, colors, layouts, navigation, data, and all behavior.

## Changes
- Tighten the global mobile-first type scale to the requested 10–24px hierarchy, with modest desktop increases.
- Replace remaining bold-heavy headings and values with regular, medium, or semibold weights.
- Compact shared cards, page headers, buttons, inputs, tabs, dialogs, sheets, and navigation while preserving usable touch targets.
- Tune Training, Body Measurements, Meals, charts, history, and Settings where local sizing or spacing overrides remain oversized.
- Keep the global brand visually quieter than each page title.

## Verification
- Check Training, Body Measurements, Meals, and Settings at 393px mobile and desktop widths.
- Confirm typography remains Lexend, content does not overlap, controls remain tappable, and browser errors are absent.

## Technical details
- Update Tailwind v4 theme tokens in `src/styles.css` and existing component utility classes only.
- Do not change persistence, application logic, content, colors, or navigation structure.