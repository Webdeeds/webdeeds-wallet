import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Is this invoked using the storybook cli
const isStorybookBuild = process.argv[1]!.includes("storybook");
const includeReactRouterPlugin =
  !isStorybookBuild && process.env.NODE_ENV !== "test";

export default defineConfig({
  plugins: [
    // The react-router plugin requires there be a vite.config.ts in PWD
    // When running storybook build, PWD is .storybook, so this will error out
    ...(includeReactRouterPlugin ? [reactRouter()] : []),
    tsconfigPaths(),
  ],
});
