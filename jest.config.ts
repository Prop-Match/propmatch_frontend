import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  // msw's package.json "exports" map needs the default condition, which
  // jsdom's testEnvironment excludes by default — without this, requiring
  // "msw/node" throws "Cannot find module".
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/reference/"],
};

const finalConfig = async () => {
  const nextConfig = await createJestConfig(config)();
  return {
    ...nextConfig,
    // next/jest's own transformIgnorePatterns entry blanket-ignores
    // node_modules (bar a couple of Next-specific exceptions), which
    // clobbers any allow-list we pass alongside it. msw pulls in a chain of
    // ESM-only transitive deps (rettime, until-async, @mswjs/interceptors,
    // ...) that keeps growing, so transform all of node_modules rather than
    // maintaining that allow-list by hand.
    transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss)$"],
  };
};

export default finalConfig;
