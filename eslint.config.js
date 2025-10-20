import globals from "globals";
import tseslint from "typescript-eslint";
import eslintJs from "@eslint/js";

export default [
  // グローバルな無視設定を配列の先頭に配置
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "storybook-static/**",
      "packages/frontend/public/**",
      "packages/frontend/storybook-static/**",
      "packages/frontend/vite.config.ts",
      "packages/frontend/vitest.shims.d.ts",
      "packages/backend/vitest.config.ts",
    ],
  },

  // すべてのファイルに適用される基本設定
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,

  // フロントエンド用の設定
  {
    files: ["packages/frontend/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_" },
      ],
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
        { varsIgnorePattern: "^_" },
      ],
    },
  },
];
