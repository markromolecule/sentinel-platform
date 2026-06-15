# Telemetry Policy Refactor To-Do Plan (Completed)

## 1. Preparation & Infrastructure

- [x] Create `app/sentinel-api/src/modules/telemetry/ingestion/rules/types.ts` to hold shared constants.
- [x] Define `TelemetryRule` interface.
- [x] Create `app/sentinel-api/src/modules/telemetry/ingestion/rules/` directory and abstract rule.

## 2. Rule Implementation

- [x] Implement `AiRules` strategy (Gaze, Face Detection, Audio Anomaly, Multiple Faces).
- [x] Implement `WebSecurityRules` strategy (Tab switch, Fullscreen, etc.).
- [x] Implement `MobileSecurityRules` strategy (Backgrounding, Screenshot, etc.).

## 3. Configuration Consolidation

- [x] Move `TELEMETRY_RULE_ENABLED_READERS` to the new rules structure.
- [x] Move all thresholds from `telemetry-policy.service.ts` to the rules.

## 4. Service Refactoring

- [x] Update `TelemetryConfigurationResolverService` to use the registry.
- [x] Refactor `TelemetryPolicyService` to use the Rule Registry/Strategy pattern.

## 5. Verification

- [x] Run telemetry ingestion tests.
- [x] Manually verify logic structure.
