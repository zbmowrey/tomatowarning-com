import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts,mjs,cjs}'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
];
