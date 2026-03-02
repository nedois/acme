import { defineConfig } from "vitest/config";
import { sharedConfig } from "@nedois/vitest-config";

export default defineConfig({
  ...sharedConfig,
  test: {
    projects: [
      {
        root: "./packages",
        test: {
          ...sharedConfig.test,
        },
      },
      {
        root: "./apps",
        test: {
          ...sharedConfig.test,
          environment: "jsdom",
        },
      },
    ],
  },
});