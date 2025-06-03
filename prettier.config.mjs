/** @type {import("prettier").Config} */
const config = {
    "semi": false,
    "singleQuote": true,
    "plugins": ["@trivago/prettier-plugin-sort-imports"],
    "importOrderParserPlugins": ["typescript", "jsx", "classProperties", "decorators-legacy"],
    "importOrderSortSpecifiers": true,
    "importOrder": [
        "<THIRD_PARTY_MODULES>",
        "^[./]"
    ],
};

export default config;
