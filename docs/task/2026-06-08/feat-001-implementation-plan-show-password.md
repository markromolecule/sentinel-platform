# Show/Hide Password Feature in Authentication Pages

Implement show/hide password toggle functionality using an eye icon on the login and update-password forms across `sentinel-web`, `sentinel-core`, and `sentinel-support`.

## User Review Required

> [!NOTE]
> The registration form in `sentinel-web` (`register-form.tsx`) already contains the show/hide password toggle implementation using Lucide's `Eye` and `EyeOff` icons. Therefore, no modifications are needed for the registration form. We will only be updating the login and update-password forms.

## Open Questions

None. The requirements are clear: add an eye icon to toggle password visibility in the specified auth forms.

## Proposed Changes

### Sentinel Web

#### [MODIFY] [login-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/auth/login/_components/login-form.tsx)

- Import `useState` from `'react'`.
- Import `Eye`, `EyeOff` from `'lucide-react'`.
- Add state `showPassword` (boolean) to toggle the password field `type` between `'password'` and `'text'`.
- Wrap the password `Input` in a `relative` div container.
- Add `pr-10` to the password `Input` className.
- Add absolute-positioned eye toggle button with accessibility `aria-label="Toggle password visibility"`.

#### [MODIFY] [update-password-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/auth/update-password/_components/update-password-form.tsx)

- Import `useState` from `'react'`.
- Import `Eye`, `EyeOff` from `'lucide-react'`.
- Add states `showPassword` and `showConfirmPassword` (boolean) to toggle visibility for both the new password and confirm password inputs.
- Wrap both inputs in `relative` div containers and add `pr-10` to their classNames.
- Add eye toggle buttons with `aria-label` for both inputs.

#### [NEW] [login-form.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/auth/login/_components/login-form.test.tsx)

- Create a unit test to verify that the password input type toggles between `'password'` and `'text'` when the toggle button is clicked.

---

### Sentinel Core

#### [MODIFY] [login-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/auth/login/_components/login-form.tsx)

- Add the same state and eye toggle layout as in `sentinel-web`'s login form.

#### [MODIFY] [update-password-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/auth/update-password/_components/update-password-form.tsx)

- Add the same state and eye toggle layout as in `sentinel-web`'s update password form.

---

### Sentinel Support

#### [MODIFY] [login-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/auth/login/_components/login-form.tsx)

- Add the same state and eye toggle layout as in `sentinel-web`'s login form.

#### [MODIFY] [update-password-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/auth/update-password/_components/update-password-form.tsx)

- Add the same state and eye toggle layout as in `sentinel-web`'s update password form.

## Verification Plan

### Automated Tests

- Run Vitest for the `sentinel-web` auth components:
    ```bash
    pnpm --dir app/sentinel-web test login-form.test.tsx
    ```

### Manual Verification

- Start the development server:
    ```bash
    pnpm dev
    ```
- Navigate to the login page of each web app (`sentinel-web`, `sentinel-core`, `sentinel-support`):
    - Check that password input is hidden by default.
    - Verify that the eye icon displays.
    - Click the eye icon and confirm the password text is revealed (input type becomes `'text'`), and the icon changes to `EyeOff`.
    - Click again and confirm the password is hidden (input type becomes `'password'`), and the icon reverts to `Eye`.
- Navigate to the update-password page of each web app:
    - Verify both "New Password" and "Confirm Password" show/hide toggles work independently.
