# Session Muscle Heatmap

## Goal
Add one compact “Muscles Trained” visualization inside the selected Training session, after its exercises. It will show only that session’s activity and leave the main Muscle Balance card unchanged.

## Implementation
- Reuse the existing canonical Exercise Library links, aliases, and primary/secondary muscle metadata.
- Extract the shared working-set credit calculation so both Muscle Balance and the session heatmap use identical rules, including split credit across multiple primary muscles and 50% secondary credit.
- Make the shared calculation tolerate older or incomplete metadata safely, resolving confident historical names through the same existing fallback.
- Add a compact responsive front/back anatomical SVG with neutral regions, light lavender secondary/low-credit regions, and stronger lavender for higher session-relative credits.
- Map the existing broad groups to appropriate visible regions: Chest, Shoulders, Arms, Core, Quads, Back, Glutes, and Hamstrings. Tooltips/tap labels will show the group and set credits without permanent numeric clutter.
- Render the heatmap within `SessionDetails`, after the exercise list/add control and before the session note, with no period selector or additional analytics.
- Recalculate automatically from the selected session query after exercise add, edit, delete, or set changes.

## Validation
- Check empty sessions remain neutral and show the requested guidance.
- Verify a populated session reflects only that day and updates after changing sets or exercises.
- Confirm the existing Muscle Balance card is unchanged and the Training page fits desktop and mobile without horizontal scrolling.
- Run the focused type check and browser checks with no runtime errors.