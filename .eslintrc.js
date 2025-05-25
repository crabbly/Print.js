module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Added for TypeScript
  ],
  parser: '@typescript-eslint/parser', // Added for TypeScript
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin', // Added for TypeScript
  ],
  rules: {},
};
