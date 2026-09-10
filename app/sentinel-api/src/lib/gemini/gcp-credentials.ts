import * as fs from 'node:fs';
import * as path from 'node:path';

export interface GcpServiceAccountKey {
    type?: string;
    project_id?: string;
    private_key_id?: string;
    private_key?: string;
    client_email?: string;
    client_id?: string;
    auth_uri?: string;
    token_uri?: string;
    auth_provider_x509_cert_url?: string;
    client_x509_cert_url?: string;
}

export interface VertexAiResolvedConfig {
    vertexai: true;
    project: string;
    location: string;
    googleAuthOptions?: {
        credentials?: GcpServiceAccountKey;
        keyFile?: string;
    };
}

/**
 * Checks whether Vertex AI mode is explicitly activated via environment flags.
 */
export function isVertexAiEnabled(): boolean {
    const flag = process.env.GOOGLE_GENAI_USE_VERTEXAI?.trim().toLowerCase();
    const provider = process.env.AI_PROVIDER?.trim().toLowerCase();
    return flag === 'true' || flag === '1' || provider === 'vertex' || provider === 'vertexai';
}

/**
 * Parses and returns a GCP Service Account key from environment variables or a file.
 * Supports:
 * 1. Raw JSON string in `GCP_SERVICE_ACCOUNT_KEY`
 * 2. Base64-encoded JSON string in `GCP_SA_KEY_BASE64`
 * 3. File path in `GOOGLE_APPLICATION_CREDENTIALS` (e.g. `./gcp-key.json`)
 */
export function resolveServiceAccountCredentials(): {
    credentials?: GcpServiceAccountKey;
    keyFilePath?: string;
} {
    // 1. Check raw JSON string in environment variable
    const rawJson = process.env.GCP_SERVICE_ACCOUNT_KEY?.trim();
    if (rawJson) {
        try {
            const parsed = JSON.parse(rawJson) as GcpServiceAccountKey;
            return { credentials: parsed };
        } catch (error) {
            throw new Error(
                `Failed to parse GCP_SERVICE_ACCOUNT_KEY JSON string: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    // 2. Check base64-encoded JSON string in environment variable
    const base64Key = process.env.GCP_SA_KEY_BASE64?.trim();
    if (base64Key) {
        try {
            const decoded = Buffer.from(base64Key, 'base64').toString('utf-8');
            const parsed = JSON.parse(decoded) as GcpServiceAccountKey;
            return { credentials: parsed };
        } catch (error) {
            throw new Error(
                `Failed to decode and parse GCP_SA_KEY_BASE64 string: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    // 3. Check physical file path in GOOGLE_APPLICATION_CREDENTIALS
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
    if (credPath) {
        let candidatePath = path.isAbsolute(credPath)
            ? credPath
            : path.resolve(process.cwd(), credPath);

        if (!fs.existsSync(candidatePath) && !path.isAbsolute(credPath)) {
            const sentinelApiPath = path.resolve(process.cwd(), 'app/sentinel-api', credPath);
            if (fs.existsSync(sentinelApiPath)) {
                candidatePath = sentinelApiPath;
            }
        }

        if (!fs.existsSync(candidatePath)) {
            throw new Error(
                `GOOGLE_APPLICATION_CREDENTIALS file does not exist at resolved path: ${candidatePath}`,
            );
        }

        const resolvedPath = candidatePath;

        try {
            const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
            const parsed = JSON.parse(fileContent) as GcpServiceAccountKey;
            return { credentials: parsed, keyFilePath: resolvedPath };
        } catch (error) {
            throw new Error(
                `Failed to read or parse service account file at ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    return {};
}

/**
 * Resolves the configuration options required to initialize GoogleGenAI with Vertex AI.
 */
export function resolveVertexAiConfig(): VertexAiResolvedConfig {
    const { credentials, keyFilePath } = resolveServiceAccountCredentials();

    const project =
        process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
        process.env.GCP_PROJECT_ID?.trim() ||
        credentials?.project_id?.trim();

    if (!project) {
        throw new Error(
            'Missing Google Cloud project ID. Please set GOOGLE_CLOUD_PROJECT or ensure your service account key contains a project_id.',
        );
    }

    const location =
        process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
        process.env.GCP_LOCATION?.trim() ||
        'us-central1';

    const googleAuthOptions = credentials
        ? { credentials }
        : keyFilePath
            ? { keyFile: keyFilePath }
            : undefined;

    return {
        vertexai: true,
        project,
        location,
        ...(googleAuthOptions ? { googleAuthOptions } : {}),
    };
}
