export interface ApiClientOptions extends RequestInit {
    baseUrl?: string;
    getToken?: () => Promise<string | null | undefined>;
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

            try {
                const errorBody = await response.clone().json();
                if (typeof errorBody?.error === 'string' && errorBody.error.length > 0) {
                    message = errorBody.error;
                } else if (typeof errorBody?.message === 'string' && errorBody.message.length > 0) {
                    message = errorBody.message;
                }
            } catch {
                const textBody = await response.text();
                if (textBody) {
                    message = textBody;
                }
            }

            throw new Error(message);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        return response.text();
    };
};
