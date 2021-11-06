const vscode = require("vscode");

/**
 * Capitalizes the first character of a string
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * @param {vscode.TextEditor} activeTxtEditor
 * @returns {Promise<boolean>}
 */
const checkFile = async (activeTxtEditor) => {
	return new Promise((resolve, reject) => {
		// Check if there is open text editor
		if (!activeTxtEditor) {
			vscode.window.showErrorMessage("Open a svg file to convert to JSX/TSX!");
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

const formatDocument = async (jsxPath) => {
	const uri = vscode.Uri.file(jsxPath);
	await vscode.commands.executeCommand("vscode.open", uri);
	await vscode.commands.executeCommand("editor.action.formatDocument");
	await vscode.commands.executeCommand("workbench.action.files.save");
};

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

module.exports = {
	capitalize,
	checkFile,
	formatDocument,
	addJSX,
};
