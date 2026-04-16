export interface ApiClientOptions extends RequestInit {
    baseUrl?: string;
    getToken?: () => Promise<string | null | undefined>;
}

export class ApiError extends Error {
    status: number;
    statusText: string;
    body?: unknown;

    constructor({
        message,
        status,
        statusText,
        body,
    }: {
        message: string;
        status: number;
        statusText: string;
        body?: unknown;
    }) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
        this.body = body;
    }
}

export const createApiClient = (defaultOptions: ApiClientOptions = {}) => {
    const {
        baseUrl: defaultBaseUrl,
        getToken: defaultGetToken,
        ...defaultRequestOptions
    } = defaultOptions;

    return async (endpoint: string, options: ApiClientOptions = {}) => {
        const { baseUrl, getToken, ...requestOptions } = options;

        const finalBaseUrl = baseUrl || defaultBaseUrl || '';
        const finalGetToken = getToken || defaultGetToken;

        const headers = new Headers(requestOptions.headers || defaultRequestOptions.headers);

        if (finalGetToken) {
            const token = await finalGetToken();
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }

        const response = await fetch(`${finalBaseUrl}${endpoint}`, {
            ...defaultRequestOptions,
            ...requestOptions,
            headers,
        });

        if (!response.ok) {
            let message = `API Error: ${response.status} ${response.statusText}`;
            let errorBody: unknown;

            try {
                errorBody = await response.clone().json();
                const parsedErrorBody = errorBody as { error?: unknown; message?: unknown };

                if (typeof parsedErrorBody.error === 'string' && parsedErrorBody.error.length > 0) {
                    message = parsedErrorBody.error;
                } else if (
                    typeof parsedErrorBody.message === 'string' &&
                    parsedErrorBody.message.length > 0
                ) {
                    message = parsedErrorBody.message;
                }
            } catch {
                const textBody = await response.text();
                if (textBody) {
                    message = textBody;
                }
            }

            throw new ApiError({
                message,
                status: response.status,
                statusText: response.statusText,
                body: errorBody,
            });
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        return response.text();
    };
};
export type ApiClientType = ReturnType<typeof createApiClient>;
