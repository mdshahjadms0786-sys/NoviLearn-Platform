module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-packagejson'],
  overrides: [
    {
      files: ['*.json', '*.md', '*.yaml', '*.yml'],
      options: {
        printWidth: 120,
      },
    },
  ],
};