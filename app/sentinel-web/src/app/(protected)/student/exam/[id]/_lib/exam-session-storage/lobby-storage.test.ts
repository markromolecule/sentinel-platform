/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import {
    writeStoredLobbyEntry,
    readStoredLobbyEntry,
    consumeStoredLobbyEntry,
    clearStoredLobbyEntry,
    writeStoredReconnectIntent,
    readStoredReconnectIntent,
    clearStoredReconnectIntent,
    readStoredLobbyEntryMarker,
    writeStoredLobbyEntryMarker,
    clearStoredLobbyEntryMarker,
} from './lobby-storage';

describe('lobby-storage', () => {
    const examId = 'exam-123';
    const sessionId = 'session-456';

    beforeEach(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.clear();
        }
    });

    it('writes and reads a valid versioned lobby entry', () => {
        const record = writeStoredLobbyEntry(examId, sessionId);
        expect(record).not.toBeNull();
        expect(record?.examId).toBe(examId);
        expect(record?.sessionId).toBe(sessionId);
        expect(record?.consumedAt).toBeNull();

        const read = readStoredLobbyEntry(examId);
        expect(read?.token).toBe(record?.token);
    });

    it('rejects lobby entry for wrong exam or malformed JSON', () => {
        writeStoredLobbyEntry(examId, sessionId);
        expect(readStoredLobbyEntry('other-exam')).toBeNull();

        window.sessionStorage.setItem(`sentinel-web:exam-lobby-entry:${examId}`, 'invalid-json');
        expect(readStoredLobbyEntry(examId)).toBeNull();
    });

    it('atomically consumes lobby entry token only once', () => {
        writeStoredLobbyEntry(examId, sessionId);

        const firstConsume = consumeStoredLobbyEntry(examId);
        expect(firstConsume).not.toBeNull();
        expect(firstConsume?.consumedAt).toBeDefined();

        const secondConsume = consumeStoredLobbyEntry(examId);
        expect(secondConsume).toBeNull();
    });

    it('handles backwards compatibility marker helpers', () => {
        writeStoredLobbyEntryMarker(examId);
        expect(readStoredLobbyEntryMarker(examId)).toBe(true);

        consumeStoredLobbyEntry(examId);
        expect(readStoredLobbyEntryMarker(examId)).toBe(false);

        clearStoredLobbyEntryMarker(examId);
        expect(readStoredLobbyEntryMarker(examId)).toBe(false);
    });

    it('writes, reads, and clears reconnect intent records', () => {
        const intent = writeStoredReconnectIntent(examId, sessionId, 'offline');
        expect(intent?.reason).toBe('offline');
        expect(intent?.resumeRequestId).toMatch(/^[0-9a-f-]{36}$/i);

        const readIntent = readStoredReconnectIntent(examId);
        expect(readIntent?.reason).toBe('offline');

        clearStoredReconnectIntent(examId);
        expect(readStoredReconnectIntent(examId)).toBeNull();
    });

    it('rejects expired or malformed reconnect intents', () => {
        const key = `sentinel-web:exam-reconnect-intent:${examId}`;
        window.sessionStorage.setItem(
            key,
            JSON.stringify({
                version: 1,
                examId,
                sessionId,
                reason: 'reload',
                resumeRequestId: 'not-a-uuid',
                createdAt: new Date().toISOString(),
            }),
        );
        expect(readStoredReconnectIntent(examId)).toBeNull();

        window.sessionStorage.setItem(
            key,
            JSON.stringify({
                version: 1,
                examId,
                sessionId,
                reason: 'reload',
                resumeRequestId: '66666666-6666-4666-8666-666666666666',
                createdAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
            }),
        );
        expect(readStoredReconnectIntent(examId)).toBeNull();
    });
});
