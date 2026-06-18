import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface UploadedPassageImage {
    bucket: string;
    path: string;
    url: string;
}

/**
 * Uploads a passage image through the API and returns the public storage metadata.
 */
export async function uploadPassageImage(
    apiClient: ApiClientType,
    file: File,
): Promise<UploadedPassageImage> {
    const formData = new FormData();
    formData.append('file', file);

    const response: ApiResponse<UploadedPassageImage> = await apiClient(
        '/media/passage-images/upload',
        {
            method: 'POST',
            body: formData,
        },
    );

    return response.data;
}
