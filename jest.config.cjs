/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // where Jest should look
  roots: ["<rootDir>/src", "<rootDir>/tests"],

  // which files are tests
  testMatch: [
    "**/?(*.)+(test|spec).[tj]s?(x)",
  ],

  moduleFileExtensions: ["ts", "js", "json"],

  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};