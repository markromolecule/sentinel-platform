import { useUpdateExamIncidentsMutation } from '@sentinel/hooks';
import { toast } from 'sonner';

/**
 * Hook to manage incident review actions (confirming, dismissing, single or bulk).
 */
export function useIncidentActions(args: {
    examId: string;
    setSelectedIds: (ids: string[]) => void;
    setDrawerOpen: (open: boolean) => void;
    setSelectedIncident: (incident: any) => void;
    displayIncidents: any[];
    groupMode: 'logs' | 'student';
    selectedIds: string[];
}) {
    const {
        examId,
        setSelectedIds,
        setDrawerOpen,
        setSelectedIncident,
        displayIncidents,
        groupMode,
        selectedIds,
    } = args;

    const { mutateAsync: reviewIncidents, isPending: isReviewing } =
        useUpdateExamIncidentsMutation(examId);

    const handleConfirmIncident = async (incidentIds: string[], notes: string) => {
        try {
            await reviewIncidents({
                incidentIds,
                status: 'CONFIRMED',
                reviewNotes: notes,
            });
            toast.success('Incident confirmed successfully');
            setDrawerOpen(false);
            setSelectedIncident(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to confirm incident');
        }
    };

    const handleDismissIncident = async (incidentIds: string[], notes: string) => {
        try {
            await reviewIncidents({
                incidentIds,
                status: 'DISMISSED',
                reviewNotes: notes,
            });
            toast.success('Incident dismissed successfully');
            setDrawerOpen(false);
            setSelectedIncident(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to dismiss incident');
        }
    };

    const getBulkTargetIds = () => {
        if (selectedIds.length === 0) return [];
        if (groupMode !== 'student') return selectedIds;

        const targetIds: string[] = [];
        selectedIds.forEach((baselineId) => {
            const groupedItem = displayIncidents.find((item) => item.incidentId === baselineId);
            const groupedIncidents = groupedItem?.details?._incidents as
                Array<{ incidentId: string }> | undefined;
            if (groupedIncidents) {
                groupedIncidents.forEach((incident) => {
                    targetIds.push(incident.incidentId);
                });
            } else {
                targetIds.push(baselineId);
            }
        });
        return targetIds;
    };

    const handleConfirmBulk = async () => {
        const targetIds = getBulkTargetIds();
        if (targetIds.length === 0) return;

        try {
            await reviewIncidents({
                incidentIds: targetIds,
                status: 'CONFIRMED',
                reviewNotes: 'Bulk confirmed by instructor',
            });
            toast.success(`Successfully confirmed ${targetIds.length} incidents`);
            setSelectedIds([]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to confirm incidents');
        }
    };

    const handleDismissBulk = async () => {
        const targetIds = getBulkTargetIds();
        if (targetIds.length === 0) return;

        try {
            await reviewIncidents({
                incidentIds: targetIds,
                status: 'DISMISSED',
                reviewNotes: 'Bulk dismissed by instructor',
            });
            toast.success(`Successfully dismissed ${targetIds.length} incidents`);
            setSelectedIds([]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to dismiss incidents');
        }
    };

    return {
        isReviewing,
        handleConfirmIncident,
        handleDismissIncident,
        handleConfirmBulk,
        handleDismissBulk,
    };
}
