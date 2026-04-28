import type { MediaPipeAttemptIncident } from '../../_hooks/use-attempt-mediapipe-monitoring';
import type { MediaPipeIncidentDialogContent } from '../_types';

export function getMediaPipeIncidentDialogContent(
    incident: MediaPipeAttemptIncident,
): MediaPipeIncidentDialogContent {
    if (incident.eventType === 'NO_FACE_DETECTED') {
        return {
            title: 'Face not detected',
            description:
                'Your face is no longer visible to the exam camera. Return to the camera frame and keep your face centered to continue.',
            actionLabel: 'I am back in frame',
        };
    }

    if (incident.eventType === 'MULTIPLE_FACES') {
        return {
            title: 'Multiple faces detected',
            description:
                'The camera detected more than one person in view. Make sure only you are visible before continuing the exam.',
            actionLabel: 'Only I am visible',
        };
    }

    return {
        title: 'Eyes off screen detected',
        description:
            'MediaPipe detected that your face or gaze moved away from the centered exam posture. Keep your face visible and your eyes oriented toward the screen.',
        actionLabel: 'Continue exam',
    };
}
