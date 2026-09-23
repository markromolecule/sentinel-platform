#!/usr/bin/env node

/**
 * Sentinel Mobile Pre-Flight Environment Validator
 *
 * Verifies that all required production environment variables are present,
 * properly formatted, and accessible before triggering an EAS build or starting the app.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load .env file into process.env if present and variable is not already defined in environment
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const value = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    }
}

const errors = [];
const warnings = [];

function checkUrl(key, val, required = true) {
    if (!val) {
        if (required) {
            errors.push(`Missing required variable: ${key}`);
        }
        return;
    }
    try {
        const parsed = new URL(val);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            errors.push(`Invalid protocol in ${key}: "${val}". Must be http:// or https://`);
        }
    } catch {
        errors.push(`Malformed URL in ${key}: "${val}"`);
    }
}

function checkKey(key, val, minLen = 20) {
    if (!val) {
        errors.push(`Missing required variable: ${key}`);
        return;
    }
    if (val.length < minLen) {
        errors.push(`${key} appears too short (got ${val.length} chars, expected at least ${minLen})`);
    }
}

// 1. Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
checkUrl('EXPO_PUBLIC_SUPABASE_URL', supabaseUrl, true);
checkKey('EXPO_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey, 20);

// 2. API & Web URLs
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.sentinelph.tech';
const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://app.sentinelph.tech';
checkUrl('EXPO_PUBLIC_API_URL', apiUrl, true);
checkUrl('EXPO_PUBLIC_WEB_URL', webUrl, true);

// 3. Auth settings
const authProxyUrl = process.env.EXPO_PUBLIC_EXPO_AUTH_PROXY_URL;
if (authProxyUrl) {
    checkUrl('EXPO_PUBLIC_EXPO_AUTH_PROXY_URL', authProxyUrl, false);
}

// 4. Production warnings
if (process.env.NODE_ENV === 'production' || process.env.EAS_BUILD_PROFILE === 'production') {
    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') || apiUrl.includes('192.168.')) {
        warnings.push(`Warning: Production build target is using a local/LAN API URL: "${apiUrl}"`);
    }
}

console.log('\n[Sentinel Mobile] Pre-flight Environment Verification:');
console.log(`  Project: ${projectRoot}`);
console.log(`  Supabase URL:    ${supabaseUrl ? '✓ configured' : '✗ missing'}`);
console.log(`  Supabase Key:    ${supabaseAnonKey ? '✓ configured' : '✗ missing'}`);
console.log(`  API Base URL:    ${apiUrl}`);
console.log(`  Web Base URL:    ${webUrl}`);
console.log(`  OAuth Proxy:     ${authProxyUrl || '(default / auth.expo.io)'}`);

if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
}

if (errors.length > 0) {
    console.error('\n❌ Environment Verification FAILED:');
    errors.forEach((err) => console.error(`  - ${err}`));
    console.error('\nPlease update your .env or configure EAS environment variables before building.');
    process.exit(1);
}

console.log('\n✅ All required environment variables are valid and ready for build.\n');
process.exit(0);
