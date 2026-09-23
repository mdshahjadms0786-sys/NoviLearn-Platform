const nextConfig = require("./base.js");

module.exports = [
  ...nextConfig,
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];
