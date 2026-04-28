import type { ExamRuntimeAccess } from '@sentinel/shared/types';

export type LobbyStateLabel =
    | 'Resume active attempt'
    | 'Waiting for approval'
    | 'Awaiting re-approval'
    | 'Approved to continue'
    | 'Read-only until start'
    | 'Locked by instructor'
    | 'Reopened access'
    | 'Closed'
    | 'Ready for entry'
    | 'Pending checks';

export type LobbyReadinessStatus = 'pending' | 'success' | 'warning' | 'error';
