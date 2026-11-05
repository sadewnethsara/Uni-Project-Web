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


## 2026-11-05 - Inputs missing accessible labels and focus indicators
**Learning:** A pattern was found where placeholder-only text inputs lacked `aria-label`s, preventing screen readers from identifying them. Additionally, using `outline-none` or `focus:outline-none` without providing alternative focus styles makes the inputs inaccessible for keyboard users as focus state is invisible.
**Action:** When creating form inputs without associated `<label>` elements, always add a descriptive `aria-label`. When suppressing default focus outlines using `outline-none` or `focus:outline-none`, always append `focus-visible:ring-2 focus-visible:ring-offset-2` to provide clear keyboard focus indication.
