# INFRASTRUCTURE-AUDIT.md

_This supersedes the previous version of this file with the findings from the current deep verification pass (build-error fix, favicon fix, logo-animation consistency fix, and a full infrastructure re-check)._

## Files inspected
`package.json`, `package-lock.json`, `angular.json`, `tsconfig.json` / `tsconfig.app.json` / `tsconfig.spec.json`, `tailwind.config.js`, `postcss.config.js`, `Dockerfile`, `proxy.conf.json`, `src/environments/*`, `public/`, `src/assets/`.

## package.json / package-lock.json
- Angular 17.3, NgRx 17.2, Angular Material 17.3, Angular CDK 17.3, RxJS 7.8, `@microsoft/signalr` 8.0.7, `cytoscape` 3.30.2 (correctly declared as `allowedCommonJsDependencies` in `angular.json` since it's a CommonJS package) — all internally consistent version ranges.
- Dev tooling: `@angular/cli`/`@angular-devkit/build-angular` 17.3, TypeScript 5.4, Karma/Jasmine for tests, `tailwindcss` 3.4 + `autoprefixer` 10.4 + `postcss` 8.4 for the styling pipeline.
- `npm run build` → `ng build --configuration production`; `npm run build:dev` → development config; `npm run watch` → watch mode (this is the script the original build-failure log was produced from). All scripts reference configurations that exist in `angular.json`.
- No missing peer packages or duplicate/conflicting dependency declarations found.

## angular.json
- `assets`: `public/**/*` → `/` is correctly configured for both the `build` and `test` architect targets, so `favicon.svg` and any other files dropped in `public/` reach the output root.
- `fileReplacements` for `production` / `development` / `staging` configurations point at `environment.prod.ts`, `environment.development.ts`, and `environment.staging.ts` respectively — all three files exist and match exactly (no `environment.production.ts` typo/mismatch).
- `styles: ["src/styles.scss"]` is the single global stylesheet, which itself emits the three `@tailwind` directives — confirms Tailwind is genuinely active, not vestigial config.
- Production budgets, `outputHashing`, `aot`, and `buildOptimizer` are all configured.

## TypeScript configuration
- `tsconfig.json` path aliases (`@core/*`, `@shared/*`, `@features/*`, `@layout/*`, `@store/*`, `@environments/*`) all map correctly to the real `src/app/...` folders — verified by resolving every aliased import used in the codebase.
- `tsconfig.app.json` extends the root config and points at `src/main.ts` as the single entry file. `tsconfig.spec.json` exists for Karma tests.

## Tailwind / PostCSS
- `postcss.config.js` registers `tailwindcss` + `autoprefixer`.
- `tailwind.config.js` content globs (`./src/**/*.{html,ts,scss}`) correctly cover every component template/style, `darkMode: 'class'` matches the app's manual dark/light theme toggle (see `index.html`'s inline pre-render script and `ThemeService`), and brand colors (`aegis`, `gold`) mirror the CSS custom properties in `styles.scss`. No conflicts found between the Tailwind utility layer and the custom-property-based theme system.

## Docker / Proxy
- `Dockerfile`: multi-stage build (`node:20-alpine` -> `nginx:alpine`), correctly copies `dist/aegislex/browser` (matching `angular.json`'s `outputPath: "dist/aegislex"` plus the Angular 17 application builder's `browser/` subfolder convention) into nginx, and writes an SPA-friendly `try_files ... /index.html` config with sane static-asset caching headers. No changes needed.
- `proxy.conf.json`: proxies `/api` and `/hubs` (WebSocket-enabled) to `http://localhost:5000` for local dev against a real backend — consistent with `signalRUrl` patterns in the environment files.

## Environments
All four environment files (`environment.ts`, `.development.ts`, `.prod.ts`, `.staging.ts`) satisfy every field of `EnvironmentConfig` (`environment.interface.ts`) with no missing or extra keys, and are consumed exclusively through `EnvironmentService` (never imported directly elsewhere except in interceptors/adapters that intentionally need the raw `mockMode`/`production` flags).

## Public / assets folders
- `public/` contains `favicon.svg` (now correctly referenced — see `FAVICON-AUDIT.md`) and a placeholder `.gitkeep`.
- `src/assets/` exists but is empty and is **not** referenced anywhere in `angular.json`'s asset globs or in any component/template (`grep` for `assets/` paths across all `.html`/`.ts`/`.scss` returned zero matches). It's harmless, unused scaffolding — left in place per "do not remove infrastructure files," but flagged so it isn't mistaken for a missing-assets bug.

## Housekeeping
Several empty, literally-named directories (e.g. `src/{app/{core/{guards,...` — leftover artifacts of an unexpanded brace-glob `mkdir -p` command from an earlier session) were found scattered under `src/`. They contained zero files and were not referenced by any import, route, or config. They were removed as harmless cleanup; nothing functional was touched.

## No other infrastructure issues found
Docker, proxy, PostCSS, Tailwind, TypeScript paths, and all four environment files are internally consistent and correctly wired to `angular.json`/`package.json`. No restorations were necessary — nothing required was missing.
