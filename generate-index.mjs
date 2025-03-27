import fs from "fs";
import path from "path";
import { glob } from "glob";

/**
 * __dirname is a variable commonly used in Node.js that represents the directory name of the current module's file.
 * It is typically used to construct file paths relative to the current module's location.
 *
 * In the provided context, `__dirname` is assigned the resolved absolute path of the current working directory using `path.resolve()`.
 *
 * Note: The reassignment of `__dirname` alters its default behavior, which typically points to the directory of the script being executed.
 */
const __dirname = path.resolve();
/**
 * The absolute path to the output file.
 * This variable resolves and stores the full file path of the "index.ts" file
 * located in the same directory as the current module.
 * Utilizes the `path.resolve` method to generate a consistent and platform-independent file path.
 */
const outputFile = path.resolve(__dirname, "index.ts");

/**
 * An array that contains absolute paths to directories used for components in the application.
 * Each path corresponds to a specific application component directory such as app layout,
 * fake data (panther), grafana configuration, map resources, and shared assets.
 *
 * The paths are resolved using the current directory as the base.
 */
const componentDirs = [
    path.resolve(__dirname, "(appLayout)"),
    path.resolve(__dirname, "(fakePanther)"),
    path.resolve(__dirname, "(grafana)"),
    path.resolve(__dirname, "(map)"),
    path.resolve(__dirname, "(shared)"),
    path.resolve(__dirname, "(auth)")
];

/**
 * The absolute path to the directory containing styles.
 * This variable holds the resolved path of the styles directory
 * relative to the current module's directory.
 *
 * It is used to locate style-related resources within the project.
 * By resolving the path using the current directory, it ensures
 * that the correct absolute path is set, regardless of where the
 * script is executed from.
 *
 * @type {string}
 */
const stylesDir = path.resolve(__dirname);

/**
 * Retrieves and formats file paths from specified directories based on their extensions.
 *
 * This function searches for files matching the provided extensions within the specified directories,
 * excluding any files within "node_modules". For each matching file, it generates an export statement
 * with a relative path.
 *
 * @param {string[]} dirs - An array of directory paths to search for files.
 * @param {string[]} [extensions=["ts", "tsx"]] - An optional array of file extensions to filter matches. Defaults to "ts" and "tsx".
 * @returns {string[]} An array of strings, each representing an export statement for a matched file.
 */
const getFiles = (dirs, extensions = ["ts", "tsx"]) => {
    let files = [];
    dirs.forEach(dir => {
        const matches = glob.sync(`${dir}/**/*.@(${extensions.join("|")})`, { ignore: "**/node_modules/**" });

        files.push(...matches.map(file => {
            const relativePath = `./${path.relative(__dirname, file).replace(/\\/g, "/")}`.replace(/\.(ts|tsx)$/, "");
            return `export * from '${relativePath}';`;
        }));
    });
    return files;
};


/**
 * This variable stores the exported components retrieved by fetching files from specified directories.
 * It is populated with files that have the extensions ".ts" and ".tsx".
 *
 * The `componentExports` is determined by calling the `getFiles` function, which scans
 * the provided directories and selects files matching the specified extensions.
 *
 * @type {Array<string>}
 * Contains a list of file paths to TypeScript (`.ts`) and TypeScript React (`.tsx`) files
 * found within the provided directories.
 */
const componentExports = getFiles(componentDirs, ["ts", "tsx"]);

/**
 * A list of file paths matching all CSS files within the specified styles directory,
 * including subdirectories, while excluding any files within node_modules directories.
 *
 * This variable is populated using the `glob.sync` method, which performs a synchronous
 * file search based on the provided directory pattern and options.
 *
 * The `stylesDir` variable represents the base directory where the search for CSS files begins.
 *
 * The `ignore` option is set to exclude files found within `node_modules` directories from the results.
 *
 * @type {string[]}
 */
const styleFiles = glob.sync(`${stylesDir}/**/*.css`, { ignore: "**/node_modules/**" });

/**
 * An array of dynamically generated import statements for style-related files.
 *
 * This variable processes the provided style files by mapping over them,
 * generating relative paths from the current directory, and creating import
 * statements using those paths. The generated paths are normalized to use
 * forward slashes for cross-platform compatibility.
 *
 * Each entry in the array is an import statement as a string, which can be
 * later used in a module or script to include the style files dynamically.
 */
const styleImports = styleFiles.map(file => {
    const relativePath = `./${path.relative(__dirname, file).replace(/\\/g, "/")}`;
    return `import '${relativePath}';`;
});

/**
 * Concatenates and merges a list of component exports, style imports,
 * and a default export statement into a single string, separated by newline characters.
 *
 * @constant {string} content - The resulting string containing the combined exports, imports,
 * and an empty export declaration separated by newlines.
 */
const content = [...componentExports, ...styleImports, "export {};"].join("\n");

fs.writeFileSync(outputFile, content);