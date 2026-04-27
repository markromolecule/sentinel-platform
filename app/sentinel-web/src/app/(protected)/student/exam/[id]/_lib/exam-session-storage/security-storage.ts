import { buildExamSessionStorageKey } from './constants';
import type { SecurityLockReason } from './types';

export function readStoredSecurityLock(examId: string): SecurityLockReason | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lock`;
    const value = window.sessionStorage.getItem(key);

    return value as SecurityLockReason | null;
}

export function writeStoredSecurityLock(examId: string, reason: SecurityLockReason) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lock`;
    window.sessionStorage.setItem(key, reason);
}

export function clearStoredSecurityLock(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lock`;
    window.sessionStorage.removeItem(key);
}
