/**
 * @module student-exam-flow
 *
 * Public API for the student exam flow module.
 *
 * Internal sub-modules:
 *   _constants      – shared constants (storage prefix, age limits, defaults)
 *   _types          – TypeScript types and stage enums
 *   _utils          – low-level serialisation / normalisation helpers
 *   _helpers        – URL / route path builders
 *   _storage        – sessionStorage read / write / patch adapters
 *   _readiness      – MediaPipe activation, checkup readiness, admission state resolution
 *   _stage-resolver – pure state-machine that maps runtime access to a target stage
 */

export * from './_types';
export * from './_constants';
export * from './_utils';
export * from './_helpers';
export * from './_storage';
export * from './_readiness';
export * from './_stage-resolver';
