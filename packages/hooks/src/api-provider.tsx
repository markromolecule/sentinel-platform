'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ApiClientType } from '@sentinel/services';

const ApiContext = createContext<ApiClientType | undefined>(undefined);

export interface ApiProviderProps {
    apiClient: ApiClientType;
    children: ReactNode;
}

export function ApiProvider({ apiClient, children }: ApiProviderProps) {
    return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClientType {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}
