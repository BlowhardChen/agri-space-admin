module.exports = {
	"*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
	"{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": ["prettier --write--parser json"],
	"package.json": ["prettier --write"],
	"*.{scss,styl}": ["stylelint --fix", "prettier --write"],
	"*.less": ["stylelint --fix --custom-syntax postcss-less", "prettier --write"],
	"*.md": ["prettier --write"]
};
