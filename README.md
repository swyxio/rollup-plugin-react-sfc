# a rollup plugin for react sfcs

> ⚠️ THIS PACKAGE DOES NOT WORK YET. JUST STUBBING OUT THE PACKAGE IN CASE I FOLLOW UP ON IT.

- https://gist.github.com/sw-yx/b30d7e6bdcc2575f8f02d7fa8afcb587#domain-specific-react
- https://github.com/react-sfc/react-sfc-proposal


## helpful resource used making this

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