import { isMediaPipeRuntimeEnabled } from '@sentinel/shared';
import { ingestTelemetryEvent, type ApiClientType } from '@sentinel/services';
import type { EmitWebTelemetryEventArgs, EmitMediaPipeTelemetryEventArgs } from './_types';
import {
    isWebTelemetryEventEnabled,
    buildWebTelemetryPayload,
    isMediaPipeTelemetryEventEnabled,
    buildAttemptMediaPipeTelemetryPayload,
} from './_utils/payloads';

export * from './_types';
export * from './_utils/payloads';
export * from './_utils/context';
export * from './_utils/action-metadata';

export async function emitWebTelemetryEvent(
    apiClient: ApiClientType,
    { configuration, ...payloadArgs }: EmitWebTelemetryEventArgs,
) {
    if (!isWebTelemetryEventEnabled(configuration, payloadArgs.eventType)) {
        return false;
    }

    await ingestTelemetryEvent(apiClient, buildWebTelemetryPayload(payloadArgs));
    return true;
}

export async function emitMediaPipeTelemetryEvent(
    apiClient: ApiClientType,
    { configuration, mediaPipeSandbox, ...payloadArgs }: EmitMediaPipeTelemetryEventArgs,
) {
    const runtimeEnabled = isMediaPipeRuntimeEnabled({
        sandbox: mediaPipeSandbox,
        configuration,
        stage: 'attempt',
    });
    const eventEnabled = isMediaPipeTelemetryEventEnabled(configuration, payloadArgs.eventType);

    if (!runtimeEnabled || !eventEnabled) {
        console.warn('[MediaPipeTelemetry] Event not emitted', {
            eventType: payloadArgs.eventType,
            examSessionId: payloadArgs.examSessionId,
            runtimeEnabled,
            eventEnabled,
        });
        return false;
    }

    await ingestTelemetryEvent(apiClient, buildAttemptMediaPipeTelemetryPayload(payloadArgs));
    return true;
}
