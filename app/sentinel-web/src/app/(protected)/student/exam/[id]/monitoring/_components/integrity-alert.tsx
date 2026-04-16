'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@sentinel/ui';
import { IntegrityAlertProps } from '@sentinel/shared/types';

export function IntegrityAlert({ tabSwitches }: IntegrityAlertProps) {
    if (tabSwitches === 0) return null;

    return (
        <Alert
            variant="destructive"
            className="mx-auto mb-6 w-full max-w-4xl border-red-500/20 bg-red-500/5 px-4 py-2"
        >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold tracking-widest uppercase">
                Integrity Alert
            </AlertTitle>
            <AlertDescription className="text-xs opacity-90">
                Navigation violations ({tabSwitches}) detected. Activity has been flagged and
                reported.
            </AlertDescription>
        </Alert>
    );
}
