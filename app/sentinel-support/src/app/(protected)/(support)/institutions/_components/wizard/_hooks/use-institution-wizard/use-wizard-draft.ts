import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { WizardDraft } from '../../_types';
import { DRAFT_KEY } from '../../_constants';
import { createEmptyDraft } from '../../_utils';

export function useWizardDraft() {
    const [draft, setDraft] = useState<WizardDraft>(() => {
        const empty = createEmptyDraft();
        if (typeof window === 'undefined') return empty;

        const savedDraft = window.localStorage.getItem(DRAFT_KEY);
        if (!savedDraft) return empty;

        try {
            const parsed = JSON.parse(savedDraft);
            const naming = { ...empty.naming };

            if (parsed.naming) {
                // Migrate old room naming fields
                if (parsed.naming.roomLabel) naming.room.label = parsed.naming.roomLabel;
                if (parsed.naming.roomPrefix) naming.room.prefix = parsed.naming.roomPrefix;
                if (parsed.naming.roomVirtualPrefix)
                    naming.room.virtualPrefix = parsed.naming.roomVirtualPrefix;

                // sectionRulesByCourseClientId migration is skipped as it's a new structure
            }

            return {
                identity: { ...empty.identity, ...(parsed.identity ?? {}) },
                departments: parsed.departments ?? empty.departments,
                courses: parsed.courses ?? empty.courses,
                terms: parsed.terms ?? empty.terms,
                subjects: parsed.subjects ?? empty.subjects,
                naming,
            };
        } catch {
            return empty;
        }
    });

    const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(DRAFT_KEY) ? 'restored from browser draft' : null;
    });

    const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false);

    // Beforeunload guard
    useEffect(() => {
        if (!hasUnsavedProgress) return;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedProgress]);

    const updateDraft = useCallback((updater: (current: WizardDraft) => WizardDraft) => {
        setDraft((current) => updater(current));
        setHasUnsavedProgress(true);
    }, []);

    const saveDraft = useCallback(
        (nextDraft = draft) => {
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft));
            setLastSavedAt(new Date().toLocaleTimeString());
            setHasUnsavedProgress(false);
            toast.success('Draft saved');
        },
        [draft],
    );

    return {
        draft,
        setDraft,
        updateDraft,
        saveDraft,
        lastSavedAt,
        setLastSavedAt,
        hasUnsavedProgress,
        setHasUnsavedProgress,
    };
}
