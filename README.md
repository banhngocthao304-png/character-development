# Character development

Build a production-ready, fully interactive personal health tracking web application.

Use the attached mockup images as the PRIMARY visual reference. Recreate their overall visual language, spacing, proportions, softness, card styling, typography hierarchy, lavender accents, and mobile/desktop responsiveness.

This must NOT be a static prototype.

Every important interaction must work and all user-created data must be stored persistently in a real backend/database.

The product is intentionally simple and personal. It is NOT intended to become a general fitness platform.

The application has exactly THREE primary sections:

PT Tracker

Body Measurements

Meals

Meals contains three internal tabs:

Plan | Log | Recipes

Do not add unrelated fitness features unless explicitly requested later.

==================================================

GLOBAL PRODUCT DIRECTION
==================================================

PURPOSE

This application is a private personal health diary designed around three everyday needs:

tracking which days I trained with my personal trainer

tracking body weight and body measurements over time

planning meals, saving recipes, and recording what I actually ate

The app should feel lightweight enough that I can open it every day without feeling like I am filling out a complicated health form.

The experience should prioritize:

speed

simplicity

visual calm

easy data entry

clear history

persistent storage

mobile usability

long-term use

Avoid feature bloat.

==================================================
2. VISUAL DESIGN SYSTEM

Use the attached mockups as the visual reference.

STYLE

Create a soft, minimal, modern wellness aesthetic.

The design should feel:

calm

personal

polished

feminine without being overly cute

modern

clean

slightly warm

premium but understated

Do NOT use:

Snoopy

mascots

character illustrations

busy backgrounds

excessive gradients

neon colors

glassmorphism everywhere

heavy shadows

dark dashboard aesthetics

corporate admin-dashboard styling

COLOR PALETTE

Primary background:
warm off-white / very pale cream

Example direction:
#FAF9F7
or similar

Secondary surfaces:
white or very light warm cream

Primary lavender:
soft muted lavender

Example direction:
#9B8BE8

Light lavender:
#EEEAFB

Very light lavender:
#F6F3FD

Primary text:
deep navy / dark indigo

Example:
#171943

Secondary text:
muted cool gray/lavender-gray

Borders:
very subtle warm gray or lavender-gray

Success states:
soft muted green

Danger/delete states:
muted red, used sparingly

Do not make the entire app purple.

Lavender should mainly be used for:

active states

buttons

selected dates

graph lines

highlights

progress indicators

navigation selection

TYPOGRAPHY

Use a clean modern sans-serif font.

Possible choices:

Inter

Manrope

DM Sans

Use one primary font consistently.

Typography hierarchy:

Page title:
large, strong but not oversized

Section title:
medium-bold

Card labels:
medium

Body:
regular

Secondary metadata:
smaller and muted

Avoid excessive bold text.

ROUNDED CORNERS

Use generous but consistent rounding.

Cards:
approximately 16–20px

Buttons:
approximately 12–16px

Inputs:
approximately 10–14px

Images:
approximately 12–16px

SHADOWS

Use extremely subtle shadows.

Cards should mostly be defined by:

background contrast

thin border

subtle shadow

Do not create floating heavy-shadow cards.

SPACING

Use generous whitespace.

Avoid squeezing too much information into one screen.

Use consistent spacing tokens throughout the application.

==================================================
3. APPLICATION NAVIGATION

DESKTOP

Create a persistent left sidebar.

Sidebar contains:

PT Tracker
Body Measurements
Meals

At the bottom:
Settings

Use simple outline icons.

Highlight the current section with a soft lavender background.

Main content occupies the remaining width.

Do NOT show all three main sections simultaneously on desktop.

When PT Tracker is selected:
show the PT Tracker page.

When Body Measurements is selected:
show Body Measurements.

When Meals is selected:
show Meals.

The attached desktop reference may show several areas at once for visual demonstration, but the actual application should use clear page navigation.

MOBILE

Use a fixed bottom navigation bar.

Three items:

PT Tracker
Body
Meals

Do not include Settings in the bottom navigation.

Settings can be accessed from a small menu/profile/settings icon in the top area.

The bottom navigation should respect iPhone safe-area padding.

It should remain visible while scrolling.

==================================================
4. RESPONSIVE BEHAVIOR

Build mobile-first but make desktop equally polished.

