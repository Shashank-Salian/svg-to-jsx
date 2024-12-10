/**
 *
 * @param {string} componentName
 * @param {string} jsx
 */
function embedJsxTemplate(componentName, jsx) {
  jsx = jsx.replace(/(?<=<svg[^>]*)>/g, " {...props}>");

  return `const ${componentName} = ({ className, ...props }) => {
    return (
        ${jsx}
    );
}

export default ${componentName}
`;
}

/**
 *
 * @param {string} componentName
 * @param {string} jsx
 */
function embedTsxTemplate(componentName, jsx) {
  jsx = jsx.replace(/(?<=<svg[^>]*)>/g, " {...props}>");

  return `type Props = {
	className?: string;
};

const ${componentName} = ({ className, ...props }: Props) => {
    return (
        ${jsx}
    );
}

export default ${componentName}
`;
}

module.exports = {
  embedJsxTemplate,
  embedTsxTemplate,
};
