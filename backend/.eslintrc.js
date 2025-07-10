module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/node_modules/**/*", // Ignore dependencies.
    "test-kms.js", // Ignore test files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    'quotes': 'off', // Disable quote style enforcement
    'import/no-unresolved': 0,
    'indent': 'off', // Disable indentation checks
    'max-len': 'off', // Disable line length checks
    'object-curly-spacing': 'off', // Disable object spacing
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'no-unused-vars': 'off', // Turn off base rule
    '@typescript-eslint/no-unused-vars': 'warn', // Change to warning
    'linebreak-style': 'off', // Disable line ending checks
    'comma-dangle': 'off', // Disable trailing comma requirement
    'no-trailing-spaces': 'off', // Disable trailing spaces check
    'operator-linebreak': 'off', // Disable operator placement rules
    'padded-blocks': 'off', // Disable padded blocks rule
    'arrow-parens': 'off', // Disable arrow function parentheses rule
  },
};