Breakpoints should adapt naturally.

MOBILE

Single-column layout.

Cards stack vertically.

Calendar uses full available width.

Buttons must be thumb-friendly.

Avoid tiny tap targets.

Meal images should remain visually prominent without dominating the screen.

DESKTOP

Use wider cards.

Body Measurements can use a two-column layout where appropriate.

Meal cards may use more horizontal space.

Do not simply scale mobile UI larger.

TABLET

Adapt between mobile and desktop naturally.

No horizontal scrolling should occur except where intentionally designed.

==================================================
5. AUTHENTICATION

This is a private personal application.

Implement authentication using Supabase Auth if available.

Support:

Email + password sign-up
Email + password login
Logout
Password reset if straightforward

Each user must only access their own data.

Every database table must associate records with the authenticated user.

Use Row Level Security.

A user must never be able to query another user's:

PT cycles

PT sessions

body measurements

recipes

meal plans

meal logs

photos

LOGIN SCREEN

Keep it minimal.

Centered login card.

App name or simple text heading.

Email
Password
Sign In

Optional:
Create account

Do not overdesign the login page.

==================================================
6. PT TRACKER — CORE CONCEPT

PT Tracker is the highest-priority feature.

Its purpose is NOT to track workouts, exercises, sets, reps, calories, or duration.

It only tracks attendance with my personal trainer.

The central concept is a PT CYCLE.

A PT cycle is defined by:

start_date
end_date

Example:

15 September 2026
→
15 October 2026

IMPORTANT:

This is ONE continuous PT cycle.

It does NOT mean:
September calendar month
+
October calendar month

The application must understand that the valid tracking range is exactly:

15 Sep 2026 through 15 Oct 2026

inclusive.

==================================================
7. PT CYCLE CREATION

Provide:

New Cycle

When clicked, open a clean modal or sheet.

Fields:

Start Date *
End Date *

Total PT Sessions Purchased
optional integer

Optional Cycle Note

Example:

Start:
15 Sep 2026

End:
15 Oct 2026

Sessions purchased:
12

Validate:

end_date must be after start_date.

Total sessions must be positive if entered.

After Save:
create cycle
set as current cycle
show calendar immediately.

Only one cycle should be marked current/active at a time.

Previous cycles remain archived.

==================================================
8. PT CURRENT CYCLE CARD

At the top of PT Tracker show:

CURRENT CYCLE

15 Sep 2026 → 15 Oct 2026

8 PT sessions

If total sessions purchased exists:

8 / 12 used
4 remaining

Use a horizontal lavender progress bar.

Do NOT write:

8 / 31 sessions

31 represents calendar days, not purchased PT sessions.

If there is no purchased-session total:

simply show:

8 PT sessions this cycle

Do not display remaining sessions.

Optional small metadata:

Cycle length:
31 days

But this should be visually secondary.

==================================================
9. PT CALENDAR

The calendar is the central interaction.

It must be easy to understand instantly.

Display calendar months necessary to represent the current cycle.

Example:

15 Sep → 15 Oct

The user needs to see both September and October dates relevant to the cycle.

On desktop:
a larger calendar can show the range elegantly.

On mobile:
allow navigating between September and October using arrows while preserving the same PT cycle.

DATES OUTSIDE THE CYCLE

Dates outside the cycle should:

appear muted

not be selectable

not count toward PT sessions

DATES INSIDE THE CYCLE

Dates inside the cycle should be active.

TRAINED DAY

When user taps/clicks an active date:

create a PT session for that date.

Visually mark it using:

filled lavender circle

white date number

Immediately update:

PT sessions this cycle

Example:

7 PT sessions
→ click Sep 24
→ 8 PT sessions

If package size exists:

7 / 12
→
8 / 12

Remaining:

5
→
4

Do not require a Save button.

Persist immediately.

UNMARKING

If the user taps a trained date again:

show a lightweight confirmation only if the date contains a note.

If there is no note:
allow immediate unmarking.

Delete that PT session.

Update counters immediately.

==================================================
10. PT SESSION DETAILS

When selecting a completed PT day, allow optional details.

Fields:

Date
Session Type
Note

Session Type is optional.

Suggested choices:

Lower Body
Upper Body
Glutes
Full Body
Cardio
Mobility
Other

Allow custom text if useful.

