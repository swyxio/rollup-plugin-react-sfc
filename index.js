const { createFilter, addExtension } = require('@rollup/pluginutils')
const path = require('path')
const fs = require('fs')
const {walk} = require('estree-walker')
const { default: MagicString } = require('magic-string')
// var jsx = require('jsx-transform');
module.exports =  function reactSFC(options = {}) {
	const filter = createFilter(options.include, options.exclude);

  const fileExtensions = [".react", ".jswyx"]

  return {
    name: 'react-sfc',
    // resolveId ( source ) {
    //   // todo: do i want to addExtension here?
    //   if (source && fileExtensions.some(x => source.endsWith(x))) {
    //     return source; // this signals that rollup should not ask other plugins or check the file system to find this id
    //   }
    //   return null; // other ids should be handled as usually
    // },
    // load ( id ) {
    //   if (id && fileExtensions.some(x => id.endsWith(x))) {
    //     // const src = fs.readFileSync(path.resolve(id))
    //   	// const referenceId = this.emitFile({
    //     //   type: 'asset',
    //     //   name: path.basename(id),
    //     //   source: fs.readFileSync(id)
    //     // });
    //     // return src
    //     return id
    //   }
    //   return null; // other ids should be handled as usually
    // },
    transform(code, id) {
			if (!filter(id)) return null;

			const extension = path.extname(id);
      if (!~fileExtensions.indexOf(extension)) return null;


      const ast = this.parse(code);

      let ms = new MagicString(code)
      ms.prepend(`import React from 'react'`)
      walk(ast, {
        enter(node, parent, prop, index) {
          ms.
        },
        leave(node) {
          if (node.scope) scope = scope.parent;
        }
      });


      code = ms.toString()
      return {
        code,
        map: null
      }
    }
  };
}
