import { buildExamLobbyEntryStorageKey, buildExamReconnectIntentStorageKey } from './constants';
import type { ReconnectReason, StoredLobbyEntryRecord, StoredReconnectIntentRecord } from './types';

const LOBBY_ENTRY_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const RECONNECT_INTENT_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Writes a fresh, unconsumed versioned lobby entry token.
 */
export function writeStoredLobbyEntry(
    examId: string,
    sessionId?: string,
): StoredLobbyEntryRecord | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const record: StoredLobbyEntryRecord = {
        version: 1,
        examId,
        sessionId,
        token: `token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
        consumedAt: null,
    };

    const key = buildExamLobbyEntryStorageKey(examId);
    window.sessionStorage.setItem(key, JSON.stringify(record));
    return record;
}

/**
 * Reads the stored lobby entry record, validating structure, exam matching, and expiry.
 */
export function readStoredLobbyEntry(examId: string): StoredLobbyEntryRecord | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const key = buildExamLobbyEntryStorageKey(examId);
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
        return null;
    }

    try {
        const record = JSON.parse(raw) as Partial<StoredLobbyEntryRecord>;
        if (
            record.version !== 1 ||
            record.examId !== examId ||
            typeof record.token !== 'string' ||
            typeof record.createdAt !== 'string'
        ) {
            window.sessionStorage.removeItem(key);
            return null;
        }

        const createdAtTime = new Date(record.createdAt).getTime();
        if (Number.isNaN(createdAtTime) || Date.now() - createdAtTime > LOBBY_ENTRY_EXPIRY_MS) {
            window.sessionStorage.removeItem(key);
            return null;
        }

        return record as StoredLobbyEntryRecord;
    } catch {
        window.sessionStorage.removeItem(key);
        return null;
    }
}

/**
 * Atomically marks a valid lobby entry token as consumed in sessionStorage and returns it.
 * Rejects already consumed, expired, or wrong-exam entries.
 */
export function consumeStoredLobbyEntry(examId: string): StoredLobbyEntryRecord | null {
    const record = readStoredLobbyEntry(examId);
    if (!record || record.consumedAt) {
        return null;
    }

    const consumedRecord: StoredLobbyEntryRecord = {
        ...record,
        consumedAt: new Date().toISOString(),
    };

    const key = buildExamLobbyEntryStorageKey(examId);
    window.sessionStorage.setItem(key, JSON.stringify(consumedRecord));
    return consumedRecord;
}

/**
 * Removes the stored lobby entry record for an exam.
 */
export function clearStoredLobbyEntry(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = buildExamLobbyEntryStorageKey(examId);
    window.sessionStorage.removeItem(key);
}

/**
 * Writes an unconfirmed reconnect intent record when interruption signals trigger.
 */
export function writeStoredReconnectIntent(
    examId: string,
    sessionId?: string,
    reason: ReconnectReason = 'reload',
): StoredReconnectIntentRecord | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const existing = readStoredReconnectIntent(examId);
    const resumeRequestId = existing?.resumeRequestId || crypto.randomUUID();

    const record: StoredReconnectIntentRecord = {
        version: 1,
        examId,
        sessionId,
        reason,
        resumeRequestId,
        createdAt: new Date().toISOString(),
    };

    const key = buildExamReconnectIntentStorageKey(examId);
    window.sessionStorage.setItem(key, JSON.stringify(record));
    return record;
}

/**
 * Reads the stored reconnect intent record if valid and unexpired.
 */
export function readStoredReconnectIntent(examId: string): StoredReconnectIntentRecord | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const key = buildExamReconnectIntentStorageKey(examId);
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
        return null;
    }

    try {
        const record = JSON.parse(raw) as Partial<StoredReconnectIntentRecord>;
        if (
            record.version !== 1 ||
            record.examId !== examId ||
            typeof record.createdAt !== 'string' ||
            typeof record.resumeRequestId !== 'string' ||
            !isUuid(record.resumeRequestId)
        ) {
            window.sessionStorage.removeItem(key);
            return null;
        }

        const createdAtTime = new Date(record.createdAt).getTime();
        if (
            Number.isNaN(createdAtTime) ||
            Date.now() - createdAtTime > RECONNECT_INTENT_EXPIRY_MS
        ) {
            window.sessionStorage.removeItem(key);
            return null;
        }

        return record as StoredReconnectIntentRecord;
    } catch {
        window.sessionStorage.removeItem(key);
        return null;
    }
}

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Clears the stored reconnect intent record for an exam.
 */
export function clearStoredReconnectIntent(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = buildExamReconnectIntentStorageKey(examId);
    window.sessionStorage.removeItem(key);
}

// Backwards compatibility wrappers
export function readStoredLobbyEntryMarker(examId: string): boolean {
    const record = readStoredLobbyEntry(examId);
    return Boolean(record && !record.consumedAt);
}

export function writeStoredLobbyEntryMarker(examId: string) {
    writeStoredLobbyEntry(examId);
}

export function clearStoredLobbyEntryMarker(examId: string) {
    clearStoredLobbyEntry(examId);
}
