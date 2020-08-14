const fs = require('fs');
const path = require('path');
const sander = require('sander');
const assert = require('assert');
const rollup = require('rollup');
const plugin = require('./index.js');


const folderName = 'default'

sander.rimrafSync(`test/${folderName}/dist`);
sander.mkdirSync(`test/${folderName}/dist`);

(async function() {

try {
  const bundle = await rollup.rollup({
    input: `test/${folderName}/src/index.js`,
    acornInjectPlugins: [
      require('acorn-jsx')()
    ],
    external: ['react', 'react-dom'],
    plugins: [
    // 	babel({
    // 		presets: [
    // 			'react-app',
    // 		],
    // 		exclude: 'node_modules/**',
    // 		runtimeHelpers: true,
    // 	}),
      // plugin(/* options */)
      plugin({
        showComponentDisplayName: true
      })
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
})()