Note example:

“Felt strong today.”

Do not require session type or note.

The primary purpose remains attendance tracking.

==================================================
11. PT HISTORY

Add a History section.

Show archived cycles newest first.

Example:

15 Aug 2026 → 15 Sep 2026

9 PT sessions

9 / 12 used
3 remaining

15 Jul 2026 → 15 Aug 2026

10 PT sessions

10 / 12 used
2 remaining

Clicking a historical cycle opens its calendar.

Show exactly which dates were marked trained.

Historical cycles should be viewable.

Allow editing if necessary.

Allow deleting a cycle with confirmation.

Deleting a cycle should also delete associated sessions safely.

==================================================
12. BODY MEASUREMENTS

The Body section tracks measurements over time.

Do not treat measurements as one permanent profile.

Every measurement submission creates a dated historical entry.

FIELDS

Date *

Weight — kg
Waist — cm
Hip — cm
Bust — cm
Thigh — cm
Arm — cm

All measurement fields except Date are optional.

At least one measurement should be entered before saving.

Support decimal values.

Examples:

Weight:
52.3

Waist:
64.5

==================================================
13. ADD BODY ENTRY

Button:

Add Entry

Open modal/sheet.

Date defaults to today but can be changed.

Inputs should show units clearly.

Example:

Weight
[ 52.3 ] kg

Waist
[ 64 ] cm

etc.

Save entry.

Immediately update:

latest measurements

graph

history

==================================================
14. LATEST BODY MEASUREMENTS

At top show:

Latest

Use the most recent valid measurement for each field.

IMPORTANT:

If the latest entry only contains weight, do not erase previously known waist/hip/etc values from the summary.

Instead determine the latest available value per measurement.

Example:

Weight:
52.3 kg
9 Sep

Waist:
64 cm
2 Sep

Hip:
90 cm
2 Sep

Show date subtly where useful.

==================================================
15. BODY CHANGE CALCULATION

For each metric compare with its previous recorded value.

Example:

Weight:
52.3 kg

↓ 0.8 kg
vs previous entry

Waist:
64 cm

↓ 1 cm

If no previous value exists:
show no change indicator.

Do not invent zero.

Use subtle:
green/down or neutral styling.

Avoid interpreting whether weight loss/gain is medically good or bad.

This app is recording data, not providing medical advice.

==================================================
16. BODY PROGRESS GRAPH

Create a clean line chart.

Metric selector:

Weight
Waist
Hip
Bust
Thigh
Arm

Default:
Weight

Time filters:

1M
3M
6M
1Y
All

X-axis:
date

Y-axis:
selected metric value

Use actual stored data only.

Do not generate fake interpolation.

If there is only one entry:
show a single point and a friendly empty-chart state.

If no data:
show:

“No measurements yet.”

with:

Add Entry

==================================================
17. BODY HISTORY

Desktop:
table format is appropriate.

Columns:

Date
Weight
Waist
Hip
Bust
Thigh
Arm

Mobile:
use stacked history cards rather than a wide table.

Newest first.

Allow:

Edit
Delete

Deleting requires confirmation.

==================================================
18. MEALS — INFORMATION ARCHITECTURE

Meals contains exactly three sub-tabs:

PLAN
LOG
RECIPES

These concepts MUST remain separate.

PLAN:
what I intend to eat.

LOG:
what I actually ate.

RECIPES:
reusable saved dishes and instructions.

Never overwrite one automatically when editing another.

==================================================
19. RECIPES LIBRARY

Create a Recipes page.

Top:
Recipes

Button:

New Recipe

Optional search field.

Show recipe cards.

Each card can show:

image

recipe name

meal category

prep time

optional tags

Example:

Chicken Rice Bowl
Lunch
20 min
High Protein

Do not require nutritional information.

No calorie/macros system.

==================================================
20. CREATE RECIPE

Fields:

Recipe Name *

Photo

Meal Category:
Breakfast
Lunch
Dinner
Snack
Other

Prep Time
optional

Serving Size
default 1 serving

Tags
optional

Example tags:
Easy
Quick
Meal Prep
High Protein

Tags are organizational only.

==================================================
21. RECIPE INGREDIENTS

Ingredients must be structured data, not one giant text field.

Each ingredient row:

Ingredient name
Quantity
Unit

Example:

