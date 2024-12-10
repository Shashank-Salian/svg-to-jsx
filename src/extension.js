// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const svgtojsx = require("svg-to-jsx");
const config = require("./config");
const help = require("./helper");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  /**
   * Convert the SVG to JSX/TSX
   * Creates a new .jsx or .tsx file with the same name as the SVG's and
   * creates a boiler plate code for basic arrow functional component with the SVG as JSX
   *
   * @param {vscode.Uri} fileUri
   * @param {".jsx" | ".tsx"} ext The extention
   * @returns {Promise<vscode.Uri>}
   */
  const convert = async (fileUri, ext) => {
    return new Promise(async (resolve, reject) => {
      const fileContent = vscode.window.activeTextEditor.document.getText();

      try {
        let jsx = await svgtojsx(fileContent);
        jsx = help.addJSX(jsx, help.getFileName(fileUri), ext === ".tsx");

        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(jsx));
        resolve(fileUri);
        return;
      } catch (err) {
        await vscode.window.showErrorMessage(
          "Make sure you have opened a valid svg markup."
        );
        reject(err);
      }
    });
  };

  /**
   * On command event
   * @param {".jsx" | ".tsx"} ext
   * @returns
   */
  const onCommandEvent = async (ext) => {
    const activeTxtEditor = vscode.window.activeTextEditor;

    try {
      const jsxFileUri = await help.prepareFiles(activeTxtEditor, ext);

      if (jsxFileUri === null) {
        return;
      }

      await convert(jsxFileUri, ext);
      await help.formatDocument(jsxFileUri);

      if (config.getConfig("deleteSVG")) {
        await vscode.workspace.fs.delete(activeTxtEditor.document.uri, {
          useTrash: true,
        });
      }
    } catch (err) {
      await vscode.window.showErrorMessage("Something went wrong :(");
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "svg-to-jsx.converttotsx",
      async function () {
        await onCommandEvent(".tsx");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "svg-to-jsx.converttojsx",
      async function () {
        await onCommandEvent(".jsx");
      }
    )
  );
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
