import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import type { MediaPipeAttemptIncident } from '../../_hooks/use-attempt-mediapipe-monitoring';
import { getMediaPipeIncidentDialogContent } from '../_utils/incident-utils';

export type MediaPipeIncidentDialogProps = {
    incident: MediaPipeAttemptIncident | null;
    onDismiss: () => void;
};

export function MediaPipeIncidentDialog({ incident, onDismiss }: MediaPipeIncidentDialogProps) {
    const dialogContent = incident ? getMediaPipeIncidentDialogContent(incident) : null;

    return (
        <AlertDialog
            open={Boolean(dialogContent)}
            onOpenChange={(open) => {
                if (!open) {
                    onDismiss();
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialogContent?.title}</AlertDialogTitle>
                    <AlertDialogDescription>{dialogContent?.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onDismiss}>
                        {dialogContent?.actionLabel ?? 'Continue exam'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
