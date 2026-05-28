module.exports = {
	extends: [
		"stylelint-config-standard",
		"stylelint-config-prettier"
	],
	customSyntax: "postcss-less",
	rules: {
		"no-invalid-double-slash-comments": null,
		"declaration-block-no-duplicate-properties": null,
		"selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["deep", "global"] }],
		"selector-type-no-unknown": null,
		"no-descending-specificity": null,
		"property-no-unknown": null,
		"selector-class-pattern": null,
		"at-rule-no-unknown": null,
		"block-no-empty": null,
		"color-no-invalid-hex": true,
		"font-family-no-duplicate-names": true,
		"function-calc-no-unspaced-operator": true,
		"function-linear-gradient-no-nonstandard-direction": true,
		"string-no-newline": true,
		"unit-no-unknown": true
	},
	overrides: [
		{
			files: ["**/*.less"],
			customSyntax: "postcss-less"
		}
	]
};
