## 2026-10-06 - [Agricultural Commodity SVG Icon Lookup & Aliasing]
**Learning:** Commodity slugs in the database often contain legacy variations, hyphens, or localized names (e.g. `cabbage--kandy-`, `potato--imported-`, `red-onion--vedalan-`, `b-onion`). Hardcoding direct filename matches causes broken images or fallback `N/A` badges on the market cards.
**Action:** Always route commodity icon lookups through the centralized alias dictionary in `src/lib/iconsData.ts` (`SRI_LANKA_COMMODITY_ALIASES`) and `src/lib/marketPageData.ts`. Ensure an accessible fallback emoji or SVG is rendered gracefully with proper `alt` text.

---

## 2026-10-06 - [Mobile Trader & Responsive Touch Target Optimization]
**Learning:** Agricultural traders and farmers frequently access NAMIS via low-end mobile devices in sunlight conditions. Dense tables or small interactive controls create poor UX.
**Action:** 
1. Maintain minimum 44×44px interactive tap targets for all market selectors and date range buttons.
2. Maintain high-contrast text ratios (WCAG 2.1 AA, minimum 4.5:1) in both light and dark mode themes.
3. Use Tailwind CSS v4 fluid typography and grid layouts (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).

---

## 2024-05-18 - [LoginModal Accessibility Improvement]
**Learning:** Found that custom forms in this React app occasionally lack proper `htmlFor` and `id` bindings between `<label>` and `<input>` elements, which hurts screen reader accessibility and click-to-focus behavior.
**Action:** Always verify that every `<label>` correctly binds to its corresponding form control via `htmlFor` and `id` attributes. Additionally, ensure that visually required fields are clearly marked with an asterisk (`*`), using `aria-hidden="true"` to prevent redundant screen reader announcements.

---

## 2026-10-08 - MarketFilterBar Accessibility Improvement
**Learning:** Found that select and button elements in src/components/MarketFilterBar.tsx lacked accessible names, impacting screen reader navigation.
**Action:** Always ensure that interactive elements such as form controls and icon-only buttons include aria-label attributes for better accessibility.

---

## 2024-10-07 - Accessible Icon-Only Password Toggles
**Learning:** Icon-only buttons used for password visibility toggles (eye icons) need `aria-label` and `title` attributes that dynamically change based on state (e.g., "Show password" vs "Hide password"). Without these, screen readers announce them as generic buttons, creating a confusing experience for visually impaired users.
**Action:** Always add dynamic `aria-label` and `title` attributes to icon-only buttons that toggle state, especially in forms.

