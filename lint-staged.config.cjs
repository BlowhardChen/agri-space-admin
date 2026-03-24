module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{css,less,scss}': ['stylelint --fix', 'prettier --write'],
  '*.{md,json}': ['prettier --write']
}
