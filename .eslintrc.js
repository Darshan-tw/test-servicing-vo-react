module.exports = {
    parser: '@typescript-eslint/parser', // If using TypeScript
    plugins: ['react'],
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      // Add other configurations as needed
    ],
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
    rules: {
      // Your custom rules here
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true, // Enable JSX parsing
      },
      ecmaVersion: 2020, // Or another version
      sourceType: 'module', // Allow use of imports
    },
  };
  