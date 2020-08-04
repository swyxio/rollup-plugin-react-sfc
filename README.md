# a rollup plugin for react sfcs

NPM: http://npm.im/rollup-plugin-react-sfc

> ⚠️ THIS PACKAGE IS JUST A PROOF OF CONCEPT. IT WORKS ONLY ON TEST CASES SHOWN IN THE REPO.

- https://gist.github.com/sw-yx/b30d7e6bdcc2575f8f02d7fa8afcb587#domain-specific-react
- https://github.com/react-sfc/react-sfc-proposal

![image](https://user-images.githubusercontent.com/6764957/89126435-3c8c9900-d518-11ea-93b2-9f2f7df14db5.png)


## usage

take a rollup react app ([try it out in this example](https://github.com/sw-yx/rollup-react-boilerplate))

```bash
npm i -D rollup-plugin-react-sfc  
```

Then also make sure you have [styled-jsx](https://github.com/vercel/styled-jsx) setup. We have a hard dependency on styled-jsx to do css-in-js for the time being.

## Features implemented

- [x] Automatic react import
- [x] mutable useState $syntax
- [x] useStateWithLabel hook replaces useState
- [x] Dynamic CSS transform to styled-JSX
- [x] `$value={$text}` for onChange

TODO:

- [ ] static CSS export (most important!)
- [ ] it does not properly work with `styled-jsx` in rollup - need [SUPER hacky shit](https://twitter.com/swyx/status/1290055528068952064) to work (see boilerplate's index.html)
- [ ] useEffect dependency tracking
- [ ] nothing graphql related yet
- [ ] optional `css` no-op function for syntax highlighting in JS
- [ ] $value shorthand eg `$value`
- [ ] $value generalized eg `$style`
- [ ] set displayName based on fileName?

## helpful resources used in making this

- make plugin design
  - https://github.com/elemental-design/rollup-plugin-mdx/blob/master/src/index.js
    - maybe just transform is needed 
- make rollup understand jsx
  - https://github.com/KaiHotz/react-rollup-boilerplate/blob/master/package.json
    - maybe need to pass thru babel first to deal with unexpected token
  - https://github.com/alexmingoia/jsx-transform
    - use this to make rollup not vomit on jsx
  - https://rollupjs.org/guide/en/#acorninjectplugins
    - or this? 
    - yes this did it
- transforming
  - https://github.com/rollup/plugins/tree/master/packages/pluginutils#attachscopes
  - https://github.com/rollup/plugins/blob/master/packages/dynamic-import-vars/src/index.js
    - how to use estree and mstring together

misc inspo
- https://github.com/yuchi/hooks.macro
- detour to babel: https://astexplorer.net/#/gist/23730d63bb02a39393bf3dba270d18e6/fc1cc76e0b6e56d8e9be8520c06ab077a7717dd6


notes to self

- does not work with vite - no rollup in dev - but maybe can use vite's transform https://github.com/vitejs/vite/issues/657
