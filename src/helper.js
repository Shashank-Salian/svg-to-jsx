const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

/**
 * Capitalizes the first character of a string
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * This function will check for existance of file in the directory
 * in which it will write out the JSX or TSX template
 *
 * @param {string} finalPath // Full path of the JSX or TSX file
 * @param {string} fileName // File name of the JSX or TSX file
 * @param {number} i // Number suffix at the end of the file name
 * @returns {{ fileName: string, finalPath: string }}
 */
const renameFileTo = (finalPath, fileName, i = 0) => {
	const fa = fileName.split(".");
	const newFileName = `${fa[0]}${i ? i : ""}.${fa[fa.length - 1]}`;

	let newPath = "";
	if (process.platform === "win32") {
		const pa = finalPath.split("\\");
		pa.pop();
		newPath = `${pa.join("\\")}\\${newFileName}`;
	} else {
		const pa = finalPath.split("/");
		pa.pop();
		newPath = `${pa.join("/")}/${newFileName}`;
	}

	return fs.existsSync(newPath)
		? renameFileTo(finalPath, fileName, ++i)
		: { finalPath: newPath, fileName: newFileName };
};

/**
 * Check if the file is SVG, if not warn the user.
 * Also check for same file name existance
 *
 * @param {vscode.TextEditor} activeTxtEditor
 * @param {".jsx" | ".tsx"} ext
 * @returns {Promise<{ fileName: string, finalPath: string } | null>}
 */
const checkFile = async (activeTxtEditor, ext) => {
	return new Promise((resolve, reject) => {
		// Check if there is open text editor
		if (!activeTxtEditor) {
			vscode.window.showErrorMessage("Open a svg file to convert to JSX/TSX!");
			resolve(null);
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
						// Convert SVG file to TSX or JSX
						const { finalPath, fileName } = formatPath(
							activeTxtEditor.document.uri.fsPath,
							ext
						);
						// Check if the file already exist and rename if required
						const finalFileName = renameFileTo(finalPath, fileName);
						resolve(finalFileName);
					}
					resolve(null);
				});
		} else {
			// Convert SVG file to TSX or JSX
			const { finalPath, fileName } = formatPath(
				activeTxtEditor.document.uri.fsPath,
				ext
			);
			// Check if the file already exist and rename if required
			const finalFileName = renameFileTo(finalPath, fileName);
			resolve(finalFileName);
		}
	});
};

/**
 * @param {string} jsxPath
 */
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

/**
 * Convert SVG file path to JSX or TSX file path
 * and return full file path and file name in an object
 *
 * @param {string} filePath
 * @param {".jsx" | ".tsx"} ext
 * @returns {{ fileName: string, finalPath: string }}
 */
const formatPath = (filePath, ext) => {
	// Get the file name and replace the extentions as specified in the arguement,
	// for windows and UNIX like systems
	const pa =
		process.platform === "win32" ? filePath.split("\\") : filePath.split("/");

	// Remove all the spaces from File name
	let fileName = `${pa.pop().split(".")[0].replace(/\s/g, "")}`;

	// convert to PascalCase
	fileName = fileName.includes("-")
		? `${fileName
				.split("-")
				.reduce(
					(prev, curr) => `${capitalize(prev)}${capitalize(curr)}`
				)}${ext}`
		: `${capitalize(fileName)}${ext}`;

	return {
		finalPath: `${process.platform !== "win32" ? "/" : ""}${path.join(
			...pa,
			fileName
		)}`,
		fileName,
	};
};

module.exports = {
	capitalize,
	checkFile,
	formatDocument,
	addJSX,
	formatPath,
};
