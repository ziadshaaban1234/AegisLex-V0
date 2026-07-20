# LOGO-ANIMATION-AUDIT.md

## Where the animated logo appears
Two distinct SVG treatments exist in the project, both showing a tilting scale/beam:

1. **Brand shield mark** (`shield-scale-beam` class) — a small shield containing the tilting scale, used identically (same SVG markup) in:
   - `src/app/layout/sidebar/sidebar.component.html`
   - `src/app/features/auth/login/login.component.html` (and shared by the other auth pages via `_auth-shared.scss`, which styles the brand panel for login/register/forgot-password/verify-otp/reset-password)
2. **Standalone Scale-of-Justice icon** (`ScaleOfJusticeComponent`, `soj-beam-group` class) — a larger, full justice-scale icon used as decorative/empty-state imagery in: landing, dashboard, analysis, search, and the 404 (not-found) page.

There is no separate "splash screen" component in this project — the brand mark in the sidebar/auth pages is the closest equivalent and was the focus of this review.

## Issues Found

### 1. Inconsistent keyframes for the *same* brand logo (confirmed bug)
`@keyframes shieldTilt` was defined twice — once in `sidebar.component.scss` and once in `_auth-shared.scss` — for the exact same SVG markup. The sidebar version had 8 keyframe stops (including a settle step at 96%), while the auth-pages version had only 6 stops and jumped straight from −4deg at 88% back to 0deg at 100%. Result: the identical logo animated with a subtly different rhythm depending on which page it was rendered on — a real visual-consistency defect.

### 2. Uneven keyframe spacing causing a subtle jitter (confirmed quality issue)
The standalone `ScaleOfJusticeComponent` used its own keyframe set with very uneven segment lengths (7%–20% per segment) under a single shared cubic-bezier easing function. Because ease-in/ease-out curves slow to near-zero velocity at every keyframe boundary, short segments and long segments produced visibly different speeds — perceived as a faint stutter/jitter at each direction change, rather than one continuous, premium-feeling sweep.

## Fixes Applied
- Unified `_auth-shared.scss`'s `shieldTilt` keyframes with the sidebar's (added the missing 96% settle step), so the brand shield logo now animates identically everywhere it appears.
- Re-timed `ScaleOfJusticeComponent`'s `sojTilt` keyframes and easing to match the brand's established rhythm exactly (same percentages, same rotation amounts, same `ease-in-out`, same 5s duration) instead of its own ad hoc curve. This removes the uneven-segment jitter and gives the whole app a single, consistent "signature" motion for every tilting-scale icon, without altering the icon's geometry or design.
- No duration was made faster, no bounce/elastic easing was introduced, and `prefers-reduced-motion: reduce` support (already present in both places) was left intact.

## Final Animation Behavior
All tilting-scale icons across the app (sidebar, auth pages, landing/dashboard/analysis/search/not-found) now share:
- 5s duration, `ease-in-out` timing, infinite loop.
- Keyframes: `0% → 20% (-9deg) → 42% (0deg) → 58% (+8deg) → 76% (0deg) → 88% (-4deg) → 96% (0deg) → 100% (0deg)`.
- Smooth deceleration into each rest position, no abrupt jumps, no mismatched rhythm between pages.
- Reduced-motion users get a static logo (animation disabled).

This satisfies the "smooth, consistent, professional, no jitter, no desync" requirements without redesigning or replacing any branding.
