# Attempt Monitoring Platform Compatibility

This matrix documents observed browser delivery for attempt-page screenshot shortcuts. It is intentionally about event delivery, not guaranteed operating-system prevention.

## Screenshot Shortcut Delivery

| Platform | Browser | Shortcut       | Browser event delivered?    | Expected app behavior when delivered                                           | Notes                                                                             |
| -------- | ------- | -------------- | --------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Windows  | Chrome  | `PrintScreen`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Some keyboards map this through firmware or vendor tools.                         |
| Windows  | Edge    | `PrintScreen`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Browser delivery may differ when Snipping Tool interception is enabled.           |
| Windows  | Chrome  | `Meta+Shift+S` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Often intercepted by the OS before page handlers run.                             |
| Windows  | Edge    | `Meta+Shift+S` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Verify with and without focus-assist or shell overlays.                           |
| macOS    | Chrome  | `Cmd+Shift+3`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Frequently intercepted by macOS before JavaScript receives `keydown`.             |
| macOS    | Chrome  | `Cmd+Shift+4`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Region-capture UI may fully bypass the page.                                      |
| macOS    | Chrome  | `Cmd+Shift+5`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | System capture panel often consumes the shortcut first.                           |
| macOS    | Safari  | `Cmd+Shift+3`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Safari may never receive the event if macOS intercepts it first.                  |
| macOS    | Safari  | `Cmd+Shift+4`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Validate on the exact macOS version in support scope.                             |
| macOS    | Safari  | `Cmd+Shift+5`  | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Record whether the browser receives any keydown before the capture panel appears. |

## Interpretation

- If the browser delivers the keyboard event, attempt monitoring should log exactly one `PRINT_SCREEN_ATTEMPT` per accepted burst.
- If the operating system intercepts the shortcut before delivery, the page cannot reliably detect or block it.
- Product and support communication should describe this feature as best-effort browser monitoring, not guaranteed screenshot prevention.

## MediaPipe Calibration & Framing Compatibility (Observed July 2026)

To support varying mobile device distances, viewports, and cameras without false positive proctoring alerts, we use the following calibration rules:

### Calibration Bounded Reason Codes

During calibration, samples are rejected with specific status reasons if the geometry does not meet centering and framing bounds:

- **`too-close`**: Normalized face area (width * height) exceeds `0.50` (e.g. face fills more than half of the frame). Surfaces guidance: _"Your face is too close to the camera. Please move the device farther away."_
- **`too-far`**: Normalized face area is below `0.05` (e.g. user is too far). Surfaces guidance: _"Your face is too far from the camera. Please move closer to the device."_
- **`cropped`**: Face bounds coordinates hit the edge boundaries (minX < 0.05, maxX > 0.95, etc. on normal framing). Surfaces guidance: _"Your face is partially out of frame. Please ensure your entire face is visible."_
- **`off-center`**: Face center deviates horizontally by more than `0.15` or vertically by more than `0.20` from the calibration target. Surfaces guidance: _"Your face is off-center. Please look directly at the center of the camera."_
- **`eyes-closed`**: Both eyes appear closed. Surfaces guidance: _"Both eyes appear closed. Please keep your eyes open during calibration."_
- **`low-confidence`**: Face landmarks are detected but lighting/contrast is too low. Surfaces guidance: _"Lighting or camera quality is low. Please center your face in a well-lit room."_

### Responsive Viewports & Scaling

- **Below `1024px` (`lg`)**: Horizontally scrolled question navigation rail prevents layout overflow when virtual keyboards open.
- **Below `1280px` (`xl`)**: Reading passage content starts closed inside an accessible sheet drawer. Main question pane is maximized.
- **At `xl` and above**: Reading passage is side-by-side using the resizable panel.
