module.exports = {
  root: true,
  overrides: [
    {
      files: ["*.ts"],
      parserOptions: {
        project: [
          "tsconfig.json",
          "tsconfig.app.json",
          "tsconfig.spec.json"
        ],
        createDefaultProgram: true
      },
      extends: [
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      rules: {
        "@angular-eslint/directive-selector": [
          "error",
          { type: "attribute", prefix: "app", style: "camelCase" }
        ],
        "@angular-eslint/component-selector": [
          "error",
          { type: "element", prefix: "app", style: "kebab-case" }
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/consistent-indexed-object-style": "off",
        "@typescript-eslint/no-empty-function": ["off", { "allow": ["constructors"] }],
        "@angular-eslint/use-lifecycle-interface": "off",
        "@angular-eslint/no-empty-lifecycle-method": "off",
        "prefer-const": "off",
        "no-var": "off"
      }
    },
    {
      files: ["*.html"],
      extends: [
        "plugin:@angular-eslint/template/recommended",
        "plugin:@angular-eslint/template/accessibility"
      ],
      rules: {
        "@angular-eslint/template/click-events-have-key-events": "off",
        "@angular-eslint/template/interactive-supports-focus": "off"
      }
    }
  ]
};