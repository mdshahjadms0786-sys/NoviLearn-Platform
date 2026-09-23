const js = require("@eslint/js");
const globals = require("globals");
const importPlugin = require("eslint-plugin-import");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      react: {
        version: "18.3",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"],
        },
        alias: {
          map: [["@", "./src"]],
          extensions: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          pathGroups: [
            {
              pattern: "@novilearn/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: [],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always",
        },
      ],
      "import/no-unresolved": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.expo/**",
      "**/coverage/**",
      "**/*.config.*",
      "**/*.lock",
      ".turbo/**",
    ],
  },
];
