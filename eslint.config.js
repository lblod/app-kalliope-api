const globals = require('globals');
const pluginJs = require('@eslint/js');
const eslintConfigPrettier = require('eslint-config-prettier');
const stylisticJs = require('@stylistic/eslint-plugin-js');

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@stylistic/js/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },
  {
    files: ['test/**'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
];
