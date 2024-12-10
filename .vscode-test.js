const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig([
  {
    label: "unitTests",
    files: "./test/**/*.test.js",
    workspaceFolder: "./",
    mocha: {
      ui: "tdd",
      timeout: 20000,
    },
    launchArgs: ["--disable-extensions"],
  },
  // you can specify additional test configurations, too
]);
