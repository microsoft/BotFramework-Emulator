module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:security/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'notice', '@typescript-eslint', 'security'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    // eslint rules
    'no-dupe-class-members': 'off',
    'no-undef': 'off', // ts compiler catches this
    'prefer-const': 'error',
    'padding-line-between-statements': [
      1,
      { blankLine: 'always', prev: '*', next: 'case' },
      { blankLine: 'always', prev: '*', next: 'case' },
    ],
    // plugin: import
    'import/first': 'error',
    'import/order': ['error', { 'newlines-between': 'always' }],

    // plugin: notice
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

    // plugin: typescript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false }],
  },
  overrides: [
    {
      files: ['**/*.+(js|jsx)'],
      parser: 'babel-eslint',
    },
    {
      files: ['**/*.+(test|spec).+(js|jsx|ts|tsx)'],
      env: {
        jest: true,
      },
      rules: {
        'typescript/class-name-casing': 'off',
        'typescript/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],
};
