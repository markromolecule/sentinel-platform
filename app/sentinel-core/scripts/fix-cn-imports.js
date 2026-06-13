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
            if (content.includes("from '@/lib/utils'")) {
                console.log(`Fixing cn import in: ${fullPath}`);
                const updated = content.replaceAll("from '@/lib/utils'", "from '@sentinel/ui'");
                fs.writeFileSync(fullPath, updated, 'utf8');
            }
        }
    });
}

walk(targetDir);
console.log('Done fixing cn imports.');
