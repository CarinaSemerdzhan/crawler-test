export const getTexts = (window, document) => {
    const textElements = [];

    // Recursively traverse the DOM to find text nodes
    const traverse = (node) => {
        if (node.nodeType === window.Node.TEXT_NODE) {
            textElements.push(node.textContent.trim());
        } else if (node.nodeType === window.Node.ELEMENT_NODE) {
            for (let i = 0; i < node.childNodes.length; i++) {
                traverse(node.childNodes[i]);
            }
        }
    }

    traverse(document.body);

    return textElements.filter(textElement => textElement !== '');
}