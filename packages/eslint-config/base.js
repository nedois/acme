import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import turbo from "eslint-plugin-turbo";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  stylistic.configs["recommended"],
  perfectionist.configs["recommended-natural"],
  turbo.configs["flat/recommended"],
  {
    plugins: { unicorn },
    rules: {
      "@stylistic/semi": ["warn", "always"],
      "unicorn/prefer-node-protocol": "warn",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
