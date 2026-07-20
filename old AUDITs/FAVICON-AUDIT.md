# FAVICON-AUDIT.md

## Favicon Location
- Asset file: `public/favicon.svg` (brand shield + scale-of-justice mark, gradient `#3730d4 → #4e4eeb → #7c6ff7`, gold pivot accent — matches the sidebar/auth logo treatment).
- `public/` is configured in `angular.json` (`architect.build.options.assets`, and mirrored under `architect.test.options.assets`) with:
  ```json
  { "glob": "**/*", "input": "public", "output": "/" }
  ```
  This copies everything in `public/` to the root of the build output (`dist/aegislex/browser/`), so `favicon.svg` is correctly emitted as `/favicon.svg` in both dev-server and production builds. No angular.json change was needed.

## Issue Found
`src/index.html` referenced a favicon that does not exist anywhere in the project:
```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
```
There is no `favicon.ico` file in `public/`, `src/assets/`, or anywhere else in the repository — only `favicon.svg` exists. This is a real, confirmed broken reference:
- **Dev server**: `GET /favicon.ico` → 404.
- **Production build**: same 404, since no `.ico` file is ever emitted.
- **Browser tab**: shows a blank/default icon instead of the brand mark.
- MIME type was also wrong for an SVG (`image/x-icon` instead of `image/svg+xml`).

## Fix Applied
```html
<link rel="icon" type="image/svg+xml" href="favicon.svg">
```
This points at the actual, existing asset with the correct MIME type. No branding was changed, replaced, or redesigned — the existing shield/scale SVG is now simply referenced correctly.

## Verification Result
- ✅ File exists at `public/favicon.svg`.
- ✅ Path referenced in `index.html` now matches the real file and the build output path (`/favicon.svg` relative to `<base href="/">`).
- ✅ `angular.json` asset glob already copies `public/**/*` to the build root for both the `build` and `test` targets — no config change required.
- ✅ Same `index.html` is used for `ng serve` and `ng build`, so the fix applies uniformly to dev, hard-refresh, new sessions, and production builds.
- ✅ No other `<link rel="icon">` or duplicate favicon references exist in the project that could conflict.

No other favicon issues were found.
