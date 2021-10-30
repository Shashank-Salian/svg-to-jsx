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
	/**
	 * Creats and returns a boiler template code for react arrow functional component returning JSX
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
	 * Convert the SVG to JSX/TSX
	 * Creates a new .jsx or .tsx file with the same name as the SVG's and
	 * creates a boiler plate code for basic arrow functional component with the SVG as JSX
	 *
	 * @param {vscode.TextEditor} activeTxtEditor
	 * @param {string} ext
	 * @returns {Promise<string>}
	 */
	const convert = async (activeTxtEditor, ext) => {
		return new Promise(async (resolve, reject) => {
			const filePath = activeTxtEditor.document.uri.fsPath;
			const fileContent = activeTxtEditor.document.getText();

			try {
				const jsx = await svgtojsx(fileContent);

				let finalPath = "",
					pa = [],
					fileName = "";

				// Get the file name and replace the extentions as specified in the arguement,
				// for windows and UNIX like systems
				if (process.platform === "win32") {
					pa = filePath.split("\\");
					fileName = `${pa.pop().split(".")[0].replace(/\s/g, "")}${ext}`;
					fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
					finalPath = path.join(...pa, fileName);
				} else {
					pa = filePath.split("/");
					fileName = `${pa.pop().split(".")[0].replace(/\s/g, "")}${ext}`;
					fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
					finalPath = path.join("/", ...pa, fileName);
				}

				const wstream = fs.createWriteStream(`${finalPath}`);
				wstream.write(addJSX(jsx, fileName, ext === ".tsx"), (err) => {
					if (err) {
						console.log(err);
						reject("ERROR");
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
				reject(err);
			}
		});
	};

	/**
	 * @param {vscode.TextEditor} activeTxtEditor
	 * @returns {Promise<boolean>}
	 */
	const checkFile = async (activeTxtEditor) => {
		return new Promise((resolve, reject) => {
			// Check if there is open text editor
			if (!activeTxtEditor) {
				vscode.window.showErrorMessage(
					"Open a svg file to convert to JSX/TSX!"
				);
				resolve(false);
			}
			// If the file isn't .svg show warning!
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

				try {
					const goAhead = await checkFile(activeTxtEditor);

					if (!goAhead) {
						return;
					}

					const jsxPath = await convert(activeTxtEditor, ".tsx");
					const uri = vscode.Uri.file(jsxPath);
					await vscode.commands.executeCommand("vscode.open", uri);
					await vscode.commands.executeCommand("editor.action.formatDocument");
					await vscode.commands.executeCommand("workbench.action.files.save");
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
					const goAhead = await checkFile(activeTxtEditor);

					if (!goAhead) {
						return;
					}

					const jsxPath = await convert(activeTxtEditor, ".jsx");
					const uri = vscode.Uri.file(jsxPath);
					await vscode.commands.executeCommand("vscode.open", uri);
					await vscode.commands.executeCommand("editor.action.formatDocument");
					await vscode.commands.executeCommand("workbench.action.files.save");
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
