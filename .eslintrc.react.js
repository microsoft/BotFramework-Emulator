module.exports = {
  extends: ['./.eslintrc.js', 'plugin:react/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/no-deprecated': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.tsx', '**/*.spec.tsx', '**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'react/display-name': 'off',
      },
    },
  ],
};
