## $(date +%Y-%m-%d) - LoginModal Accessibility Improvement
**Learning:** Found that custom forms in this React app occasionally lack proper `htmlFor` and `id` bindings between `<label>` and `<input>` elements, which hurts screen reader accessibility and click-to-focus behavior.
**Action:** Always verify that every `<label>` correctly binds to its corresponding form control via `htmlFor` and `id` attributes. Additionally, ensure that visually required fields are clearly marked with an asterisk (`*`), using `aria-hidden="true"` to prevent redundant screen reader announcements.
## 2026-10-06 - Added aria-label to password visibility toggles
**Learning:** Password visibility toggles (eye icons) without text labels are completely inaccessible to screen reader users, making it impossible to know if they are revealing their password.
**Action:** Ensure all icon-only buttons, especially those controlling sensitive inputs like passwords, have an `aria-label`.
