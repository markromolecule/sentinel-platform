---
title: "ADR: Unified Proctoring Severity Escalation"
type: decision
status: accepted
created: "2026-09-14"
tags: [adr, proctoring, telemetry, severity, mobile, web, security]
---

# ADR: Unified Proctoring Severity Escalation

## Context

Sentinel stores proctoring events through shared rule keys and resolves their severity in the API. Current source applies a calibrated occurrence ladder—`LOW` at 1, `MEDIUM` at 3, and `HIGH` at 6 occurrences within 600 seconds—to AI, browser-behavior, and some mobile rules. It instead makes print-screen, screenshot, app-pinning, and root/jailbreak events immediate `HIGH`.

This produces an inconsistent instructor-monitoring signal: one unverified or accidental event can receive the same severity as repeated conduct, while students are still warned locally. The user has explicitly authorized a single ladder policy for every current proctoring anomaly, including the former immediate-high rules.

### Constraints and success criteria

- Preserve detection, blocking, authentication, tenant/attempt scope, and the original event type/rule key.
- Resolve severity in the server-side telemetry policy so Sentinel Web and Sentinel Mobile remain consistent.
- Keep existing runtime override semantics and avoid a schema migration or client-specific severity copy.
- The first persisted occurrence is `LOW`, the third is `MEDIUM`, and the sixth is `HIGH`, evaluated in a rolling ten-minute window for every current proctoring rule.

### Supersession

This ADR supersedes the *immediate HIGH severity* consequence of `2026-08-31-screenshot-detection-and-prevention.md`. It does not supersede its screenshot detection, prevention, or event-disambiguation controls.

## Options considered

### Option 1: One server-side occurrence ladder for every proctoring rule (accepted)

Use the existing calibrated ladder for all rule keys, including `webSecurity.print_screen_disable`, `mobileSecurity.screenshot_block`, `mobileSecurity.app_pinning_required`, and `mobileSecurity.root_jailbreak_detection`.

- **Advantages:** One understandable policy across Web and Mobile; first events are proportionate; existing rolling-window, deduplication, incident persistence, monitoring, and runtime-override paths remain authoritative.
- **Costs and failure modes:** A first root/jailbreak or capture event is no longer displayed as `HIGH`, so instructors must review its evidence/context rather than relying on severity alone. Poor deduplication or an overly long window can still escalate benign repeated events.
- **Choose when:** The product treats severity as a repeat-evidence indicator rather than an automatic misconduct verdict.

### Option 2: Retain immediate `HIGH` for hard security-boundary rules

Keep the current split: use the ladder for noisy behavioral signals but force `HIGH` for capture, app-pinning, and root/jailbreak rules.

- **Advantages:** Preserves strong operator attention for boundary violations and requires no policy change for those rules.
- **Costs and failure modes:** Directly conflicts with the authorized requirement; duplicate/misattributed single events can overstate severity, and policy meaning differs by rule category.
- **Choose when:** A verified rule is legally or operationally treated as conclusive evidence on its first occurrence.

### Option 3: Configure an independent default ladder for every rule in instructor settings

Add persisted per-rule severity tiers, window sizes, and student-warning controls that instructors can tailor for each exam.

- **Advantages:** Maximum local control and sensitivity tuning.
- **Costs and failure modes:** Adds schemas, validation, UI, migration/versioning, and many hard-to-test policy combinations; inconsistent courses become likely and operators lose a stable severity meaning.
- **Choose when:** Institutions demonstrably need different approved severity policies and can govern their calibration.

## Decision

Adopt **Option 1**. Every current Sentinel proctoring rule uses the common server-side ladder: first persisted occurrence is `LOW`, third is `MEDIUM`, and sixth is `HIGH`, within a rolling 600-second window. No rule is immediate `HIGH` merely because of its rule key.

The severity resolver remains the sole policy authority. Existing rule enablement, capture prevention, root/jailbreak detection, telemetry authentication, evidence collection, and student-side detection warnings remain unchanged. The existing runtime override may adjust repeat thresholds but cannot reverse the ladder ordering.

## Consequences

- **Dependency direction and contract:** Web and Mobile clients continue sending the existing authenticated telemetry contract; the API severity resolver assigns the persisted severity; instructor monitoring consumes the result. No client owns severity policy.
- **Data and migration:** No new table, column, event type, or migration is required. Historical incidents retain their recorded severity; newly resolved incidents follow this policy.
- **Security and privacy:** Detection/blocking protections remain active. Severity is explicitly not proof of misconduct; only incident metadata/evidence available through authorized monitoring may support review. No audio recordings or raw sensor data are introduced.
- **Performance and operations:** The existing ten-minute incident lookback continues to bound matching-event queries. Operators should monitor event volume and the proportion of rules escalating to `HIGH` after deployment.
- **Rollback:** Restore the four former immediate strategies in the resolver if operational evidence shows that the uniform ladder is unsafe; this rolls back future incident classification only and does not rewrite history.

## Validation and review date

- Add resolver tests proving the 1/3/6 ladder for every current telemetry rule, including print-screen, screenshot, app-pinning, and root/jailbreak.
- Verify a mobile screenshot and a Web print-screen event appear in instructor monitoring first as `LOW`, then escalate at the defined counts, while prevention/listeners still work.
- Verify normal telemetry authorization, event-type mapping, deduplication, and per-rule override behavior remain intact.
- Review after the first supervised examination session or on 2026-10-14, whichever comes first; reassess only with incident-volume and false-positive evidence.
