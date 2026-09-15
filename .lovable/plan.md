# Build the Meals section

## Summary
Replace the placeholder Meals page and the unused Recipes/date-based planning structure with one focused, persistent Meals experience containing exactly three tabs: **Daily Target**, **Meal Plan**, and **Food Options**. Keep the existing app shell, cream background, lavender accents, rounded cards, and Lexend typography unchanged.

## What will be built

### Daily Target
- Show five compact targets: Calories, Protein, Carbohydrates, Fat, and Water.
- Store minimum and maximum values with the requested units.
- Seed the requested defaults only when no target exists.
- Add an **Edit Targets** dialog with decimal-capable minimum/maximum inputs and persistent save feedback.
- Keep this target-only: no consumed, remaining, progress, or logging states.

### Meal Plan
- Show the current reusable eating structure as compact meal cards, not a dated log.
- Seed Breakfast, Lunch, and Dinner with the provided initial foods; support Snack without requiring it.
- Add an **Edit Meal Plan** workspace where meals can be added, renamed, reordered, and removed.
- Allow food items to be added, edited, deleted, and reordered with food name, decimal quantity, custom/selectable unit, and optional preparation.
- Render items naturally, such as “180 g grilled chicken breast.”
- Suggest matching names from Food Options while still accepting any custom food.
- Persist every meal and item change in Lovable Cloud.

### Food Options
- Seed the four requested categories and their exact default options.
- Present categories in a compact one-column mobile layout and two-column desktop layout.
- Allow categories and options to be added, renamed, reordered, and deleted.
- Confirm category deletion because its options will also be removed.
- Keep the lists database-backed after initial creation; no frontend-only defaults.

## Database changes
- Add single-user tables for `nutrition_targets`, `meal_plan_meals`, `meal_plan_items`, `food_option_categories`, and `food_options`.
- Include fixed-owner defaults, timestamps, update triggers, explicit grants, row-level access policies for the existing no-login architecture, ordering constraints, and cascading child deletion.
- Seed one default target, the requested starter meal plan, and all default food-option categories/items in the migration so they appear consistently on every device.
- Remove the obsolete Recipes tables and old date-based meal-planning tables. This removes that unused structure without touching PT sessions, body measurements, or their data.
- Refresh generated database types so the app reads and writes the new tables safely.

## Interface and interaction
- Replace the placeholder with the **Meals** heading, “Eat well, feel good” subtitle, and a three-tab control that fits at 393px mobile width.
- Use the project’s existing buttons, inputs, dialogs, confirmation dialogs, loading placeholders, empty states, and notifications.
- Provide clear loading, save, empty, and error states without introducing extra nutrition features.
- Keep all editing usable with touch, keyboard, and screen readers; use move-up/down controls for ordering.

## Validation
- Verify the three tabs and all edit flows on desktop and mobile.
- Verify targets, meals, items, categories, options, custom units, ordering, and deletions persist after refresh.
- Verify Food Options autocomplete accepts both suggestions and arbitrary custom food names.
- Confirm no Recipe or Meal Log language remains in Meals, and no PT or Body files were changed.
- Run the focused typecheck and check the browser console for errors.
