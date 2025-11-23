const globals = require("globals");
const tseslint = require("typescript-eslint");
const eslintJs = require("@eslint/js");

module.exports = [
  // グローバルな無視設定を配列の先頭に配置
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "storybook-static/**",
      "frontend/public/**",
      "frontend/storybook-static/**",
      "frontend/vite.config.ts",
      "frontend/vitest.shims.d.ts",
      "backend/vitest.config.ts",
    ],
  },

  // すべてのファイルに適用される基本設定
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,

  // フロントエンド用の設定
  {
    files: ["frontend/**/*.{ts,tsx}"],
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
    files: ["backend/**/*.{ts,js,mjs,cjs}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: "/workspaces/gather-quiz/backend",
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
