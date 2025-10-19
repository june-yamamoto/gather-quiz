import globals from "globals";
import tseslint from "typescript-eslint";
import eslintJs from "@eslint/js";

export default tseslint.config(
  // グローバルな無視設定
  {
    ignores: ["**/dist/", "**/node_modules/", "storybook-static/"],
  },

  // すべてのファイルに適用される基本設定
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,

  // フロントエンド用の設定
  {
    files: ["packages/frontend/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: "/workspaces/gather-quiz/packages/frontend",
      },
      globals: {
        ...globals.browser,
      },
    },
  },

  // バックエンド用の設定
  {
    files: ["packages/backend/**/*.{ts,js,mjs,cjs}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: "/workspaces/gather-quiz/packages/backend",
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_.*" },
      ],
    },
  }
);
