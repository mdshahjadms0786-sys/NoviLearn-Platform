const globals = require("globals");

module.exports = [
  ...require("@novilearn/config/eslint/next.js"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
