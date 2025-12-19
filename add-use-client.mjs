import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'client', 'index.ts');

try {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes("'use client'")) {
            const newContent = `'use client';\n\n${content}`;
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Added 'use client' to ${filePath}`);
        } else {
            console.log(`'use client' already present in ${filePath}`);
        }
    } else {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }
} catch (err) {
    console.error('Error adding use client directive:', err);
    process.exit(1);
}

