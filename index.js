const { createFilter } = require("@rollup/pluginutils");
const path = require("path");
// const fs = require("fs");
const { Compiler } = require("react-sfc");

module.exports = function reactSFC(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const fileExtensions = [".react", ".jswyx"];

  const isProduction = false; // TODO: figure out how to get this from rollup

  // undocumented option - tbd if we actually want to let users configure
  // TODO: can make it dev-only, or maybe also useful in prod?
  const userWantsUSWL = options.useStateWithLabel || !isProduction;

  return {
    name: "react-sfc",
    transform(code, id) {
      if (!filter(id)) return null;
      if (!~fileExtensions.indexOf(path.extname(id))) return null;
      const { js, css } = Compiler({
        code,
        parser: this.parse,
        useStateWithLabel: userWantsUSWL,
      });
      // TODO: handle this.emitFile(css)

      return {
        code: js.code,
        map: js.map,
      };
    },
  };
};


// stuff i may need in future

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