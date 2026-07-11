# Attempt Monitoring Platform Compatibility

This matrix documents observed browser delivery for attempt-page screenshot shortcuts. It is intentionally about event delivery, not guaranteed operating-system prevention.

## Screenshot Shortcut Delivery

| Platform | Browser | Shortcut | Browser event delivered? | Expected app behavior when delivered | Notes |
| --- | --- | --- | --- | --- | --- |
| Windows | Chrome | `PrintScreen` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Some keyboards map this through firmware or vendor tools. |
| Windows | Edge | `PrintScreen` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Browser delivery may differ when Snipping Tool interception is enabled. |
| Windows | Chrome | `Meta+Shift+S` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Often intercepted by the OS before page handlers run. |
| Windows | Edge | `Meta+Shift+S` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Verify with and without focus-assist or shell overlays. |
| macOS | Chrome | `Cmd+Shift+3` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Frequently intercepted by macOS before JavaScript receives `keydown`. |
| macOS | Chrome | `Cmd+Shift+4` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Region-capture UI may fully bypass the page. |
| macOS | Chrome | `Cmd+Shift+5` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | System capture panel often consumes the shortcut first. |
| macOS | Safari | `Cmd+Shift+3` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Safari may never receive the event if macOS intercepts it first. |
| macOS | Safari | `Cmd+Shift+4` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Validate on the exact macOS version in support scope. |
| macOS | Safari | `Cmd+Shift+5` | Manual verification pending | Log one `PRINT_SCREEN_ATTEMPT`, show best-effort warning, lock per exam policy | Record whether the browser receives any keydown before the capture panel appears. |

## Interpretation

- If the browser delivers the keyboard event, attempt monitoring should log exactly one `PRINT_SCREEN_ATTEMPT` per accepted burst.
- If the operating system intercepts the shortcut before delivery, the page cannot reliably detect or block it.
- Product and support communication should describe this feature as best-effort browser monitoring, not guaranteed screenshot prevention.
