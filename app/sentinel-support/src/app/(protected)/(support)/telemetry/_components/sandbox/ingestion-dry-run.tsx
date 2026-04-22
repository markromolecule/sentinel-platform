import { Button, Input } from '@sentinel/ui';
import { LabeledField } from '../shared/labeled-field';
import { useIngestionDryRun } from '../../_hooks/use-ingestion-dry-run';
import { IngestTelemetryEventPayload } from '@sentinel/services';


export type IngestionDryRunProps = {
    currentPreviewPayload: Omit<IngestTelemetryEventPayload, 'examSessionId' | 'studentId' | 'timestamp'>;
    isPending?: boolean;
};

export function IngestionDryRun({ currentPreviewPayload, isPending }: IngestionDryRunProps) {
    const {
        dispatchSessionId,
        setDispatchSessionId,
        dispatchStudentId,
        setDispatchStudentId,
        dispatchStatus,
        dispatchError,
        isDispatching,
        handleDispatchPreview,
    } = useIngestionDryRun(currentPreviewPayload);

    return (
        <div className="bg-muted/20 rounded-2xl border p-4">
            <div className="space-y-1">
                <p className="text-sm font-semibold">Optional ingestion dry run</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                    After validating the local preview, support can forward this exact payload
                    through `POST /telemetry/events` for dev or staged verification. The API still
                    enforces active-attempt ownership, so the signed-in user must match the supplied
                    student target.
                </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <LabeledField
                    label="Target exam session ID"
                    description="Use a real active attempt session for a dry-run dispatch."
                >
                    <Input
                        value={dispatchSessionId}
                        onChange={(event) => setDispatchSessionId(event.currentTarget.value)}
                        placeholder="00000000-0000-4000-8000-000000000000"
                        disabled={isPending || isDispatching}
                    />
                </LabeledField>

                <LabeledField
                    label="Target student user ID"
                    description="Must match the authenticated user accepted by the ingestion API."
                >
                    <Input
                        value={dispatchStudentId}
                        onChange={(event) => setDispatchStudentId(event.currentTarget.value)}
                        placeholder="00000000-0000-4000-8000-000000000000"
                        disabled={isPending || isDispatching}
                    />
                </LabeledField>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleDispatchPreview}
                    disabled={isPending || isDispatching}
                >
                    {isDispatching ? 'Dispatching preview...' : 'Dispatch preview payload'}
                </Button>
                <p className="text-muted-foreground text-xs">
                    Preview event: {currentPreviewPayload.eventType}
                </p>
            </div>

            {dispatchStatus ? (
                <p className="mt-3 text-xs text-emerald-700">{dispatchStatus}</p>
            ) : null}
            {dispatchError ? (
                <p className="text-destructive mt-3 text-xs">{dispatchError}</p>
            ) : null}
        </div>
    );
}
