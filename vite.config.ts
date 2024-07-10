import { defineConfig, UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { builderDevTools } from "@builder.io/dev-tools/vite";
import pkg from "./package.json";

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

export default defineConfig(({ command, mode }): UserConfig => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), builderDevTools()],
    optimizeDeps: {
      exclude: ["node:module"], // Exclude problematic Node.js modules
    },
    build: {
      rollupOptions: {
        external: ["node:module"], // Ensure these modules are externalized
      },
    },
    server: {
      hmr: {
        overlay: false, // Disable HMR overlay for better debugging experience
      },
      headers: {
        "Cache-Control": "public, max-age=0", // Disable caching in dev mode
      },
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600", // Cache preview responses
      },
    },
  };
});

function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep
) {
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep]
  );

  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value)
  );

  if (qwikPkg.length > 0) {
    throw new Error(`Move qwik packages ${qwikPkg.join(", ")} to devDependencies`);
  }

  if (duplicateDeps.length > 0) {
    throw new Error(`
      Warning: The dependency "${duplicateDeps.join(
        ", "
      )}" is listed in both "devDependencies" and "dependencies".
      Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
    `);
  }
}
