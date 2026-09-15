# Use Lexend throughout the application

## Changes
- Replace the current Google Fonts request with Lexend weights 400, 500, 600, and 700.
- Set Lexend as the sole global font family through the existing typography token.
- Remove any local font-family override so charts and third-party controls inherit Lexend too.
- Keep all existing sizes, spacing, colors, layouts, and font-weight choices unchanged.

## Verification
- Search the application for remaining previous-font and secondary-font references.
- Check the running app on the current mobile view and a desktop view to confirm computed fonts are Lexend.
