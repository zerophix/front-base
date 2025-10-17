import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "test-*.js",
      "debug-*.js",
      "*.sh",
      "scripts/**",
      "tmp/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-img-element": "warn",
      // 禁止在内联样式中使用硬编码颜色值
      "no-restricted-syntax": [
        "warn",
        {
          "selector": "JSXAttribute[name.name='style'] Property[key.name=/color/i][value.type='Literal'][value.value=/^#/]",
          "message": "避免在内联样式中使用硬编码颜色值，请使用CSS变量替代。"
        },
        {
          "selector": "JSXAttribute[name.name='style'] Property[key.name=/background/i][value.type='Literal'][value.value=/^#/]",
          "message": "避免在内联样式中使用硬编码颜色值，请使用CSS变量替代。"
        }
      ],
    },
  },
  // 允许在 Node 配置文件中使用 CommonJS 的 require 写法
  {
    files: ["**/jest.config.js", "**/*.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
