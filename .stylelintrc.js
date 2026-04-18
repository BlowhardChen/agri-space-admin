module.exports = {
	extends: ["stylelint-config-standard"],
	customSyntax: "postcss-less",
	rules: {
		"no-invalid-double-slash-comments": null,
		"declaration-block-no-duplicate-properties": null,
		"selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["deep", "global"] }],
		"selector-type-no-unknown": null,
		"no-descending-specificity": null,
		"property-no-unknown": null,
		"selector-class-pattern": null
	},
	overrides: [
		{
			files: ["**/*.less"],
			customSyntax: "postcss-less"
		}
	]
};
