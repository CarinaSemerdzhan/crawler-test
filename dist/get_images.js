import imageSize from 'image-size';
import * as https from 'https';
import { checkUrl } from './utils.js';

export const getImages = async (window, document, uri) => {
    const imageURLs = findImages(document, uri);
    const imagesInfos = await getImagesInfo(imageURLs);

    return imagesInfos.filter(info => info.width >= 994 && info.height >= 600);
}

export const getLogos = async (document, uri) => {
    const logosURLs = findLogos(document, uri);
    const logosInfos = await getImagesInfo(logosURLs);

    return logosInfos.filter(info => info.width >= 100 && info.hasTransparentBackground);
}

const findImages = (document, uri) => {
    const selectedElements = [];

    const selectElementsWithBackgroundImage = (element, selectedElements) => {
        const style = element.getAttribute('style');
        const tag = element.tagName.toLowerCase();

        if (style) {
            const matches = style.match(/url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i);

            if (matches && matches[1]) {
                selectedElements.push(checkUrl(matches[1], uri));
            }
        }

        if (tag === 'img') {
            selectedElements.push(checkUrl(element.getAttribute('src'), uri));
        }

        for (const childElement of element.children) {
            selectElementsWithBackgroundImage(childElement, selectedElements);
        }
    }

    selectElementsWithBackgroundImage(document.documentElement, selectedElements);

    return selectedElements;
}

const findLogos = (document, uri) => {
    const logosSrc = [];

    // Modify this selector based on how logos are structured in the CSS
    const logoElements = document.body.querySelectorAll("img[src*='logo'], [class*='logo'], [id*='logo'], [style*='background-image']");

    if (logoElements.length > 0) {
        logoElements.forEach((logoElement) => {
            const style = logoElement.getAttribute('style');
            const tag = logoElement.tagName

            if (tag === "IMG") {
                logosSrc.push(checkUrl(logoElement.getAttribute("src"), uri));
            } else if (style) {
                // Handle elements with background-image differently
                const style = logoElement.getAttribute('style');
                const matches = style.match(/url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i);

                if (matches && matches[1]) {
                    logosSrc.push(checkUrl(matches[1], uri));
                }
            }
        });
    }

    return logosSrc;
}

const getImagesInfo = (imageURLs) => {
    const validURLs = imageURLs.filter((url) => !url.startsWith('https://track.adform.net/Serving/TrackPoint/'));
    const promises = validURLs.map((imageURL) => {
        return new Promise((resolve, reject) => {
            if (imageURL.startsWith('http')) {
                // Handle URL
                https.get(imageURL, (response) => {
                    const chunks = [];

                    response.on('data', (chunk) => {
                        chunks.push(chunk);
                    });

                    response.on('end', () => {
                        // Combine the received chunks into a single buffer
                        const imageBuffer = Buffer.concat(chunks);

                        // Check if the buffer is empty
                        if (imageBuffer.length === 0) {
                            reject('Empty image file');
                        } else {
                            processImage(imageBuffer, imageURL);
                        }
                    });
                }).on('error', (error) => {
                    reject('Error fetching image: ' + error.message);
                });
            } else if (imageURL.startsWith('data:image')) {
                // Handle base64-encoded image
                const base64Data = imageURL.split(',')[1];
                if (!base64Data) {
                    reject('Invalid base64 data');
                } else {
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    processImage(imageBuffer, imageURL);
                }
            } else {
                // Handle unsupported image sources
                reject('Unsupported image source: ' + imageURL);
            }

            function processImage (buffer, source) {
                const dimensions = imageSize(buffer);
                const { width, height } = dimensions;

                // Determine if the image itself has a transparent background
                const hasTransparentBackground = checkTransparentBackground(buffer, width, height);

                resolve({ ...dimensions, hasTransparentBackground, source });
            }
        });
    });

    return Promise.all(promises);
};

const checkTransparentBackground = (buffer, width, height) => {
    /* To determine if the image itself has a transparent background,
    we can examine the alpha value of the pixels along the edges of the image.
    If any edge pixel has an alpha value less than 255 (not fully opaque),
    it indicates that the image may have a transparent background. */

    const edgeAlphaValues = [];

    // Top edge
    for (let i = 3; i < width * 4; i += 4) {
        edgeAlphaValues.push(buffer[i]);
    }

    // Bottom edge
    for (let i = (height - 1) * width * 4 + 3; i < height * width * 4; i += 4) {
        edgeAlphaValues.push(buffer[i]);
    }

    // Left edge
    for (let i = width * 4; i < height * width * 4; i += width * 4) {
        edgeAlphaValues.push(buffer[i]);
    }

    // Right edge
    for (let i = (width - 1) * 4; i < height * width * 4; i += width * 4) {
        edgeAlphaValues.push(buffer[i]);
    }

    // Check if any edge pixel has an alpha value less than 255 (not fully opaque)
    return edgeAlphaValues.some((alpha) => alpha < 255);
}