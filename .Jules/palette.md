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


## 2024-10-09 - DateRangeCalendar Accessibility Improvement
**Learning:** Found that custom date range components (like `DateRangeCalendar.tsx`) often utilize decorative icons for structural control (like Close, Month Navigation, Selected Item removal). When these buttons lack visible text or aria-labels, and the icons lack `aria-hidden="true"`, screen readers provide confusing descriptions to visually impaired users.
**Action:** Always provide explicit `aria-label`s or visually-hidden labels for icon-only buttons, add `aria-expanded` properties for buttons that trigger dropdowns/lists, and assign `aria-hidden="true"` to any decorative icon nodes (like "✕", "‹", "▼") nested within them.
