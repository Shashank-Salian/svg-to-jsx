const assert = require("assert");
const fs = require("fs");

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const help = require("../../src/helper");
// const myExtension = require("../../src/extension");

suite("Helper functions test", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("File format test", () => {
    assert.strictEqual(help.formatFileName("test.svg", ".jsx"), "Test.jsx");
    assert.strictEqual(
      help.formatFileName("test-other-something.svg", ".tsx"),
      "TestOtherSomething.tsx"
    );
    assert.strictEqual(
      help.formatFileName("test other-something.svg", ".tsx"),
      "TestOtherSomething.tsx"
    );
    assert.strictEqual(
      help.formatFileName("test other-something.other.s.svg", ".tsx"),
      "TestOtherSomethingOtherS.tsx"
    );
    assert.strictEqual(
      help.formatFileName("test other-something.other..svg", ".tsx"),
      "TestOtherSomethingOther.tsx"
    );
    assert.strictEqual(
      help.formatFileName("test ?-} other-something.other..svg", ".tsx"),
      "TestOtherSomethingOther.tsx"
    );
    assert.strictEqual(
      help.formatFileName("test ?-} other-something.other..svg?s", ".tsx"),
      "TestOtherSomethingOther.tsx"
    );
    assert.strictEqual(
      help.formatFileName("test ?-} other-something.other.otr", ".tsx"),
      "TestOtherSomethingOther.tsx"
    );
    assert.strictEqual(
      help.formatFileName("test ?-} other-something", ".tsx"),
      "TestOtherSomething.tsx"
    );
  });

  test("Distinct file name test", async () => {
    const testAssetPath = `${__dirname}/../../testassets`;

    const uniqueUri = `file:///${testAssetPath}/Unique.jsx`;

    fs.openSync(`${testAssetPath}/Existing.tsx`, "w");
    const existingUri = `file:///${testAssetPath}/Existing.tsx`;

    assert.strictEqual(
      (await help.createJsxFile(vscode.Uri.parse(uniqueUri), ".jsx")).toString(
        true
      ),
      uniqueUri
    );

    assert.strictEqual(
      (
        await help.createJsxFile(vscode.Uri.parse(existingUri), ".tsx")
      ).toString(true),
      `file:///${testAssetPath}/Existing1.tsx`
    );

    fs.openSync(`${testAssetPath}/Existing1.tsx`, "w");
    assert.strictEqual(
      (
        await help.createJsxFile(vscode.Uri.parse(existingUri), ".tsx")
      ).toString(true),
      `file:///${testAssetPath}/Existing2.tsx`
    );

    fs.unlinkSync(`${testAssetPath}/Existing.tsx`);
    fs.unlinkSync(`${testAssetPath}/Existing1.tsx`);
  });
});
