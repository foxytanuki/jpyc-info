module.exports = {
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: '2020',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    "no-unused-vars": "off",
    "no-await-in-loop": "off",
    "no-undef": "off",
    "no-shadow": "off",
    "no-console": "off",
    "no-param-reassign": "off",
    "no-unused-expressions": "off",
    "no-nested-ternary": "off",
    "radix": "off",
    "react/jsx-pascal-case": "off",
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    'react/jsx-filename-extension': [2, { 'extensions': ['.js', '.jsx', '.ts', '.tsx'] }],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "import/no-unresolved": "off",
    "import/extensions": [
      "error", "always",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ]
  },
  settings: {
    "import/extensions": [
      ".js",
      ".jsx",
      ".ts",
      ".tsx"
    ],
    "import/resolver": {
      "node": {
        "extensions": [
          ".js",
          ".jsx",
          ".ts",
          ".tsx"
        ]
      }
    }
  },
};