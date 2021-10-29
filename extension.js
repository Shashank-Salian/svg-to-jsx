// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const svgtojsx = require("svg-to-jsx");
const fs = require("fs");
const path = require("path");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "svg-to-jsx" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	// context.subscriptions.push(
	// 	vscode.commands.registerCommand("svg-to-jsx.helloWorld", function () {
	// 		// The code you place here will be executed every time your command is executed

	// 		// Display a message box to the user
	// 		vscode.window.showInformationMessage("Hello World from SVG to JSX!");
	// 	})
	// );

	/**
	 *
	 * @param {string} jsx
	 * @param {string} fileName
	 * @param {boolean} isTs
	 * @returns {string}
	 */
	const addJSX = (jsx, fileName, isTs = false) => {
		const name = (fileName.charAt(0).toUpperCase() + fileName.slice(1)).split(
			"."
		)[0];
		return isTs
			? `import React from 'react';\n\ninterface Props {\n\tclassName?: string;\n}\n\nconst ${name} = (props: Props) => {\n\treturn (\n\t\t${jsx}\n\t)\n}\n\nexport default ${name}\n`
			: `import React from 'react';\n\nconst ${name} = (props) => {\n\treturn (\n\t\t${jsx}\n\t)\n}\n\nexport default ${name}\n`;
	};

	/**
	 * @param {vscode.TextEditor} activeTxtEditor
	 * @param {string} ext
	 */
	const convert = async (activeTxtEditor, ext) => {
		return new Promise(async (resolve, reject) => {
			const filePath = activeTxtEditor.document.uri.fsPath;
			const fileContent = activeTxtEditor.document.getText();

			try {
				const jsx = await svgtojsx(fileContent);

				const pa = filePath.split("/");
				const fileName = `${pa.pop().split(".")[0].replaceAll(" ", "")}${ext}`;
				const finalPath = path.join("/", ...pa, fileName);
				console.log(finalPath);
				const wstream = fs.createWriteStream(`${finalPath}`);
				wstream.write(addJSX(jsx, fileName, ext === ".tsx"), (err) => {
					if (err) {
						console.log(err);
						vscode.window.showErrorMessage("Something went wrong :(");
						resolve();
					}
					vscode.commands
						.executeCommand("workbench.action.closeActiveEditor")
						.then(() => {
							fs.unlinkSync(filePath);
							wstream.close();
							resolve(finalPath);
						});
				});
			} catch (err) {
				console.log(err);
				vscode.window.showErrorMessage("Make sure you have valid svg markup.");
				resolve(err);
			}
		});
	};

	/**
	 * @param {vscode.TextEditor} activeTxtEditor
	 * @returns {Promise<boolean>}
	 */
	const checkFile = async (activeTxtEditor) => {
		return new Promise((resolve, reject) => {
			if (!activeTxtEditor) {
				vscode.window.showErrorMessage(
					"Open a svg file to convert to JSX/TSX!"
				);
				resolve(false);
			}
			console.log(activeTxtEditor.document.uri.fsPath);
			if (!activeTxtEditor.document.uri.fsPath.endsWith(".svg")) {
				vscode.window
					.showWarningMessage(
						"Open a svg file to convert to JSX. Override ?",
						"Yes",
						"No"
					)
					.then((value) => {
						if (value === "Yes") {
							resolve(true);
						}
						resolve(false);
					});
			} else {
				resolve(true);
			}
		});
	};

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"svg-to-jsx.converttotsx",
			async function () {
				const activeTxtEditor = vscode.window.activeTextEditor;

				const goAhead = await checkFile(activeTxtEditor);

				if (!goAhead) {
					return;
				}

				const jsxPath = await convert(activeTxtEditor, ".tsx");
				const uri = vscode.Uri.parse(jsxPath);
				await vscode.commands.executeCommand("vscode.open", uri);
				await vscode.commands.executeCommand("editor.action.formatDocument");
				await vscode.commands.executeCommand("workbench.action.files.save");
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"svg-to-jsx.converttojsx",
			async function () {
				const activeTxtEditor = vscode.window.activeTextEditor;

				const goAhead = await checkFile(activeTxtEditor);

				if (!goAhead) {
					return;
				}

				console.log(activeTxtEditor.document.uri.fsPath);

				const jsxPath = await convert(activeTxtEditor, ".jsx");
				const uri = vscode.Uri.parse(jsxPath);
				await vscode.commands.executeCommand("vscode.open", uri);
				await vscode.commands.executeCommand("editor.action.formatDocument");
				await vscode.commands.executeCommand("workbench.action.files.save");
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
