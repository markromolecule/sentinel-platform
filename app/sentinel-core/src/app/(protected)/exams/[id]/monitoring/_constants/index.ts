import { RuntimeAccessAction, RuntimeAccessConfig } from '../_types';

export const MONITORING_PAGE_SIZE = 8;

export const RUNTIME_ACTION_CONFIGS: Record<RuntimeAccessAction, RuntimeAccessConfig> = {
    lock: {
        title: 'Lock exam access',
        description:
            'Block new students from joining while keeping already-active attempts resumable.',
        confirmLabel: 'Lock exam',
        confirmVariant: 'default',
    },
    reset: {
        title: 'Reset runtime access',
        description:
            'Clear the current runtime override and return the exam to its normal schedule rules.',
        confirmLabel: 'Reset access',
        confirmVariant: 'default',
    },
    close: {
        title: 'Close exam now',
        description: 'Immediately block both new joins and resume attempts for this exam session.',
        confirmLabel: 'Close exam',
        confirmVariant: 'destructive',
    },
};
