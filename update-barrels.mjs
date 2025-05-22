import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolves the absolute path of a module, adding extensions if necessary.
 * @param {string} modulePath - The relative path of the module.
 * @param {string} baseDir - The base directory to resolve the path from.
 * @returns {string|null} - The resolved absolute path or null if not found.
 */
function resolveModulePath(modulePath, baseDir) {
    // create absolute path
    const fullPath = path.resolve(baseDir, modulePath);

    if (fs.existsSync(fullPath)) {
        return fullPath;
    }

    const extensions = ['.tsx', '.ts', '.js'];
    for (const ext of extensions) {
        const fullPathWithExt = fullPath + ext;
        if (fs.existsSync(fullPathWithExt)) {
            return fullPathWithExt;
        }
    }

    return null;
}

/**
 * Checks if a module file has a default export.
 * @param {string} moduleFilePath - The file path of the module.
 * @returns {boolean} - True if the module has a default export, false otherwise.
 */
function moduleHasDefaultExport(moduleFilePath) {
    try {
        const content = fs.readFileSync(moduleFilePath, 'utf8');
        return /\bexport\s+default\b/.test(content);
    } catch (err) {
        console.warn(`Cannot load file ${moduleFilePath}: ${err}`);
        return false;
    }
}

/**
 * Transforms an index file by replacing wildcard exports with named exports
 * for modules that have a default export.
 * @param {string} filePath - The file path of the index file to transform.
 */
function transformIndexFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /^export\s+\*\s+from\s+['"](.*)['"];$/gm;
    let modifiedContent = content;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const modulePath = match[1];


        const absoluteModulePath = resolveModulePath(modulePath, path.dirname(filePath));
        if (!absoluteModulePath) {
            console.warn(`Cannot load file ${modulePath}`);
            continue;
        }

        if (!moduleHasDefaultExport(absoluteModulePath)) {
            console.log(`Module ${modulePath} does not have default export, no change here.`);
            continue;
        }

        const baseName = path.basename(modulePath).replace(/\.[^.]+$/, '');
        const newLine = `export { default as ${baseName} } from "${modulePath}";`;
        modifiedContent = modifiedContent.replace(match[0], newLine);
    }

    if (modifiedContent !== content) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`File ${filePath} was updated.`);
    } else {
        console.log(`In file ${filePath} no changes.`);
    }
}

const indexFilePath = process.argv[2] || path.resolve(__dirname, 'src/client/index.ts');
transformIndexFile(indexFilePath);
