const path = require("path");
const fs = require("fs");
const Mocha = require("mocha");
const glob = require("glob");

function run() {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((c, e) => {
    glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      try {
        const testAssetPath = `${__dirname}/../../testassets`;
        fs.mkdirSync(testAssetPath);
      } catch (err) {
        if (err.code !== "EEXIST") {
          console.log("Create a folder 'testassets' to store test assets");
          throw err;
        }
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}

module.exports = {
  run,
};
