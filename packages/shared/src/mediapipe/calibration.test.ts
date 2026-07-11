import { describe, expect, it } from 'vitest';
import {
    buildMediaPipeCalibrationProfile,
    createMediaPipeCalibrationSample,
    isMediaPipeCalibrationCandidate,
    isMediaPipeFaceCenteredForCalibration,
} from './calibration';
import { analyzeMediaPipeFrame } from './analysis';
import {
    buildCenteredMediaPipeLandmarks,
    buildLowConfidenceMediaPipeLandmarks,
    buildViewportEdgeMediaPipeLandmarks,
} from './tests/fixtures/landmarks';

describe('MediaPipe calibration helpers', () => {
    it('accepts centered face bounds within the calibration target window', () => {
        const sample = createMediaPipeCalibrationSample({
            landmarks: buildCenteredMediaPipeLandmarks(),
            confidenceScore: 0.92,
        });

        expect(sample).not.toBeNull();
        expect(isMediaPipeFaceCenteredForCalibration({ faceBounds: sample?.faceBounds ?? null })).toBe(
            true,
        );
    });

    it('rejects viewport-edge bounds outside the calibration target window', () => {
        const sample = createMediaPipeCalibrationSample({
            landmarks: buildViewportEdgeMediaPipeLandmarks(),
            confidenceScore: 0.92,
        });

        expect(
            isMediaPipeFaceCenteredForCalibration({ faceBounds: sample?.faceBounds ?? null }),
        ).toBe(false);
    });

    it('accepts a ready centered frame as a calibration candidate', () => {
        const landmarks = buildCenteredMediaPipeLandmarks();
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [landmarks],
            confidenceThreshold: 0.6,
            tolerateDownwardGaze: true,
        });

        expect(
            isMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            }),
        ).toBe(true);
    });

    it('rejects low-confidence samples as calibration candidates', () => {
        const landmarks = buildLowConfidenceMediaPipeLandmarks();
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [landmarks],
            confidenceThreshold: 0.6,
        });

        expect(
            isMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            }),
        ).toBe(false);
    });

    it('builds a reusable calibration profile from centered samples', () => {
        const sample = createMediaPipeCalibrationSample({
            landmarks: buildCenteredMediaPipeLandmarks(),
            confidenceScore: 0.92,
        });
        const profile = buildMediaPipeCalibrationProfile({
            samples: sample ? [sample] : [],
            createdAt: '2026-07-11T00:00:00.000Z',
        });

        expect(profile).toMatchObject({
            version: 1,
            sampleCount: 1,
            confidenceScore: 0.92,
        });
    });
});
