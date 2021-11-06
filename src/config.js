const vscode = require("vscode");

/**
 * @param {string} setting
 * @returns {any}
 */
const getConfig = (setting) => {
	return vscode.workspace.getConfiguration("svg-to-jsx.settings").get(setting);
};

module.exports = getConfig;
