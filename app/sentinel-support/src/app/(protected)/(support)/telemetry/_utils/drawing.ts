import {
    calculateMediaPipeFaceBounds,
    type MediaPipeFrameAnalysis,
    type MediaPipeLandmark,
} from '@sentinel/shared';

export type DrawOverlayArgs = {
    canvas: HTMLCanvasElement | null;
    video: HTMLVideoElement | null;
    landmarksByFace: MediaPipeLandmark[][];
    analysis: MediaPipeFrameAnalysis | null;
    overlayEnabled: boolean;
};

export function drawOverlay(args: DrawOverlayArgs) {
    const { canvas, video, landmarksByFace, analysis, overlayEnabled } = args;

    if (!canvas || !video) {
        return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
        return;
    }

    if (canvas.width !== width) {
        canvas.width = width;
    }

    if (canvas.height !== height) {
        canvas.height = height;
    }

    const context = canvas.getContext('2d');

    if (!context) {
        return;
    }

    context.clearRect(0, 0, width, height);

    if (!overlayEnabled) {
        return;
    }

    const strokeStyle =
        analysis?.status === 'off-screen'
            ? '#f59e0b'
            : analysis?.status === 'multiple-faces'
              ? '#ef4444'
              : analysis?.status === 'no-face'
                ? '#f97316'
                : '#22c55e';

    context.lineWidth = 2;
    context.strokeStyle = strokeStyle;
    context.fillStyle = strokeStyle;

    landmarksByFace.forEach((landmarks) => {
        landmarks.forEach((landmark, index) => {
            if (index % 6 !== 0) {
                return;
            }

            context.beginPath();
            context.arc(landmark.x * width, landmark.y * height, 1.5, 0, Math.PI * 2);
            context.fill();
        });

        const bounds = calculateMediaPipeFaceBounds(landmarks);

        if (!bounds) {
            return;
        }

        context.strokeRect(
            bounds.minX * width,
            bounds.minY * height,
            bounds.width * width,
            bounds.height * height,
        );
    });

    if (analysis) {
        context.fillStyle = 'rgba(15, 23, 42, 0.85)';
        context.fillRect(12, 12, 240, 56);
        context.fillStyle = '#f8fafc';
        context.font = '12px monospace';
        context.fillText(`status: ${analysis.status}`, 24, 34);
        context.fillText(`signal: ${analysis.signal ?? 'none'}`, 24, 52);
    }
}
