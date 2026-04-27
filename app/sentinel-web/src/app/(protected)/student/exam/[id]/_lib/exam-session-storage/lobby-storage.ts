import { buildExamSessionStorageKey } from './constants';

export function readStoredLobbyEntryMarker(examId: string): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lobby-entry`;
    return window.sessionStorage.getItem(key) === 'true';
}

export function writeStoredLobbyEntryMarker(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lobby-entry`;
    window.sessionStorage.setItem(key, 'true');
}

export function clearStoredLobbyEntryMarker(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lobby-entry`;
    window.sessionStorage.removeItem(key);
}
