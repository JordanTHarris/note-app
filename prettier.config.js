/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  bracketSpacing: true,
  semi: true,
  trailingComma: "all",
  printWidth: 90,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