Chicken breast | 150 | g
Cooked rice | 120 | g
Broccoli | 100 | g
Soy sauce | 15 | g
Olive oil | 5 | g

Supported units:

g
kg
ml
L
tsp
tbsp
cup
piece
serving
to taste
custom

Allow:

Add Ingredient

Allow drag/reorder if straightforward.

Allow delete ingredient row.

For “to taste” quantity may be blank.

==================================================
22. RECIPE INSTRUCTIONS

Instructions should support ordered steps.

Example:

Season chicken with salt, pepper and garlic.

Cook chicken until done and slice.

Steam broccoli.

Prepare rice.

Assemble and serve.

Allow:

Add Step

Each step editable.

Allow reorder if straightforward.

==================================================
23. RECIPE DETAIL PAGE

Recipe detail should resemble attached mobile reference.

Large recipe image.

Recipe name.

Small metadata chips.

Ingredients.

Instructions.

Actions:

Edit

Use in Plan

Log as Meal

Optional favorite heart icon.

Do not overcomplicate.

==================================================
24. RECIPE PHOTO STORAGE

Allow upload from:

photo library

device file picker

phone camera when browser supports it

Store image persistently using Supabase Storage.

Do not store image as base64 in database.

Store image path/reference.

Compress oversized uploads when appropriate.

Show loading state.

Handle upload errors gracefully.

Allow replace/delete photo.

==================================================
25. MEAL PLAN — DATE NAVIGATION

Plan tab starts with date selector.

Example:

< Tue, 15 Sep 2026 >

Allow:
previous day
next day
calendar picker

Plans are stored per date.

Show four meal categories:

Breakfast
Lunch
Dinner
Snacks

==================================================
26. ADD PLANNED MEAL

Button:

Add Meal

Ask:

Meal Type
Breakfast / Lunch / Dinner / Snack

Then allow:

Option A:
Choose Saved Recipe

Option B:
Create Simple Meal

If choosing recipe:
copy recipe information into the planned meal.

IMPORTANT:

The plan must keep its own snapshot/quantities.

Editing the planned quantity must NOT alter the saved recipe.

Example:

Recipe default:

Chicken 150g
Rice 120g

For Tuesday plan user changes:

Chicken 180g
Rice 100g

The recipe itself remains:

150g
120g

==================================================
27. PLANNED MEAL CARD

Example:

LUNCH
12:30

Chicken Rice Bowl

Chicken breast 150g
Cooked rice 120g
Broccoli 100g

Photo thumbnail

Actions:
Edit
Delete
Mark as Ate as Planned
Edit Actual

Time is optional.

==================================================
28. SIMPLE PLANNED MEAL

User should not need to create a recipe for everything.

Allow:

Simple Meal

Fields:

Meal name

Photo optional

Ingredients optional

Notes optional

Example:

“Dinner at restaurant”

This can exist only in that day's Plan.

==================================================
29. DAILY PLAN NOTE

At bottom of Plan:

Notes for this day

Example:

“Prep chicken earlier.”

Save automatically or with a simple Save behavior.

Store by date.

==================================================
30. MEAL LOG

Meal Log represents ACTUAL food eaten.

Date navigation works the same as Plan.

Show actual meals by:

Breakfast
Lunch
Dinner
Snacks

Each actual meal can contain:

Meal name
Actual photo
Time
Ingredients
Actual quantities
Notes

==================================================
31. ATE AS PLANNED

This is an important convenience feature.

For a planned meal show:

Ate as Planned ✓

When clicked:

Create a new Meal Log entry.

Copy:
meal name
meal category
ingredients
planned quantities
planned image reference if appropriate

The actual log becomes independent.

Do NOT link quantities in a way where future plan edits change historical logs.

After copying:
show visual confirmation:

“Added to Meal Log.”

Optionally mark planned meal as logged.

==================================================
32. EDIT ACTUAL

Button:

Edit Actual

Open actual meal form prefilled from plan.

Example:

PLANNED

Chicken:
150 g

Rice:
120 g

Broccoli:
100 g

ACTUAL

Chicken:
[120] g

Rice:
[150] g

Broccoli:
[100] g

Allow:
edit quantity
add ingredient
remove ingredient
change meal name
change time
add note
upload actual photo

Save creates/updates Meal Log only.

