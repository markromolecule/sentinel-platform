import { Badge, CardDescription, CardHeader, CardTitle, Textarea } from '@sentinel/ui';
import { LabeledField } from '../shared/labeled-field';
import { formatDuration, formatJson } from './_utils';
import type { TelemetryEventIngestionRequest } from '@sentinel/shared';

export type TelemetryPreviewProps = {
    previewCatalog: TelemetryEventIngestionRequest[];
    currentPreviewPayload: TelemetryEventIngestionRequest;
};

export function TelemetryPreview({ previewCatalog, currentPreviewPayload }: TelemetryPreviewProps) {
    return (
        <div className="space-y-4">
            <CardHeader className="p-0 pb-2">
                <CardTitle className="text-base">Telemetry Preview</CardTitle>
                <CardDescription>
                    Local payload shaping mirrors the shared telemetry contract that later student
                    runtime emission will use.
                </CardDescription>
            </CardHeader>
            <div className="grid gap-3">
                {previewCatalog.map((payload) => (
                    <div
                        key={payload.eventType}
                        className="bg-muted/20 rounded-2xl border p-4 text-sm"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold">{payload.eventType}</p>
                                <p className="text-muted-foreground text-xs">
                                    {payload.platform} • {payload.source} • {payload.ruleKey}
                                </p>
                            </div>
                            <Badge variant="outline">
                                {formatDuration(payload.metadata?.durationMs)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-3 text-xs">
                            Confidence floor{' '}
                            {payload.metadata?.confidenceScore?.toFixed(2) ?? 'n/a'}
                        </p>
                    </div>
                ))}
            </div>

            <LabeledField
                label="Latest emitted preview payload"
                description="This mirrors the exact object shape that the shared telemetry client will send once student emission is enabled."
            >
                <Textarea
                    readOnly
                    value={formatJson(currentPreviewPayload)}
                    className="min-h-[280px] font-mono text-[11px]"
                />
            </LabeledField>
        </div>
    );
}
