export type RuntimeAccessAction = 'lock' | 'reset' | 'close';

export type RuntimeAccessState = 'open' | 'locked' | 'reopened' | 'closed';

export type RuntimeAccessConfig = {
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: 'default' | 'destructive';
};
