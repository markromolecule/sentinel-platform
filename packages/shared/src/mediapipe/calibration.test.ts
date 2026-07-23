import { describe, expect, it } from 'vitest';
import {
    buildMediaPipeCalibrationProfile,
    createMediaPipeCalibrationSample,
    isMediaPipeCalibrationCandidate,
    isMediaPipeFaceCenteredForCalibration,
    evaluateMediaPipeCalibrationCandidate,
} from './calibration';
import { analyzeMediaPipeFrame } from './analysis';
import {
    buildCenteredMediaPipeLandmarks,
    buildLowConfidenceMediaPipeLandmarks,
    buildViewportEdgeMediaPipeLandmarks,
    buildClosedEyesMediaPipeLandmarks,
} from './tests/fixtures/landmarks';

describe('MediaPipe calibration helpers', () => {
    it('accepts centered face bounds within the calibration target window', () => {
        const sample = createMediaPipeCalibrationSample({
            landmarks: buildCenteredMediaPipeLandmarks(),
            confidenceScore: 0.92,
        });

        expect(sample).not.toBeNull();
        expect(
            isMediaPipeFaceCenteredForCalibration({ faceBounds: sample?.faceBounds ?? null }),
        ).toBe(true);
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

    describe('evaluateMediaPipeCalibrationCandidate', () => {
        it('evaluates centered face as accepted', () => {
            const landmarks = buildCenteredMediaPipeLandmarks();
            const analysis = analyzeMediaPipeFrame({
                landmarksByFace: [landmarks],
                confidenceThreshold: 0.6,
            });
            const result = evaluateMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            });
            expect(result).toEqual({
                isValid: true,
                reason: 'accepted',
                details: 'Calibration sample is valid and centered.',
            });
        });

        it('evaluates closed eyes as eyes-closed', () => {
            const landmarks = buildClosedEyesMediaPipeLandmarks();
            const analysis = analyzeMediaPipeFrame({
                landmarksByFace: [landmarks],
                confidenceThreshold: 0.6,
            });
            const result = evaluateMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            });
            expect(result).toMatchObject({
                isValid: false,
                reason: 'eyes-closed',
            });
        });

        it('evaluates low confidence as low-confidence', () => {
            const landmarks = buildCenteredMediaPipeLandmarks();
            const analysis = analyzeMediaPipeFrame({
                landmarksByFace: [landmarks],
                confidenceThreshold: 0.6,
            });
            const result = evaluateMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.95, // Above the analysis confidence score
            });
            expect(result).toMatchObject({
                isValid: false,
                reason: 'low-confidence',
            });
        });

        it('evaluates too close face as too-close', () => {
            // Scale up coordinates to make face too large
            const landmarks = buildCenteredMediaPipeLandmarks().map((landmark) => ({
                x: 0.5 + (landmark.x - 0.5) * 3.0,
                y: 0.5 + (landmark.y - 0.5) * 3.0,
                z: landmark.z,
            }));
            const analysis = analyzeMediaPipeFrame({
                landmarksByFace: [landmarks],
                confidenceThreshold: 0.6,
            });
            const result = evaluateMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            });
            expect(result).toMatchObject({
                isValid: false,
                reason: 'too-close',
            });
        });

        it('evaluates too far face as too-far', () => {
            // Scale down coordinates to make face too small
            const landmarks = buildCenteredMediaPipeLandmarks().map((landmark) => ({
                x: 0.5 + (landmark.x - 0.5) * 0.4,
                y: 0.5 + (landmark.y - 0.5) * 0.4,
                z: landmark.z,
            }));
            const analysis = analyzeMediaPipeFrame({
                landmarksByFace: [landmarks],
                confidenceThreshold: 0.6,
            });
            const result = evaluateMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            });
            expect(result).toMatchObject({
                isValid: false,
                reason: 'too-far',
            });
        });

        it('evaluates cropped face near viewport edge as cropped', () => {
            const landmarks = buildViewportEdgeMediaPipeLandmarks();
            const analysis = analyzeMediaPipeFrame({
                landmarksByFace: [landmarks],
                confidenceThreshold: 0.6,
            });
            const result = evaluateMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            });
            expect(result).toMatchObject({
                isValid: false,
                reason: 'cropped',
            });
        });

        it('evaluates off-center face as off-center', () => {
            // Shift face bounds so it is off-center but not cropped
            const landmarks = buildCenteredMediaPipeLandmarks().map((landmark) => ({
                x: landmark.x + 0.22, // Shift right, center becomes ~0.72 (target is 0.5, delta is 0.22 > 0.15)
                y: landmark.y,
                z: landmark.z,
            }));
            const analysis = analyzeMediaPipeFrame({
                landmarksByFace: [landmarks],
                confidenceThreshold: 0.6,
            });
            const result = evaluateMediaPipeCalibrationCandidate({
                analysis,
                landmarks,
                confidenceThreshold: 0.6,
            });
            expect(result).toMatchObject({
                isValid: false,
                reason: 'off-center',
            });
        });
    });
});
