module.exports = {
  extends: ['./.eslintrc.js', 'plugin:react/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/no-deprecated': 'warn',
  },
  overrides: [
    {
      files: ['**/*.+(test|spec).+(js|jsx|ts|tsx)'],
      rules: {
        'react/display-name': 'off',
      },
    },
  ],
};