Do NOT modify:
recipe
meal plan

==================================================
33. UNPLANNED MEAL

Meal Log must support:

Log Meal

without requiring a Meal Plan.

Example:

User eats at a restaurant.

Open:

Meals → Log → + Log Meal

Enter:

Dinner

Restaurant pasta

Upload photo

Optional ingredient details

Optional note

Save.

==================================================
34. ACTUAL MEAL PHOTOS

Actual meals can have their own photo.

This is different from recipe photo.

Example:

Recipe photo:
professional-looking Chicken Rice Bowl reference.

Actual photo:
the plate I really ate today.

Keep both separately.

==================================================
35. MEAL HISTORY

Past dates must remain accessible indefinitely.

Switching dates should load stored:
plans
logs

Do not delete previous meal data when date changes.

Recipes remain in library until explicitly deleted.

==================================================
36. DATABASE ARCHITECTURE

Use Supabase/PostgreSQL.

Create normalized tables.

Suggested architecture:

profiles

id
user_id
created_at

pt_cycles

id
user_id
start_date
end_date
total_sessions
note
status
created_at
updated_at

pt_sessions

id
user_id
cycle_id
session_date
session_type
note
created_at
updated_at

Add unique constraint:
one PT session per cycle per date.

body_measurements

id
user_id
measurement_date
weight_kg
waist_cm
hip_cm
bust_cm
thigh_cm
arm_cm
created_at
updated_at

recipes

id
user_id
name
category
photo_path
prep_minutes
servings
notes
is_favorite
created_at
updated_at

recipe_ingredients

id
recipe_id
ingredient_name
quantity
unit
sort_order

recipe_steps

id
recipe_id
step_number
instruction

recipe_tags

id
recipe_id
tag

meal_plan_days

id
user_id
plan_date
daily_note
created_at
updated_at

planned_meals

id
user_id
meal_plan_day_id
meal_type
meal_name
recipe_id nullable
photo_path nullable
planned_time nullable
notes
created_at
updated_at

planned_meal_ingredients

id
planned_meal_id
ingredient_name
quantity
unit
sort_order

meal_logs

id
user_id
log_date
meal_type
meal_name
planned_meal_id nullable
recipe_id nullable
actual_time nullable
photo_path nullable
notes
created_at
updated_at

meal_log_ingredients

id
meal_log_id
ingredient_name
quantity
unit
sort_order

Use appropriate foreign keys.

Use cascade deletion carefully where logical.

Historical actual meal logs should not disappear merely because a recipe is deleted.

Therefore recipe references from historical meals should be nullable and meal information should be snapshotted into the planned/log records.

==================================================
37. ROW LEVEL SECURITY

Enable RLS for every user-data table.

Policies must ensure authenticated user can:

SELECT own records
INSERT own records
UPDATE own records
DELETE own records

Never allow unrestricted public access.

Storage policies should similarly protect meal/recipe photos.

==================================================
38. DATA PERSISTENCE REQUIREMENTS

NO critical application data should exist only in:

React state
localStorage
sessionStorage
hardcoded arrays

Frontend state may be used for UI behavior, but persistent records must be stored in Supabase.

After:

refresh
browser restart
device restart
logout/login

data must still exist.

==================================================
39. LOADING STATES

Do not flash fake placeholder data.

Use subtle skeletons while fetching.

Buttons that save data should show temporary loading state.

Example:

Save Meal
→
Saving…
→
Saved

Avoid duplicate submissions.

==================================================
40. EMPTY STATES

Design intentional empty states.

PT:

“No active PT cycle.”

Create Cycle

Body:

“No measurements yet.”

Add Entry

Meal Plan:

“No meals planned for this day.”

Add Meal

Meal Log:

“Nothing logged yet.”

Log Meal

Recipes:

“No recipes saved yet.”

Create Recipe

Keep empty states clean and encouraging without excessive motivational copy.

==================================================
41. ERROR HANDLING

Handle failures gracefully.

Examples:

“Couldn’t save this entry. Please try again.”

“Photo upload failed.”

“Couldn’t load your data.”

Do not silently fail.

Do not wipe user-entered form data after failed save.

==================================================
42. EDITING

Every important record should be editable:

PT cycle
PT session
Body measurement
Recipe
Planned meal
Actual meal

Changes must update database.

