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


## 2024-10-25 - [Accessible Icon-Only Action Buttons]
**Learning:** Found several components (like DateRangeCalendar, TradingSidePanels, and CollapsibleSection) containing icon-only action buttons (e.g., using "✕", "‹", "›" or SVG icons) without accessible names. Relying solely on visual cues or `title` attributes makes these critical interaction points unreadable for screen reader users. Additionally, when a button contains both a decorative icon and text, but the text is hidden on small screens (`sm:inline`), the button loses its accessible name on mobile devices.
**Action:** Always add explicit `aria-label` attributes to any icon-only button. If an icon is purely decorative or accompanied by an `aria-label` on the parent button, add `aria-hidden="true"` to the icon element itself.
