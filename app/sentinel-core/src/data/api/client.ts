import { createSupabaseClient } from '@/data/supabase/client';

// base url for the api
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// api client to make requests to the api
export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
    const supabase = createSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    // create a new headers object
    const headers = new Headers(options.headers);

    // add the authorization header if the session is available
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    // make the request to the api
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // handle errors
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

    // handle plain text response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
};
