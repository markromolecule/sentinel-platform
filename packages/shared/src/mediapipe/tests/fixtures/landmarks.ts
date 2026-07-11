import type { MediaPipeLandmark } from '../../types';

function createBaseFaceLandmarks(): MediaPipeLandmark[] {
    const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));

    landmarks[1] = { x: 0.5, y: 0.48, z: 0 };
    landmarks[33] = { x: 0.4, y: 0.46, z: 0 };
    landmarks[133] = { x: 0.46, y: 0.46, z: 0 };
    landmarks[263] = { x: 0.6, y: 0.46, z: 0 };
    landmarks[362] = { x: 0.54, y: 0.46, z: 0 };
    landmarks[160] = { x: 0.41, y: 0.452, z: 0 };
    landmarks[159] = { x: 0.43, y: 0.451, z: 0 };
    landmarks[158] = { x: 0.45, y: 0.452, z: 0 };
    landmarks[144] = { x: 0.41, y: 0.468, z: 0 };
    landmarks[145] = { x: 0.43, y: 0.469, z: 0 };
    landmarks[153] = { x: 0.45, y: 0.468, z: 0 };
    landmarks[387] = { x: 0.55, y: 0.452, z: 0 };
    landmarks[386] = { x: 0.57, y: 0.451, z: 0 };
    landmarks[385] = { x: 0.59, y: 0.452, z: 0 };
    landmarks[373] = { x: 0.55, y: 0.468, z: 0 };
    landmarks[374] = { x: 0.57, y: 0.469, z: 0 };
    landmarks[380] = { x: 0.59, y: 0.468, z: 0 };
    landmarks[168] = { x: 0.5, y: 0.35, z: 0 };
    landmarks[152] = { x: 0.5, y: 0.7, z: 0 };

    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.43, y: 0.46, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.57, y: 0.46, z: 0 };
    });

    return landmarks;
}

function mapLandmarks(
    landmarks: MediaPipeLandmark[],
    mapper: (landmark: MediaPipeLandmark) => MediaPipeLandmark,
) {
    return landmarks.map(mapper);
}

/**
 * Builds a centered face with open eyes and centered irises.
 */
export function buildCenteredMediaPipeLandmarks(): MediaPipeLandmark[] {
    return createBaseFaceLandmarks();
}

/**
 * Builds a face looking left from the student's perspective.
 */
export function buildLeftLookingMediaPipeLandmarks(): MediaPipeLandmark[] {
    const landmarks = createBaseFaceLandmarks();

    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.41, y: 0.46, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.55, y: 0.46, z: 0 };
    });

    return landmarks;
}

/**
 * Builds a face looking right from the student's perspective.
 */
export function buildRightLookingMediaPipeLandmarks(): MediaPipeLandmark[] {
    const landmarks = createBaseFaceLandmarks();

    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.45, y: 0.46, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.59, y: 0.46, z: 0 };
    });

    return landmarks;
}

/**
 * Builds a face looking upward.
 */
export function buildUpwardLookingMediaPipeLandmarks(): MediaPipeLandmark[] {
    const landmarks = createBaseFaceLandmarks();

    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.43, y: 0.454, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.57, y: 0.454, z: 0 };
    });

    return landmarks;
}

/**
 * Builds a face looking downward.
 */
export function buildDownwardLookingMediaPipeLandmarks(): MediaPipeLandmark[] {
    const landmarks = createBaseFaceLandmarks();

    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.43, y: 0.466, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.57, y: 0.466, z: 0 };
    });

    return landmarks;
}

/**
 * Builds a face with both eyes nearly closed.
 */
export function buildClosedEyesMediaPipeLandmarks(): MediaPipeLandmark[] {
    const landmarks = createBaseFaceLandmarks();

    landmarks[160] = { x: 0.41, y: 0.458, z: 0 };
    landmarks[159] = { x: 0.43, y: 0.458, z: 0 };
    landmarks[158] = { x: 0.45, y: 0.458, z: 0 };
    landmarks[144] = { x: 0.41, y: 0.462, z: 0 };
    landmarks[145] = { x: 0.43, y: 0.462, z: 0 };
    landmarks[153] = { x: 0.45, y: 0.462, z: 0 };
    landmarks[387] = { x: 0.55, y: 0.458, z: 0 };
    landmarks[386] = { x: 0.57, y: 0.458, z: 0 };
    landmarks[385] = { x: 0.59, y: 0.458, z: 0 };
    landmarks[373] = { x: 0.55, y: 0.462, z: 0 };
    landmarks[374] = { x: 0.57, y: 0.462, z: 0 };
    landmarks[380] = { x: 0.59, y: 0.462, z: 0 };

    return landmarks;
}

/**
 * Builds a face shifted close to the viewport edge.
 */
export function buildViewportEdgeMediaPipeLandmarks(): MediaPipeLandmark[] {
    return mapLandmarks(createBaseFaceLandmarks(), (landmark) => ({
        x: landmark.x + 0.39,
        y: landmark.y,
        z: landmark.z,
    }));
}

/**
 * Builds a partial face near the viewport edge while looking left.
 */
export function buildPartialFaceLookingAwayMediaPipeLandmarks(): MediaPipeLandmark[] {
    return mapLandmarks(buildLeftLookingMediaPipeLandmarks(), (landmark) => ({
        x: landmark.x - 0.36,
        y: landmark.y,
        z: landmark.z,
    }));
}

/**
 * Builds a reduced-size face that falls below the usual confidence threshold.
 */
export function buildLowConfidenceMediaPipeLandmarks(): MediaPipeLandmark[] {
    return mapLandmarks(createBaseFaceLandmarks(), (landmark) => ({
        x: 0.5 + (landmark.x - 0.5) * 0.75,
        y: 0.5 + (landmark.y - 0.5) * 0.75,
        z: landmark.z,
    }));
}
