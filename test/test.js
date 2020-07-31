const fs = require('fs');
const path = require('path');
const sander = require('sander');
const assert = require('assert');
const rollup = require('rollup');

// const babel = require('rollup-plugin-babel')
// const { SourceMapConsumer } = require('source-map');

const plugin = require('..');


describe('rollup-plugin-react-sfc', () => {
	it('does the basic stuff', async () => {
    
    const folderName = 'default'

		sander.rimrafSync(`test/${folderName}/dist`);
		sander.mkdirSync(`test/${folderName}/dist`);

		try {
			const bundle = await rollup.rollup({
				input: `test/${folderName}/src/index.js`,
				acornInjectPlugins: [
					require('acorn-jsx')()
				],
				plugins: [
				// 	babel({
				// 		presets: [
				// 			'react-app',
				// 		],
				// 		exclude: 'node_modules/**',
				// 		runtimeHelpers: true,
				// 	}),
					plugin(/* options */)
				]
			});

			await bundle.write({
				format: 'iife',
				file: `test/${folderName}/dist/bundle.js`,
				// globals: { 'svelte/internal': 'svelte' }
			});
		} catch (err) {
			console.log(err);
			throw err;
		}

		assert.equal(
			fs.readFileSync(`test/${folderName}/dist/bundle.js`, 'utf-8'),
			fs.readFileSync(`test/${folderName}/expected/bundle.js`, 'utf-8')
		);
  });
})