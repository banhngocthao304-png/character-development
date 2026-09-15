# Personal health diary — roadmap

## Scope
Three sections: PT Tracker, Body Measurements, Meals (Plan | Recipes).
Meal Log is explicitly OUT of scope (removed per user request).

## Tasks
- [x] Database schema + RLS + private photo storage
- [ ] Drop meal_logs / meal_log_ingredients tables and remove all log logic
- [x] Design system (cream + lavender, Manrope)
- [ ] Auth (email/password, reset) + app shell (sidebar desktop, bottom nav mobile)
- [ ] PT Tracker: cycles, calendar ticking, session details, history
- [ ] Body Measurements: entries, latest per-metric, change vs previous, chart, history
- [ ] Recipes: CRUD, ingredients, steps, tags, photo upload
- [ ] Meal Plan: date navigation, recipe snapshot, simple meals, daily note
- [ ] Settings: account, logout, export data (CSV zip)
- [ ] Responsive + empty/loading/error states pass
