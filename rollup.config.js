import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';

export default {
    input: 'client/main.js',
    output: {
        file: 'public/bundle.js',
        format: 'iife',
		name: 'app',
        sourcemap: true,
    },
    plugins: [
        svelte({
            compilerOptions: {
                dev: true
            }
        }),
        css({ output: 'bundle.css' }),
        resolve({
            browser: true,
        }),
        commonjs()
    ]
};