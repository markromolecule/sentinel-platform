import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const easPath = path.resolve(__dirname, 'eas.json');
const pkgPath = path.resolve(__dirname, 'package.json');

test('enforces standalone APK buildType for preview profiles in eas.json', () => {
    const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));

    assert.ok(eas.build, 'eas.json must define a build configuration');
    assert.ok(eas.build.preview, 'eas.json must define a preview profile');
    assert.ok(eas.build.preview.android, 'preview profile must define android options');
    assert.strictEqual(eas.build.preview.android.buildType, 'apk', 'preview profile must enforce buildType: "apk"');

    assert.ok(eas.build['preview-apk'], 'eas.json must define a dedicated preview-apk profile');
    assert.ok(eas.build['preview-apk'].android, 'preview-apk profile must define android options');
    assert.strictEqual(eas.build['preview-apk'].android.buildType, 'apk', 'preview-apk profile must enforce buildType: "apk"');
});

test('preserves production profile for store AAB submission', () => {
    const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));

    assert.ok(eas.build.production, 'eas.json must define a production profile');
    assert.notStrictEqual(eas.build.production.android?.buildType, 'apk', 'production profile must not force apk to preserve store aab');
});

test('exposes convenience npm build scripts in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    assert.strictEqual(pkg.scripts['build:android:apk'], 'eas build --platform android --profile preview', 'package.json must contain build:android:apk script');
    assert.strictEqual(pkg.scripts['build:android:apk:local'], 'eas build --platform android --profile preview --local', 'package.json must contain build:android:apk:local script');
});
