import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['dist']),

    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            react.configs.flat.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: globals.browser,
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            curly: 'error',
            eqeqeq: 'error',
            'no-const-assign': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-console': 'warn',

            'no-else-return': 'error',
            'prefer-template': 'error',
            'prefer-arrow-callback': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'object-shorthand': 'error',
            'no-unneeded-ternary': 'error',

            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            'react/jsx-boolean-value': 'error',
            'react/jsx-curly-brace-presence': 'error',
            'react/self-closing-comp': 'error',
            'react/jsx-no-useless-fragment': 'error',

            'no-eval': 'error',
            'no-implied-eval': 'error',
            'require-await': 'error',

            'react/react-in-jsx-scope': 'off',
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['^react', '^react-', '^redux', '^redux-', '^@reduxjs/'],
                        ['^@?\\w'],
                        ['^@', '^'],
                        ['^\\./'],
                        ['^\\u0000'],
                    ],
                },
            ],
        },
    },
]);
