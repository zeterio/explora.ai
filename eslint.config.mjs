import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      prettier: prettier,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      
      // React specific rules
      "react/prop-types": "off", // Not needed with TypeScript
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/display-name": "off",
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
      
      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off", // Using TypeScript's version
      "prefer-const": "warn",
      "eqeqeq": ["warn", "always"],
      "curly": ["warn", "multi-line"],
      
      // Import rules
      "import/no-anonymous-default-export": "warn",
      "import/order": [
        "warn",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          "alphabetize": { "order": "asc", "caseInsensitive": true }
        }
      ],
      
      // Prettier integration
      "prettier/prettier": "warn"
    },
  },
  {
    ignores: ["node_modules", ".next", "out", "build", "public"],
  },
];

export default eslintConfig;
