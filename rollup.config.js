import resolve from '@rollup/plugin-node-resolve'; // Resolves node_modules imports
import typescript from '@rollup/plugin-typescript'; // Compiles TypeScript files
import json from '@rollup/plugin-json'; // Allows importing JSON files
import commonjs from '@rollup/plugin-commonjs'; // Converts CommonJS modules to ES6
import postcss from 'rollup-plugin-postcss'; // Processes CSS files
import babel from '@rollup/plugin-babel';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import { builtinModules } from 'module'
//import alias from '@rollup/plugin-alias'; // import alias plugin

import {createRequire} from 'module'; // Enables using require in ES modules

const require = createRequire(import.meta.url); // Creates a require function
const pkg = require('./package.json'); // Loads package.json for configuration

const extensionsClient = ['.js', '.jsx', '.ts', '.tsx'];
const extensionsServer = ['.js', '.ts'];

export default [
  {
    input: 'src/client/index.ts', // Entry point of the library
    output: [
      {file: pkg.main, format: 'cjs', sourcemap: true, banner: "'use client';"}, // CommonJS output
      {file: pkg.module, format: 'esm', sourcemap: true, banner: "'use client';"} // ES module output
    ],
    external: id => {
      const externals = [
        ...Object.keys(pkg.peerDependencies || {}),
        ...builtinModules,
      ];
      return externals.some(moduleName => id === moduleName || id.startsWith(`${moduleName}/`));
    },
    plugins: [
      json(), // Enables JSON imports
      postcss({
        extract: true, // Extracts CSS into a separate file
        modules: false, // Enables automatic CSS modules
        minimize: true, // Minifies CSS
        sourceMap: true, // Generates source maps for CSS
        plugins: [
          postcssImport(),
          autoprefixer()
        ],
      }),
      resolve({ browser: true, extensionsClient }), // Resolves file extensions
      commonjs(), // Converts CommonJS to ES6
      typescript({ declaration: false}), // Uses the specified TypeScript configuration
      babel({
        babelHelpers: 'bundled',
        extensionsClient,
        exclude: ['node_modules/**', 'dist/**'] // convert code
      })
    ]
  },

  {
    input: 'src/server/index.ts',
    output: [
      { file: 'dist/server/index.cjs.js', format: 'cjs'  },
      { file: 'dist/server/index.esm.js', format: 'esm' },
    ],
    external: id => [
      ...Object.keys(pkg.peerDependencies || []),
      ...builtinModules,
    ].some(name => id === name || id.startsWith(name + '/')),
    plugins: [
      resolve({ preferBuiltins: true, extensionsServer }), // Resolves file extensions
      commonjs(),
      typescript({ declaration: false }),
    ],
  },

  {
    input: 'src/globals/index.ts',
    output: [
      { file: 'dist/globals/index.cjs.js', format: 'cjs'  },
      { file: 'dist/globals/index.esm.js', format: 'esm' },
    ],
    external: id => [
      ...Object.keys(pkg.peerDependencies || []),
      ...builtinModules,
    ].some(name => id === name || id.startsWith(name + '/')),
    plugins: [
      resolve({ preferBuiltins: true, extensionsServer }), // Resolves file extensions
      commonjs(),
      typescript({ declaration: false }),
    ],
  },


];
