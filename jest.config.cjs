/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        verbatimModuleSyntax: false,
        esModuleInterop: true,
      },
    }],
  },
  // Добавляем сбор покрытия именно для engine.ts
  collectCoverageFrom: [
    "src/game/engine.ts",
    "!src/**/*.d.ts"
  ],
};