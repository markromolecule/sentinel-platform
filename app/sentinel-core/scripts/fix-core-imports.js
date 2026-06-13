const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../src');

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('@/app/(protected)/(instructor)/')) {
                console.log(`Fixing imports in: ${fullPath}`);
                const updated = content.replaceAll(
                    '@/app/(protected)/(instructor)/',
                    '@/app/(protected)/',
                );
                fs.writeFileSync(fullPath, updated, 'utf8');
            }
        }
    });
}

walk(targetDir);
console.log('Done fixing imports.');
