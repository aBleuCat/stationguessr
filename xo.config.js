export default [
	{
		prettier: true,
		space: false,
		semicolon: true,
	},
	{
		ignores: [
			"**/node_modules/**",
			"**/.pnpm/**",
			"**/*.md",
			"dist/**",
			"build/**",
			"xo.config.js",
		],
	},
	{
		rules: {
			"curly": ["error", "multi-line"],
			"@stylistic/no-mixed-operators": "off",
			"prettier/prettier": [
				"error",
				{
					singleQuote: false,
					bracketSpacing: true,
					printWidth: 70,
					semi: true,
					trailingComma: "all",
					useTabs: true,
					tabWidth: 4,
					endOfLine: "auto",
				},
			],
			"@stylistic/quotes": [
				"error",
				"double",
				{
					allowTemplateLiterals: "never",
					avoidEscape: true,
					ignoreStringLiterals: false,
				},
			],
			"@typescript-eslint/naming-convention": [
				"error",
				{
					selector: "variable",
					format: ["camelCase", "UPPER_CASE"],
					leadingUnderscore: "allow"
				},
				{
					selector: "parameter",
					format: ["camelCase"],
					leadingUnderscore: "allow"
				},
				{
					selector: "typeLike",
					format: ["PascalCase"]
				}
			],
			// "no-unused-vars": ["error", {varsIgnorePattern: "^_"}]
		},
	}
];
