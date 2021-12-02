// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const svgtojsx = require("svg-to-jsx");
const fs = require("fs");
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
	 * @param {vscode.TextEditor} activeTxtEditor
	 * @param {string} finalPath File path in which the JSX/TSX will be stored
	 * @param {string} fileName File name in which the JSX/TSX will be stored
	 * @param {".jsx" | ".tsx"} ext The extention
	 * @returns {Promise<string>}
	 */
	const convert = async (activeTxtEditor, finalPath, fileName, ext) => {
		return new Promise(async (resolve, reject) => {
			const filePath = activeTxtEditor.document.uri.fsPath;
			const fileContent = activeTxtEditor.document.getText();

			try {
				const jsx = await svgtojsx(fileContent);

				const wstream = fs.createWriteStream(finalPath);
				wstream.write(help.addJSX(jsx, fileName, ext === ".tsx"), (err) => {
					if (err) {
						reject("ERROR");
					}
					if (config("deleteSVG")) {
						vscode.commands
							.executeCommand("workbench.action.closeActiveEditor")
							.then(() => {
								fs.unlinkSync(filePath);
								wstream.close();
								resolve(finalPath);
							});
					}
					wstream.close();
					resolve(finalPath);
				});
			} catch (err) {
				await vscode.window.showErrorMessage(
					"Make sure you have valid svg markup."
				);
				reject(err);
			}
		});
	};

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"svg-to-jsx.converttotsx",
			async function () {
				const activeTxtEditor = vscode.window.activeTextEditor;

				try {
					const fileDat = await help.checkFile(activeTxtEditor, ".tsx");

					if (fileDat === null) {
						return;
					}

					const jsxPath = await convert(
						activeTxtEditor,
						fileDat.finalPath,
						fileDat.fileName,
						".tsx"
					);
					await help.formatDocument(jsxPath);
				} catch (err) {
					await vscode.window.showErrorMessage("Something went wrong :(");
				}
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"svg-to-jsx.converttojsx",
			async function () {
				const activeTxtEditor = vscode.window.activeTextEditor;

				try {
					const fileDat = await help.checkFile(activeTxtEditor, ".jsx");

					if (fileDat === null) {
						return;
					}

					const jsxPath = await convert(
						activeTxtEditor,
						fileDat.finalPath,
						fileDat.fileName,
						".jsx"
					);
					await help.formatDocument(jsxPath);
				} catch (err) {
					await vscode.window.showErrorMessage("Something went wrong :(");
				}
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
