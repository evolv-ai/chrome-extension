import typescript from '@rollup/plugin-typescript';
import copy from "rollup-plugin-copy";
import sass from 'rollup-plugin-sass';

export default [
	{
		input: 'src/background.ts',
		output: {
			file: 'dist/background.js',
			format: 'cjs'
		},
		plugins: [
			typescript(),
			copy({
				targets: [
					{ src: 'public/images', dest: 'dist/' },
					{ src: 'public/*', dest: 'dist/' },
					{ src: 'manifest.json', dest: 'dist/' }
				]
			})
		],
	},
	{
		input: 'src/contentScript.ts',
		output: {
			file: 'dist/contentScript.js',
			format: 'cjs'
		},
		plugins: [typescript()]
	},
	{
		input: 'src/injectScript.ts',
		output: {
			file: 'dist/injectScript.js',
			format: 'cjs'
		},
		plugins: [typescript()]
	},
	{
		input: 'src/popup.ts',
		output: {
			file: 'dist/popup.js',
			format: 'cjs'
		},
		plugins: [typescript()]
	}
]
