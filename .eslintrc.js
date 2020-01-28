module.exports = {
  extends: ['eslint:recommended', 'plugin:typescript/recommended', 'plugin:prettier/recommended'],
  plugins: ['import', 'notice'],
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
    'typescript/explicit-function-return-type': 'off',
    'typescript/explicit-member-accessibility': 'off',
    'typescript/indent': 'off',
    'typescript/no-empty-interface': 'warn',
    'typescript/no-object-literal-type-assertion': 'off',
    'typescript/no-parameter-properties': 'off',
    'typescript/no-use-before-define': ['error', { functions: false, classes: false }],
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
      },
    },
  ],
};
