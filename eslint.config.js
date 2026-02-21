import js from '@eslint/js';
import globals from 'globals';
// Lint plugins temporarily disabled until they support ESLint 10
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'supabase/functions/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // no plugins enabled until compatible versions are available
    rules: {
      // Disable problematic rule that has compatibility issues with ESLint v9
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  }
);
