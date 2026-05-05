const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force ALL imports of react, react-native, and react-query to resolve
//    from the mobile app's node_modules — even when called from deep inside
//    symlinked workspace packages (e.g., packages/hooks).
const DEDUPLICATED_MODULES = [
    'react',
    'react-native',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@tanstack/react-query',
    '@tanstack/query-core',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (DEDUPLICATED_MODULES.includes(moduleName)) {
        const resolved = require.resolve(moduleName, {
            paths: [path.resolve(projectRoot, 'node_modules')],
        });
        return { filePath: resolved, type: 'sourceFile' };
    }
    return context.resolveRequest(context, moduleName, platform);
};

// Add SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = withNativeWind(config, { input: './global.css' });
