import globals from "globals";
import tseslint from "typescript-eslint";
import eslintJs from "@eslint/js";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_.*" },
      ],
    },
  },
];
