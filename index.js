const { createFilter, addExtension } = require('@rollup/pluginutils')
const path = require('path')
const fs = require('fs')
const {walk} = require('estree-walker')
const { default: MagicString } = require('magic-string')
const { join } = require('path')


const hooks = [
"useState",
"useEffect",
"useContext",
"useReducer",
"useCallback",
"useMemo",
"useRef",
"useImperativeHandle",
"useLayoutEffect",
"useDebugValue"
]


module.exports =  function reactSFC(options = {}) {
	const filter = createFilter(options.include, options.exclude);
  const fileExtensions = [".react", ".jswyx"]
  
  const isProduction = false // TODO: figure out how to get this from rollup

  // undocumented option - tbd if we actually want to let users configure
  // TODO: can make it dev-only, or maybe also useful in prod?
  const userWantsUSWL = options.useStateWithLabel || !isProduction


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
      
      let STYLECONTENT, STYLEDECLARATION
      let lastChildofDefault, pos_HeadOfDefault
      let stateMap = new Map()
      let assignmentsMap = new Map()
      let bindValuesMap = new Map()
      let isReactImported = false
      walk(ast, {
        enter(node, parent, prop, index) {
          if (node.type === 'ImportDeclaration') {
            if (node.source.value === 'react') isReactImported = true
            // TODO: check that the name React is actually defined!
            // most people will not run into this, but you could be nasty
          }
          if (node.type === 'CallExpression') {
            if (hooks.some(hook => node.callee.name === hook)) {
              ms.prependLeft(node.callee.start, 'React.')
            }
          }

          if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration.declarations[0].id.name === 'STYLE') {
              STYLEDECLARATION = node
              let loc = node.declaration.declarations[0].init
              STYLECONTENT = ms.slice(loc.start, loc.end)
            }
          }
          if (node.type === 'ExportDefaultDeclaration') {
            let RSArg = node.declaration.body.body.find(x => x.type==='ReturnStatement').argument
            if (RSArg.type === 'JSXElement') lastChildofDefault = RSArg.children.slice(-1)[0] // use start and end
            else throw new Error('not returning JSX in export default function') // TODO: fix this?

            pos_HeadOfDefault = node.declaration.body.start + 1
          }


          // usestate
          if (node.type === 'VariableDeclaration') {
            let dec = node.declarations[0]
            if (dec.id.name.startsWith('$')) {
              stateMap.set(dec.id.name, {
                node, // for replacement
                value: ms.slice(dec.init.start, dec.init.end) // for use in templating
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

          // BINDING
          if (node.type === 'JSXAttribute') {
            // // bind:value syntax - we may want to use this
            // if (node.name.type === 'JSXNamespacedName' && node.name.namespace.name === 'bind') {
            //   bindValuesMap.set(node // to replace
            //     , {
            //     LHSname: node.name.name.name, // right now will basically only work for 'value'
            //     RHSname: ms.slice(node.value.expression.start, node.value.expression.end)
            //   })
            // }
            if (node.name.type === 'JSXIdentifier' && node.name.name.startsWith('$')) {
              let RHSobject, RHSname
              if (node.value.expression.type === 'Identifier') {
                // RHS is just an identifier
                RHSname = node.value.expression.name
              } else if (node.value.expression.type === "MemberExpression") {
                // RHS is an object access
                RHSobject = {
                  objectName: node.value.expression.object.name,
                  fullAccessName: ms.slice(node.value.expression.start, node.value.expression.end)
                }
              } else {
                throw new Error ('warning - unrecognized RHS expression type in binding: ' + node.value.expression.type + '. We will probably do this wrong, pls report this along with your code')
              }

              bindValuesMap.set(node // to replace
                , {
                LHSname: node.name.name.slice(1), // only tested to work for 'value'. remove the leading $
                RHSname,
                RHSobject
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
     if (!isReactImported) ms.prepend(`import React from 'react'`)
      // remove STYLE and insert style jsx
      if (STYLEDECLARATION && STYLECONTENT) {
        ms.remove(STYLEDECLARATION.start, STYLEDECLARATION.end)
        ms.appendRight(lastChildofDefault.end, `<style jsx>{${STYLECONTENT}}</style>`)
      }
      
      // useState
      if (stateMap.size) {
        // for each state hook
        stateMap.forEach(({node, value}, key) => {
          ms.remove(node.start, node.end)
          let newStr
          if (userWantsUSWL) {
            // should be 'let' bc we want to mutate it
            newStr = `\nlet [${key}, set${key}] = use${key}_State(${value})`
            // i would like to use only one instance, of useStateWithLabel
            // https://stackoverflow.com/questions/57659640/is-there-any-way-to-see-names-of-fields-in-react-multiple-state-with-react-dev
            // but currently devtools uses the NAME OF THE HOOK for state hooks
            // rather than useDebugValue. so we do a simple alias of the hook
          ms.append(`
function use${key}_State(v) {
  return React.useState(v);
}`)
          } else {
            // just plain useState
            // should be 'let' bc we want to mutate it
            newStr = `\nlet [${key}, set${key}] = React.useState(${value})`
          }
          ms.appendRight(pos_HeadOfDefault, newStr)
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

      // binding
      if (bindValuesMap.size) {
        bindValuesMap.forEach(({LHSname, RHSname, RHSobject}, node) => {
          if (RHSobject) {
            // mutate the object, THEN set it
            ms.overwrite(node.start, node.end, `${LHSname}={${RHSobject.fullAccessName}} onChange={e => (${RHSobject.fullAccessName} = e.target.${LHSname}, set${RHSobject.objectName}(${RHSobject.objectName}))}`)
          } else if (RHSname) {
            ms.overwrite(node.start, node.end, `${LHSname}={${RHSname}} onChange={e => set${RHSname}(e.target.${LHSname})}`)
          } else {
            throw new Error("we should not get here. pls repurt this binding bug")
          }
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
