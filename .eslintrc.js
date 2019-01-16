module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:typescript/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['import', 'notice'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    // eslint rules
    'prefer-const': 'error',

    // plugin: import
    'import/first': 'error',
    'import/order': ['error', { 'newlines-between': 'always' }],

    'notice/notice': [
      'error',
      {
        mustMatch: 'Copyright \\(c\\) Microsoft',
        templateFile: require.resolve('./copyright.js'),
        messages: {
          whenFailedToMatch: 'Missing copyright header.',
        },
      },
    ],

    'no-dupe-class-members': 'off',

    'typescript/explicit-member-accessibility': 'warn',
    'typescript/indent': 'off',
    'typescript/no-empty-interface': 'warn',
    'typescript/no-parameter-properties': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.tsx', '**/*.spec.tsx', '**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true,
      },
    },
  ],
};
