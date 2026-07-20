import type {
    ApiClientType,
    LiveInspectionLeasePayload,
    PublisherConnectionPayload,
} from '@sentinel/services';
import {
    createLiveInspectionPublisherConnection,
    createLiveInspectionViewerConnection,
} from '@sentinel/services';

/**
 * Imperatively creates viewer credentials; do not wrap in a query cache.
 */
export function createViewerLiveInspectionCredentials(
    apiClient: ApiClientType,
    payload: LiveInspectionLeasePayload,
) {
    return createLiveInspectionViewerConnection(apiClient, payload);
}

/**
 * Imperatively creates publisher credentials; do not wrap in a query cache.
 */
export function createPublisherLiveInspectionCredentials(
    apiClient: ApiClientType,
    payload: PublisherConnectionPayload,
) {
    return createLiveInspectionPublisherConnection(apiClient, payload);
}
