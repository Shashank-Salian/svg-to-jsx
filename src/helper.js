const vscode = require("vscode");
const templates = require("./templates");

/**
 * Capitalizes the first character of a string
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if the file exists
 * @param {vscode.Uri} uri
 */
async function fileExists(uri) {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Returns a distinct URI path for the JSX or TSX file
 * Expects that it has been converted to JSX or TSX
 * @param {vscode.Uri} uri
 */
async function getDistinctUri(uri, num = 1) {
  if (!(await fileExists(uri))) return uri;

  const newUriPathArr = uri.toString(true).split("/");
  let [fileName, ext] = newUriPathArr.pop().split(".");

  fileName = fileName.replace(/\d+/, "");
  const newPath = vscode.Uri.parse(
    newUriPathArr.join("/") + `/${fileName}${num}.${ext}`
  );
  return getDistinctUri(newPath, num + 1);
}

/**
 *
 * @param {vscode.Uri} uri
 * @param {".jsx" | ".tsx"} ext
 */
async function createJsxFile(uri, ext) {
  // Convert SVG file name to TSX or JSX
  const newUriPathArr = uri.toString(true).split("/");
  const fileName = newUriPathArr.pop();
  const newFileName = formatFileName(fileName, ext);

  const newUriPath = newUriPathArr.join("/") + `/${newFileName}`;

  const newPath = vscode.Uri.parse(newUriPath);
  // Check if the file already exist and rename if required
  return await getDistinctUri(newPath);
}

/**
 * Check if the file is SVG, if not warn the user.
 * Also check for same file name existance
 *
 * @param {vscode.TextEditor} activeTxtEditor
 * @param {".jsx" | ".tsx"} ext
 * @returns {Promise<vscode.Uri | null>}
 */
function prepareFiles(activeTxtEditor, ext) {
  return new Promise(async (resolve, reject) => {
    // Check if there is open text editor
    if (!activeTxtEditor) {
      vscode.window.showErrorMessage("Open a svg file to convert to JSX/TSX!");
      resolve(null);
    }

    const fileName = activeTxtEditor.document.fileName;
    // If the file isn't .svg show warning!
    if (!fileName.endsWith(".svg")) {
      const response = await vscode.window.showWarningMessage(
        "You have not currently opened a SVG file, do you want to continue ?",
        "Yes",
        "No"
      );
      if (response === "No") {
        resolve(null);
        return;
      }
    }
    // Convert SVG URI to JSX or TSX file path
    const finalUri = await createJsxFile(activeTxtEditor.document.uri, ext);
    resolve(finalUri);
  });
}

/**
 * Executes the default format command and saves the file
 * @param {vscode.Uri} uri
 */
async function formatDocument(uri) {
  await vscode.commands.executeCommand("vscode.open", uri);
  await vscode.commands.executeCommand("editor.action.formatDocument");
  await vscode.commands.executeCommand("workbench.action.files.save");
}

/**
 * Creates and returns a boiler template code for react arrow functional component returning JSX
 *
 * @param {string} jsx
 * @param {string} fileName
 * @param {boolean} isTs
 * @returns {string}
 */
function addJSX(jsx, fileName, isTs = false) {
  const componentName = fileName.split(".")[0];

  return isTs
    ? templates.embedTsxTemplate(componentName, jsx)
    : templates.embedJsxTemplate(componentName, jsx);
}

/**
 * Convert SVG file path to JSX or TSX file path
 * and return full file path and file name in an object
 *
 * @param {string} fileName
 * @param {".jsx" | ".tsx"} ext
 * @returns {string}
 */
function formatFileName(fileName, ext) {
  if (fileName.length > 100) {
    vscode.window.showWarningMessage("File name is too long! Truncating...");
    fileName = fileName.substring(0, 20) + ext;
  }

  //   Remove extension
  fileName = fileName.replace(/(\.[^.]+)$/gi, "");
  fileName = fileName.replace(/[^\w\s\.\-_]/g, "");

  // convert to Capital Case
  fileName = capitalize(fileName);

  fileName = fileName
    .split(" ")
    .reduce((prev, curr) => `${capitalize(prev)}${capitalize(curr)}`)
    .split("-")
    .reduce((prev, curr) => `${capitalize(prev)}${capitalize(curr)}`)
    .split("_")
    .reduce((prev, curr) => `${capitalize(prev)}${capitalize(curr)}`)
    .split(".")
    .reduce((prev, curr) => `${capitalize(prev)}${capitalize(curr)}`);

  return fileName + ext;
}

/**
 * Get file name with extension from URI
 * @throws {Error} If the file name is not found
 * @param {vscode.Uri} uri
 * @returns {string}
 */
function getFileName(uri) {
  const match = uri.toString().match(/[^/]+\w+$/);
  if (match) return match[0];
  throw new Error("File name not found");
}

module.exports = {
  capitalize,
  prepareFiles,
  formatDocument,
  addJSX,
  getFileName,
  formatFileName,
  getDistinctUri,
  createJsxFile,
};
