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
    //     return 'console.log(4)'
    //   }
    //   return null; // other ids should be handled as usually
    // },
    transform(code, id) {
			if (!filter(id)) return null;
      if (!~fileExtensions.indexOf(path.extname(id))) return null;

      const ast = this.parse(code);
      let ms = new MagicString(code)
      ms.prepend(`import React from 'react'`)
      let STYLECONTENT, STYLEDECLARATION
      let lastChildofDefault, pos_HeadOfDefault
      let stateMap = new Map()
      let assignmentsMap = new Map()
      walk(ast, {
        enter(node, parent, prop, index) {
          if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration.declarations[0].id.name === 'STYLE') {
              STYLEDECLARATION = node
              let loc = node.declaration.declarations[0].init
              STYLECONTENT = ms.slice(loc.start, loc.end)
            }
          }
          if (node.type === 'ExportDefaultDeclaration') {
            lastChildofDefault = node.declaration.body.body.find(x => x.type==='ReturnStatement').argument.children.slice(-1)[0] // use start and end
            pos_HeadOfDefault = node.declaration.body.start + 1
          }
          if (node.type === 'VariableDeclaration') {
            let dec = node.declarations[0]
            if (dec.id.name.startsWith('$')) {
              stateMap.set(dec.id.name, {
                node, // for replacement
                value: dec.init.raw // for use in templating
              })
            }
          }


          // SETSTATE
          if (node.type === 'AssignmentExpression') {
            // todo: maybe only read assignmentexpressions if the LHS is in the stateMap
            if (node.left.name.startsWith('$')) {
              assignmentsMap.set(node.left.name, {
                node
              })
            }
          }
          if (node.type === 'UpdateExpression') {
            // todo: maybe only read assignmentexpressions if the LHS is in the stateMap
            if (node.argument.name.startsWith('$')) {
              assignmentsMap.set(node.argument.name, {
                node
              })
            }
          }
        },
        // leave(node) {
        //   // if (node.scope) scope = scope.parent;
        // }
      });

      /* 
      
      // process it!
      
      */
      // remove STYLE and insert style jsx
      if (STYLEDECLARATION && STYLECONTENT) {
        ms.remove(STYLEDECLARATION.start, STYLEDECLARATION.end)
        ms.appendRight(lastChildofDefault.end, `<style jsx>{${STYLECONTENT}}</style>`)
      }
      
      // useState
      if (stateMap.size) {
        stateMap.forEach(({node, value}, key) => {
          ms.remove(node.start, node.end)
          let temp = `\nconst [${key}, set${key}] = React.useState(${value})`
          ms.appendRight(pos_HeadOfDefault, temp)
        })
      }

      // setState
      if (assignmentsMap.size) {
        assignmentsMap.forEach(({node}, key) => {
          // strategy: use comma separator to turn
          // $count = $count + 1
          // into
          // ($count = $count + 1, set$count($count))
          ms.prependLeft(node.start, '(')
          ms.appendRight(node.end, `, set${key}(${key}))`)
        })
      }

      code = ms.toString()

      return {
        code,
        map: null
      }
    }
  };
}
