// @ts-check

import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // This includes eslint-plugin-prettier and eslint-config-prettier

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      "webpack.config.js",
      "karma.conf.js",
      ".babelrc",
      "*.js", // Ignoring all .js files at the root as per original config
      "eslint.config.js", // Ignoring the new config file itself
      ".eslintrc.js.old" // Ignoring the old config file
    ]
  },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest', // Updated from 2020 to latest
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypescript,
      // 'prettier' plugin is part of eslintPluginPrettierRecommended
    },
    rules: {
      // From plugin:@typescript-eslint/recommended (implicitly included via extends in old config)
      // Many rules are enabled by default in '@typescript-eslint/recommended'
      // We need to ensure the specific overrides from the old config are applied.

      // Original rules:
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // "prettier/prettier": ["warn", { "endOfLine": "auto" }] // This is handled by eslint-plugin-prettier/recommended
    },
  },
  eslintPluginPrettierRecommended, // Apply prettier rules last
  // Need to manually add the prettier rule override if eslint-plugin-prettier/recommended doesn't handle it
  // For "prettier/prettier": ["warn", { "endOfLine": "auto" }]
  // This is usually configured via a .prettierrc.js file or similar, 
  // but if it needs to be in ESLint config:
  {
    rules: {
      "prettier/prettier": ["warn", { "endOfLine": "auto" }]
    }
  }
];
