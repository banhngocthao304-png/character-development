# Personal health diary — roadmap

## Scope
Three sections: PT Tracker, Body Measurements, Meals (Daily Target | Meal Plan | Food Options).
Out of scope: Meal Log / actual food tracking, consumed calories/macros, recipes.

## Tasks
- [x] Database schema + RLS + private photo storage
- [x] Remove meal log tables
- [x] PT rework: automatic periods (15th → 14th), 16 sessions default,
      pt_settings, pt_sessions unique per user+date, pt_session_exercises
- [x] Design system (cream + lavender, Lexend)
- [x] Single-user access without authentication + app shell (sidebar desktop, bottom nav mobile)
- [x] PT Tracker page: period summary, infinite calendar, session details panel,
      exercise autocomplete, last-time weight, autosave, remove confirmation
- [x] Body Measurements: entries, latest per-metric, change vs previous, chart, history
- [x] Body Measurements: make one monthly check-in the primary workflow
- [x] Meals: persistent daily target ranges
- [x] Meals: reusable meal plan with structured, reorderable foods
- [x] Meals: editable food-option categories and autocomplete
- [x] Settings: PT package size + period start day (export CSV still open)
- [ ] Settings: export data (CSV)
- [ ] Responsive + empty/loading/error states pass
- [x] Verify Body Measurements persistence flow and responsive layouts