==================================================
43. DELETING

Allow deleting:

PT cycle
PT session
Body measurement
Recipe
Planned meal
Actual meal

Use confirmation dialog for meaningful/destructive deletion.

Example:

Delete this recipe?

This cannot be undone.

Cancel
Delete

Do not use confirmation for trivial interactions like ticking a PT date unless deleting attached notes.

==================================================
44. SETTINGS

Create a minimal Settings page.

Sections:

Account

Email
Logout

Preferences

Units:
Metric by default

Data

Export My Data

Optional:
Delete Account

Do not add unnecessary settings.

==================================================
45. DATA EXPORT

Create:

Export My Data

Allow export of structured user data.

At minimum include:

PT Cycles
PT Sessions
Body Measurements
Recipes
Recipe Ingredients
Meal Plans
Planned Meals
Meal Logs
Meal Log Ingredients

CSV files are acceptable.

A ZIP containing multiple CSV files is also acceptable if practical.

Photo export can be implemented later if complicated, but database records should retain their image references.

==================================================
46. DATE AND TIMEZONE HANDLING

This is critical.

Calendar dates must behave as LOCAL DATES.

Do not accidentally convert:

15 Sep

into:

14 Sep

because of UTC conversion.

Database DATE fields should be used for:

PT cycle start/end
PT session date
body measurement date
meal plan date
meal log date

Use timestamps only where actual time is relevant.

Meal time can use local time.

All date rendering should respect user's local timezone.

==================================================
47. CALENDAR LOGIC EDGE CASES

Support cycles crossing:

month boundaries
year boundaries

Examples:

15 Dec 2026 → 15 Jan 2027

should work correctly.

Leap years should work through native date libraries.

Do not hardcode calendar dates.

Calendar must continue working indefinitely for future years.

==================================================
48. PT PACKAGE EDGE CASES

If sessions purchased = 12 and user marks a 13th PT date:

do NOT silently block the date.

Allow it but visually show:

13 / 12 used

1 session over package

or another subtle warning.

The tracker records reality.

Do not delete or prevent real attendance.

==================================================
49. MEASUREMENT EDGE CASES

Allow multiple different measurement dates.

Prevent accidental exact duplicate submissions when user double-clicks Save.

If two entries intentionally exist on the same date, either:

allow them with timestamp ordering

OR

prefer editing the existing same-day entry.

For simplicity:
if a body entry already exists for that date, ask whether user wants to update it.

==================================================
50. RECIPE DELETION BEHAVIOR

Deleting a recipe must NOT destroy historical planned meals or meal logs that used it.

Historical meals should retain their snapshot:

meal name
ingredients
quantities

Recipe reference can become null.

==================================================
51. SEARCH / FILTERING

Recipes:

Add simple search by recipe name.

Optional category filters:

Breakfast
Lunch
Dinner
Snack

Do not add complex filtering.

PT history:

sort newest first.

Body history:

sort newest first.

==================================================
52. ACCESSIBILITY

Use proper semantic HTML.

Buttons should be real buttons.

Forms should have labels.

Maintain readable contrast despite pastel palette.

Do not rely exclusively on color to communicate important states.

For PT trained date:
use lavender fill AND another accessible state/label.

Support keyboard navigation on desktop where reasonable.

==================================================
53. MICRO-INTERACTIONS

Use subtle animations.

Examples:

PT date selected:
gentle scale/fade

Tab switch:
quick fade

Modal:
soft slide/fade

Saved state:
small checkmark

Do not use excessive bouncing or playful animations.

Animation should feel polished and calm.

==================================================
54. MOBILE DETAILS

Design specifically for iPhone-sized screens.

Respect safe-area insets.

Bottom navigation must not cover content.

Inputs should avoid causing awkward zoom.

Calendar dates should be easy to tap.

Modals on mobile should preferably appear as bottom sheets where appropriate.

Recipe images can be wider.

Forms should remain single-column.

==================================================
55. DESKTOP DETAILS

Use a maximum content width so the application does not stretch awkwardly on very wide monitors.

Suggested:
1200–1440px content area.

Sidebar:
approximately 220–250px.

Keep whitespace around content.

PT Tracker desktop layout suggestion:

Top:
Current Cycle card

Below:
Calendar | Session history/notes

Body desktop:

