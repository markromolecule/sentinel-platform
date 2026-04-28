/**
 * @module calibration
 *
 * Re-exports the public calibration API from the modular sub-package.
 * Individual modules live under `./calibration/`:
 *
 *   eye-state.ts           — Eye Aspect Ratio & open/closed classification
 *   gaze-offset.ts         — Iris position & head-pose offset calculation
 *   calibration-sample.ts  — Sample creation & candidate validation
 *   calibration-profile.ts — Profile aggregation & default thresholds
 *   gaze-direction.ts      — Direction classification from a calibrated sample
 */
export * from './calibration/index';
