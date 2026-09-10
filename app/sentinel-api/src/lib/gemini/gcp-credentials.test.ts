import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
    isVertexAiEnabled,
    resolveServiceAccountCredentials,
    resolveVertexAiConfig,
} from './gcp-credentials';

describe('gcp-credentials', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.GOOGLE_GENAI_USE_VERTEXAI;
        delete process.env.AI_PROVIDER;
        delete process.env.GOOGLE_CLOUD_PROJECT;
        delete process.env.GOOGLE_CLOUD_LOCATION;
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        delete process.env.GCP_SERVICE_ACCOUNT_KEY;
        delete process.env.GCP_SA_KEY_BASE64;
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    describe('isVertexAiEnabled', () => {
        it('returns false when no flags are set', () => {
            expect(isVertexAiEnabled()).toBe(false);
        });

        it('returns true when GOOGLE_GENAI_USE_VERTEXAI is "true"', () => {
            process.env.GOOGLE_GENAI_USE_VERTEXAI = 'true';
            expect(isVertexAiEnabled()).toBe(true);
        });

        it('returns true when GOOGLE_GENAI_USE_VERTEXAI is "1"', () => {
            process.env.GOOGLE_GENAI_USE_VERTEXAI = '1';
            expect(isVertexAiEnabled()).toBe(true);
        });

        it('returns true when AI_PROVIDER is "vertex"', () => {
            process.env.AI_PROVIDER = 'vertex';
            expect(isVertexAiEnabled()).toBe(true);
        });

        it('returns false when GOOGLE_GENAI_USE_VERTEXAI is "false"', () => {
            process.env.GOOGLE_GENAI_USE_VERTEXAI = 'false';
            expect(isVertexAiEnabled()).toBe(false);
        });
    });

    describe('resolveServiceAccountCredentials', () => {
        it('parses raw JSON string from GCP_SERVICE_ACCOUNT_KEY', () => {
            process.env.GCP_SERVICE_ACCOUNT_KEY = JSON.stringify({
                project_id: 'test-project',
                client_email: 'test@example.com',
            });

            const result = resolveServiceAccountCredentials();
            expect(result.credentials?.project_id).toBe('test-project');
            expect(result.credentials?.client_email).toBe('test@example.com');
        });

        it('throws descriptive error if GCP_SERVICE_ACCOUNT_KEY is invalid JSON', () => {
            process.env.GCP_SERVICE_ACCOUNT_KEY = 'invalid-json';
            expect(() => resolveServiceAccountCredentials()).toThrowError(
                /Failed to parse GCP_SERVICE_ACCOUNT_KEY JSON string/,
            );
        });

        it('parses base64-encoded JSON from GCP_SA_KEY_BASE64', () => {
            const raw = JSON.stringify({
                project_id: 'base64-project',
                client_email: 'base64@example.com',
            });
            process.env.GCP_SA_KEY_BASE64 = Buffer.from(raw).toString('base64');

            const result = resolveServiceAccountCredentials();
            expect(result.credentials?.project_id).toBe('base64-project');
            expect(result.credentials?.client_email).toBe('base64@example.com');
        });

        it('reads credentials from file path in GOOGLE_APPLICATION_CREDENTIALS', () => {
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gcp-cred-test-'));
            const keyPath = path.join(tempDir, 'test-key.json');
            fs.writeFileSync(
                keyPath,
                JSON.stringify({
                    project_id: 'file-project',
                    client_email: 'file@example.com',
                }),
                'utf-8',
            );

            try {
                process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
                const result = resolveServiceAccountCredentials();
                expect(result.credentials?.project_id).toBe('file-project');
                expect(result.keyFilePath).toBe(keyPath);
            } finally {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        it('throws if GOOGLE_APPLICATION_CREDENTIALS file does not exist', () => {
            process.env.GOOGLE_APPLICATION_CREDENTIALS = './definitely-nonexistent-key-12345.json';

            expect(() => resolveServiceAccountCredentials()).toThrowError(
                /GOOGLE_APPLICATION_CREDENTIALS file does not exist/,
            );
        });
    });

    describe('resolveVertexAiConfig', () => {
        it('resolves project, location, and credentials correctly', () => {
            process.env.GOOGLE_CLOUD_PROJECT = 'my-gcp-project';
            process.env.GOOGLE_CLOUD_LOCATION = 'asia-southeast1';
            process.env.GCP_SERVICE_ACCOUNT_KEY = JSON.stringify({
                project_id: 'my-gcp-project',
                client_email: 'sa@my-gcp-project.iam.gserviceaccount.com',
            });

            const config = resolveVertexAiConfig();
            expect(config.vertexai).toBe(true);
            expect(config.project).toBe('my-gcp-project');
            expect(config.location).toBe('asia-southeast1');
            expect(config.googleAuthOptions?.credentials?.client_email).toBe(
                'sa@my-gcp-project.iam.gserviceaccount.com',
            );
        });

        it('defaults location to us-central1 if unspecified', () => {
            process.env.GOOGLE_CLOUD_PROJECT = 'my-gcp-project';
            const config = resolveVertexAiConfig();
            expect(config.location).toBe('us-central1');
        });

        it('falls back to credentials.project_id if GOOGLE_CLOUD_PROJECT is not set', () => {
            process.env.GCP_SERVICE_ACCOUNT_KEY = JSON.stringify({
                project_id: 'project-from-sa',
            });
            const config = resolveVertexAiConfig();
            expect(config.project).toBe('project-from-sa');
        });

        it('throws if no project ID can be resolved', () => {
            expect(() => resolveVertexAiConfig()).toThrowError(/Missing Google Cloud project ID/);
        });
    });
});
