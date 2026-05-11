'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useTelemetrySettingsQuery } from '@sentinel/hooks';
import type { TelemetrySettings } from '@sentinel/shared';
import { cloneSettings, createTelemetrySettingsDraft } from '../_components/shared/telemetry-utils';

type TelemetryDraftContextType = {
    draft: TelemetrySettings | null;
    syncedDraft: TelemetrySettings;
    currentDraft: TelemetrySettings;
    isDirty: boolean;
    setDraft: (draft: TelemetrySettings | null) => void;
    updateDraft: (updater: (settings: TelemetrySettings) => TelemetrySettings) => void;
};

const TelemetryDraftContext = createContext<TelemetryDraftContextType | undefined>(undefined);

export function TelemetryDraftProvider({ children }: { children: ReactNode }) {
    const { data: record } = useTelemetrySettingsQuery();
    const [draft, setDraft] = useState<TelemetrySettings | null>(null);

    const syncedDraft = useMemo(() => createTelemetrySettingsDraft(record), [record]);
    const currentDraft = draft ?? syncedDraft;

    const isDirty = useMemo(() => {
        return (
            JSON.stringify(cloneSettings(currentDraft)) !==
            JSON.stringify(cloneSettings(syncedDraft))
        );
    }, [currentDraft, syncedDraft]);

    const updateDraft = useCallback(
        (updater: (settings: TelemetrySettings) => TelemetrySettings) =>
            setDraft((current) => updater(cloneSettings(current ?? syncedDraft))),
        [syncedDraft],
    );

    const value = useMemo(
        () => ({
            draft,
            syncedDraft,
            currentDraft,
            isDirty,
            setDraft,
            updateDraft,
        }),
        [draft, syncedDraft, currentDraft, isDirty, updateDraft],
    );

    return (
        <TelemetryDraftContext.Provider value={value}>{children}</TelemetryDraftContext.Provider>
    );
}

export function useTelemetryDraft() {
    const context = useContext(TelemetryDraftContext);
    if (context === undefined) {
        throw new Error('useTelemetryDraft must be used within a TelemetryDraftProvider');
    }
    return context;
}
