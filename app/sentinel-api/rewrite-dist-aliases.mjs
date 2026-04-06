import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distRoot = path.join(__dirname, 'dist');
const jsExtensionPattern = /\.js$/;
const aliasPattern = /(['"])@\/([^'"]+)\1/g;

function getJavaScriptFiles(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    return entries.flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            return getJavaScriptFiles(fullPath);
        }

        return entry.isFile() && jsExtensionPattern.test(entry.name) ? [fullPath] : [];
    });
}

function toModulePath(fromFile, aliasTarget) {
    const absoluteTarget = path.join(distRoot, aliasTarget);
    const relativeTarget = path.relative(path.dirname(fromFile), absoluteTarget);
    const normalizedTarget = relativeTarget.split(path.sep).join('/');

    return normalizedTarget.startsWith('.') ? normalizedTarget : `./${normalizedTarget}`;
}

function rewriteAliases(filePath) {
    const source = fs.readFileSync(filePath, 'utf8');
    const updated = source.replace(aliasPattern, (_match, quote, aliasTarget) => {
        return `${quote}${toModulePath(filePath, aliasTarget)}${quote}`;
    });

    if (updated !== source) {
        fs.writeFileSync(filePath, updated);
    }
}

for (const filePath of getJavaScriptFiles(distRoot)) {
    rewriteAliases(filePath);
}
