import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readmePath = path.resolve(__dirname, 'README.md');

test('validates existence and content of Sentinel Mobile APK build runbook', () => {
    assert.ok(fs.existsSync(readmePath), 'app/sentinel-mobile/README.md must exist');

    const content = fs.readFileSync(readmePath, 'utf8');

    assert.ok(content.includes('build:android:apk'), 'README must reference build:android:apk script');
    assert.ok(content.includes('--profile preview'), 'README must mention preview profile');
    assert.ok(content.includes('--local'), 'README must document local builds');
    assert.ok(content.includes('adb install'), 'README must provide adb sideload instructions');
});
