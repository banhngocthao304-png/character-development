# Personal health diary — roadmap

## Scope
Three sections: PT Tracker, Body Measurements, Meals (Plan | Recipes).
Out of scope: Meal Log / food logging, calories, macros.

## Tasks
- [x] Database schema + RLS + private photo storage
- [x] Remove meal log tables
- [x] PT rework: automatic periods (15th → 14th), 16 sessions default,
      pt_settings, pt_sessions unique per user+date, pt_session_exercises
- [x] Design system (cream + lavender, Lexend)
- [x] Auth (email/password, reset) + app shell (sidebar desktop, bottom nav mobile)
- [x] PT Tracker page: period summary, infinite calendar, session details panel,
      exercise autocomplete, last-time weight, autosave, remove confirmation
- [ ] Body Measurements: entries, latest per-metric, change vs previous, chart, history (in progress)
- [ ] Recipes: CRUD, ingredients, steps, tags, photo upload
- [ ] Meal Plan: date navigation, recipe snapshot, simple meals, daily note
- [x] Settings: PT package size + period start day (export CSV still open)
- [ ] Settings: export data (CSV)
- [ ] Responsive + empty/loading/error states pass
