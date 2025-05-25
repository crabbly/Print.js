// @ts-check

import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
// import eslintConfigPrettier from 'eslint-config-prettier'; // Removed
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // This includes eslint-plugin-prettier and eslint-config-prettier

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      // "webpack.config.js", // Removed as file no longer exists
      // "karma.conf.js", // Keep for now, but might be removed later
      ".babelrc",
      "*.js", // Ignoring all .js files at the root as per original config
      "eslint.config.mjs", // Corrected from eslint.config.js
      ".eslintrc.js.old" // Ignoring the old config file
    ]
  },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypescript,
    },
    rules: {
      ...eslintPluginTypescript.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  eslintPluginPrettierRecommended, // Apply prettier rules last
  // The eslintPluginPrettierRecommended should handle prettier/prettier rule configuration.
  // If specific override is still needed for severity:
  {
    rules: {
      "prettier/prettier": ["warn", { "endOfLine": "auto" }]
    }
  }
];
