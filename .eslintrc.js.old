module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: './tsconfig.json', // Important for rules that require type information
  },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn", // Warn on 'any' type
    "@typescript-eslint/explicit-module-boundary-types": "off", // Allow functions to not explicitly define return types if inferred
    "prettier/prettier": ["warn", { "endOfLine": "auto" }] // Fixes CRLF/LF issues with Prettier on different OS
  },
  ignorePatterns: ["dist/**/*", "coverage/**/*", "node_modules/**/*", "*.js"], // Ignore generated files and JS config files for now
};