Top:
Latest Measurements

Middle:
Progress Graph

Bottom:
History

Meals desktop:

Header:
Plan | Log | Recipes

Main content:
use wider meal cards and comfortable spacing.

==================================================
56. DO NOT BUILD THESE FEATURES

Do NOT add:

Calories
Macros
Protein targets
Water tracker
Sleep tracker
Steps
Apple Health
Garmin
Workout programming
Exercise sets
Exercise reps
Gym timer
BMI
Body fat calculations
AI coach
AI meal generation
Social sharing
Friends
Community
Leaderboards
Achievements
Streak pressure
Push notifications
Medical recommendations
Health diagnoses

These are outside the product scope.

==================================================
57. CORE USER FLOWS TO TEST

FLOW 1 — PT

User logs in.

Creates cycle:

15 Sep → 15 Oct

12 purchased sessions.

Calendar appears.

Tap:
15 Sep
17 Sep
20 Sep

UI displays:

3 PT sessions

3 / 12 used

9 remaining

Refresh browser.

All three dates remain selected.

FLOW 2 — BODY

User adds:

9 Sep

Weight:
52.3kg

Waist:
64cm

Refresh.

Data remains.

Later add:

16 Sep

Weight:
52.0kg

Graph shows two real points.

Latest weight shows:

52.0kg

and difference from previous.

FLOW 3 — RECIPE

Create:

Chicken Rice Bowl

Chicken 150g
Rice 120g
Broccoli 100g

Save.

Refresh.

Recipe remains.

FLOW 4 — PLAN

Choose:

20 Sep

Lunch

Select Chicken Rice Bowl.

Change rice:

120g → 100g

Save plan.

Original recipe must still say:

120g.

FLOW 5 — ATE AS PLANNED

On 20 Sep:

Tap Ate as Planned.

Meal Log now contains independent copy.

Later edit recipe.

Historical Meal Log must NOT change.

FLOW 6 — EDIT ACTUAL

Planned:

Chicken 150g
Rice 100g

Actual:

Chicken 120g
Rice 150g

Save.

Plan remains unchanged.

Recipe remains unchanged.

Actual log stores 120g / 150g.

FLOW 7 — PHOTO

Upload actual meal photo.

Refresh.

Photo remains visible.

==================================================
58. IMPLEMENTATION PRIORITY

Build in this order:

PHASE 1

Set up:
routing
responsive layout
design system
authentication
Supabase database
RLS

PHASE 2

Implement PT Tracker completely.

Do not move on until:

cycles work
calendar works
date ticking works
counts work
history persists

PHASE 3

Implement Body Measurements.

Ensure:
entry creation
history
comparison
graph
editing
deleting

PHASE 4

Implement Recipes.

Ensure:
recipe CRUD
structured ingredients
instructions
image storage

PHASE 5

Implement Meal Plan.

Ensure:
date navigation
recipe selection
recipe snapshotting
planned quantities

PHASE 6

Implement Meal Log.

Ensure:
Ate as Planned
Edit Actual
unplanned meals
actual photos

PHASE 7

Settings
Export
polish
responsive testing
error states

==================================================
59. FINAL QUALITY REQUIREMENTS

Before considering the app complete, verify:

All buttons work.

No fake buttons.

No fake dropdowns.

No fake charts.

No hardcoded demo history presented as real user data.

No frontend-only persistence.

No broken mobile layout.

No calendar timezone bugs.

No accidental recipe mutation from meal plan edits.

No accidental plan mutation from actual meal edits.

No accidental historical meal changes after recipe editing.

No data loss after refresh.

No other user's data accessible.

Images persist.

PT counts update immediately.

Body graph uses actual database entries.

Meal Plan and Meal Log remain clearly separate.

==================================================
60. FINAL PRODUCT FEEL

The finished app should feel like a small personal tool I genuinely want to open every day.

It should NOT feel like:

MyFitnessPal

a bodybuilding app

a hospital portal

an analytics dashboard

a generic SaaS template

It should feel like:

a beautifully organized personal wellness diary.

Simple enough to understand immediately.

Powerful enough to keep years of personal history.

Use the attached mockups as the visual source of truth and preserve their soft lavender, cream, minimal aesthetic while implementing all functionality described above.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b808292d-5265-4fd3-8fdb-42624ed70d75).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
