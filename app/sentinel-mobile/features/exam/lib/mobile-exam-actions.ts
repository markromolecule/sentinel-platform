import type { MobileExamDisplay } from './mobile-exam-adapter';

export type MobileExamAction = 'open' | 'view' | 'upcoming';

const READ_ONLY_EXAM_STATUSES = new Set<MobileExamDisplay['status']>([
    'completed',
    'turned_in',
    'past_due',
]);

export function isReadOnlyMobileExamStatus(status: MobileExamDisplay['status']) {
    return READ_ONLY_EXAM_STATUSES.has(status);
}

export function getMobileExamAction(status: MobileExamDisplay['status']): MobileExamAction {
    if (isReadOnlyMobileExamStatus(status)) {
        return 'view';
    }

    if (status === 'upcoming') {
        return 'upcoming';
    }

    return 'open';
}

export function getMobileExamActionLabel(status: MobileExamDisplay['status']) {
    switch (getMobileExamAction(status)) {
        case 'view':
            return 'View';
        case 'upcoming':
            return 'Upcoming';
        case 'open':
        default:
            return 'Open Exam';
    }
}

export function getMobileExamRoute(exam: Pick<MobileExamDisplay, 'id' | 'status'>) {
    return getMobileExamAction(exam.status) === 'view'
        ? (`/exam/${exam.id}` as const)
        : (`/exam/${exam.id}/instruction` as const);
}
