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


## $(date +%Y-%m-%d) - Input Placeholder Accessibility
**Learning:** Found several input fields (`type="email"` and `type="text"`) in components like `NewsletterSection.tsx`, `AnalyzeFilterBar.tsx`, and `FloatingChat.tsx` that relied solely on `placeholder` attributes without an associated `<label>` or `aria-label`. This negatively impacts screen reader users who may not receive adequate context. Additionally, many of these inputs used `focus:outline-none` without an accessible alternative focus ring, hindering keyboard navigation.
**Action:** Always add `aria-label` to form controls that lack a visible `<label>`. When removing the default browser outline with `focus-visible:outline-none` or `focus:outline-none`, always ensure an alternative, visible focus indicator is provided using classes like `focus-visible:ring-2 focus-visible:ring-offset-2` to maintain keyboard accessibility.
