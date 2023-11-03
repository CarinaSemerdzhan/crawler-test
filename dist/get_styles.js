import path from "path";
import fetch from "node-fetch";
import { parse } from "css";
import { checkUrl } from "./utils.js";

export const getStyles = async (document, uri) => {
    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    const fonts = [];
    const colors = [];

    if (linkElements.length > 0) {
        for (const linkElement of linkElements) {
            const href = linkElement.getAttribute('href');
            // Read the CSS file
            const response = await fetch(checkUrl(href, uri));

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }

            const cssContent = await response.text();
            const parsedCSS = parse(cssContent);
            const fontFaceRules = parsedCSS.stylesheet.rules.filter(rule => rule.type === 'font-face');

            fontFaceRules.forEach(rule => {
                fonts.push(rule.declarations.find(declaration => declaration.property === 'font-family').value);
            });

            parsedCSS.stylesheet.rules.forEach(rule => {
                if (rule.type === 'rule') {
                    rule.declarations.forEach(declaration => {
                        if (fontFaceRules.length === 0 && declaration.property === 'font') {
                            fonts.push(declaration.value);
                        }
                        if (declaration.property === 'color') {
                            colors.push(declaration.value);
                        }
                    });
                }
            });
        }
    }

    return {
        mainFont: countOccurrence(fonts),
        mainColor: countOccurrence(colors)
    }
}

const countOccurrence = (occurrences) => {
    const counts = {};
    let mostCommon = null;
    let maxCount = 0;

    for (const occurrence of occurrences) {
        counts[occurrence] = (counts[occurrence] || 0) + 1;
    }

    for (const count in counts) {
        if (counts[count] > maxCount) {
            mostCommon = count;
            maxCount = counts[count];
        }
    }

    return mostCommon;
}
