const Module = require('module');
const path = require('node:path');

const ALIAS_PREFIX = '@/';
const srcDir = __dirname;

if (!global.__sentinelAliasResolverRegistered) {
    const originalResolveFilename = Module._resolveFilename;

    Module._resolveFilename = function (request, parent, isMain, options) {
        if (typeof request === 'string' && request.startsWith(ALIAS_PREFIX)) {
            request = path.join(srcDir, request.slice(ALIAS_PREFIX.length));
        }

        return originalResolveFilename.call(this, request, parent, isMain, options);
    };

    global.__sentinelAliasResolverRegistered = true;
}
