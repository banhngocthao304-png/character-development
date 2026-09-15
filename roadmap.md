# Personal health diary — roadmap

## Scope
Three sections: PT Tracker, Body Measurements, Meals (Plan | Recipes).
Out of scope: Meal Log / food logging, calories, macros.

## Tasks
- [x] Database schema + RLS + private photo storage
- [x] Remove meal log tables
- [ ] PT rework: automatic periods (15th → 14th), 16 sessions default,
      pt_settings, pt_sessions unique per user+date, pt_session_exercises
      (name, weight, unit, sets, reps, note, order), exercise autocomplete
      from own history, "last time" weight reference, autosave
- [x] Design system (cream + lavender, Manrope)
- [ ] Auth (email/password, reset) + app shell (sidebar desktop, bottom nav mobile)
- [ ] PT Tracker page: period summary, infinite calendar, session details panel
- [ ] Body Measurements: entries, latest per-metric, change vs previous, chart, history
- [ ] Recipes: CRUD, ingredients, steps, tags, photo upload
- [ ] Meal Plan: date navigation, recipe snapshot, simple meals, daily note
- [ ] Settings: account, logout, export data (CSV)
- [ ] Responsive + empty/loading/error states pass
