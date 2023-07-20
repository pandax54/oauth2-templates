module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'prettier'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    'no-console': 1,
    camelcase: 1,
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'no-case-declarations': 0,
    'prefer-const': 'warn',
  },
}
