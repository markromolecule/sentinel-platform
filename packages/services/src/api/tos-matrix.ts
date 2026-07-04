import type { ApiClientType } from '../api-client';

export type BloomLevel =
    'REMEMBERING' | 'UNDERSTANDING' | 'APPLYING' | 'ANALYZING' | 'EVALUATING' | 'CREATING';

export interface TosMatrixRow {
    topic: string;
    counts: Record<BloomLevel, number>;
    total: number;
}

export interface TosMatrixData {
    rows: TosMatrixRow[];
    columnTotals: Record<BloomLevel, number>;
    grandTotal: number;
    activeCount: number;
    retiredCount: number;
}

export interface GetTosMatrixParams {
    institutionId?: string;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

export async function getTosMatrix(
    apiClient: ApiClientType,
    params?: GetTosMatrixParams,
): Promise<TosMatrixData> {
    const searchParams = new URLSearchParams();

    if (params?.institutionId) {
        searchParams.set('institutionId', params.institutionId);
    }

    const qs = searchParams.toString();
    const response: ApiResponse<TosMatrixData> = await apiClient(
        `/question-bank/tos-matrix${qs ? `?${qs}` : ''}`,
    );

    return response.data;
}
