# Telemetry Frequency-Aware Operator Note

Use the stored incident context in this order when reviewing a telemetry flag:

1. Read `currentSeverity` and `severityReason` first.
2. Check `occurrenceCount`, `matchingWindowSeconds`, and `aggregation.trigger` to see whether the incident was a one-off threshold hit or a repeated pattern.
3. Check `severityInputs.overrideSeverity` before assuming the severity was organic. If present, support forced the final severity.

Interpretation guide:

- `default-ladder`: first reviewable occurrence after the event crossed its persistence threshold
- `repeat-escalated`: the same rule repeated inside its matching window and pushed severity up
- `immediate-high`: the rule is severe on first persistence
- `threshold-fixed`: the event crossed its threshold and kept a fixed severity
- `forced-override`: support pinned the final severity explicitly

Backward compatibility:

- Older `flagged_incidents.details` rows may not contain `severityReason` or `severityInputs`.
- For older rows, fall back to the stored severity, occurrence count, `lastEvent`, and timestamp ordering.
