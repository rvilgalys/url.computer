/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  roots: ["<rootDir>", "./tests"],
  modulePaths: ["<rootDir>"],
};

module.exports = createJestConfig(customJestConfig);
