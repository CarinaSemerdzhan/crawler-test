import url from 'url';

export const checkUrl = (src, uri) => {
    const isAbsoluteURL = (src) => {
        const parsedUrl = url.parse(src);
        return parsedUrl.protocol === 'http:' ||
            parsedUrl.protocol === 'https:' ||
            parsedUrl.href.startsWith('data:image');
    }
    return isAbsoluteURL(src) ? src : `${uri.protocol}//${uri.host}/${src}`;
}