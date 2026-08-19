const TEXT_FILE_EXTENSIONS = new Set([
    'txt', 'log', 'md', 'markdown', 'rst', 'csv', 'tsv',
    'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'cnf',
    'html', 'htm', 'css', 'scss', 'sass', 'less',
    'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx',
    'py', 'pyw', 'rb', 'php', 'java', 'kt', 'kts', 'scala',
    'c', 'h', 'cpp', 'hpp', 'cc', 'cxx', 'cs', 'go', 'rs', 'swift',
    'sh', 'bash', 'zsh', 'fish', 'bat', 'cmd', 'ps1', 'psm1',
    'sql', 'graphql', 'gql', 'vue', 'svelte', 'astro',
    'dockerfile', 'makefile', 'rakefile', 'env', 'gitignore', 'dockerignore',
    'editorconfig', 'properties', 'gradle', 'sbt', 'r', 'lua', 'pl', 'pm', 'perl'
]);

const TEXT_MIME_PREFIXES = [
    'text/',
    'application/json',
    'application/xml',
    'application/javascript',
    'application/ecmascript',
    'application/x-javascript',
    'application/x-yaml'
];

const TEXT_EXTENSION_MIME_TYPES = Object.freeze({
    conf: 'text/plain', cnf: 'text/plain', config: 'text/plain', ini: 'text/plain',
    cfg: 'text/plain', properties: 'text/plain', env: 'text/plain',
    js: 'text/javascript', mjs: 'text/javascript', cjs: 'text/javascript',
    ts: 'text/typescript', jsx: 'text/jsx', tsx: 'text/tsx',
    py: 'text/x-python', java: 'text/x-java', c: 'text/x-c', cpp: 'text/x-c++',
    h: 'text/x-c', hpp: 'text/x-c++', cs: 'text/x-csharp', php: 'text/x-php',
    rb: 'text/x-ruby', go: 'text/x-go', rs: 'text/x-rust', swift: 'text/x-swift',
    kt: 'text/x-kotlin', scala: 'text/x-scala', sh: 'text/x-sh', bash: 'text/x-sh',
    zsh: 'text/x-sh', fish: 'text/x-sh', ps1: 'text/x-powershell',
    bat: 'text/x-bat', cmd: 'text/x-bat',
    html: 'text/html', htm: 'text/html', xml: 'text/xml', svg: 'image/svg+xml',
    md: 'text/markdown', markdown: 'text/markdown', rst: 'text/x-rst',
    tex: 'text/x-tex', css: 'text/css', scss: 'text/x-scss', sass: 'text/x-sass',
    less: 'text/x-less', json: 'application/json', jsonc: 'application/json',
    json5: 'application/json', yaml: 'text/yaml', yml: 'text/yaml',
    toml: 'text/x-toml', csv: 'text/csv', tsv: 'text/tab-separated-values',
    txt: 'text/plain', text: 'text/plain', log: 'text/plain', rtf: 'text/rtf',
    sql: 'text/x-sql', dockerfile: 'text/x-dockerfile', makefile: 'text/x-makefile',
    gitignore: 'text/plain', gitattributes: 'text/plain', editorconfig: 'text/plain',
    htaccess: 'text/plain', vue: 'text/x-vue', svelte: 'text/x-svelte'
});

const MIME_TYPE_REGEX = /^[a-zA-Z0-9][-a-zA-Z0-9]*\/[a-zA-Z0-9][-a-zA-Z0-9.+]*(?:;\s*charset=[a-zA-Z0-9_-]+)?$/;

function getBaseName(fileName) {
    return typeof fileName === 'string' ? fileName.toLowerCase().split('/').pop() || '' : '';
}

function getExtension(fileName) {
    const baseName = getBaseName(fileName);
    const separator = baseName.lastIndexOf('.');
    return separator === -1 ? baseName : baseName.slice(separator + 1);
}

export function isTextFile(fileName) {
    const baseName = getBaseName(fileName);
    const extension = getExtension(fileName);
    return TEXT_FILE_EXTENSIONS.has(baseName) || TEXT_FILE_EXTENSIONS.has(extension);
}

export function getMimeTypeBase(contentType) {
    return typeof contentType === 'string' ? contentType.split(';')[0].trim().toLowerCase() : '';
}

export function detectTextFileType(fileName, mimeType) {
    const extensionType = TEXT_EXTENSION_MIME_TYPES[getExtension(fileName)];
    if (extensionType) return extensionType;
    return typeof mimeType === 'string' && mimeType.startsWith('text/') ? mimeType : null;
}

export function smartContentType(contentType, fileName) {
    const detectedType = detectTextFileType(fileName, contentType);
    if (detectedType) return detectedType;
    if (getMimeTypeBase(contentType) === 'application/octet-stream' && isTextFile(fileName)) {
        return 'text/plain';
    }
    return contentType;
}

export function validateAndNormalizeContentType(contentType) {
    if (!contentType || typeof contentType !== 'string') return 'application/octet-stream';
    const normalized = contentType.trim();
    if (/[^\S\r\n]*[\r\n\0]/.test(contentType) || !MIME_TYPE_REGEX.test(normalized)) {
        return 'application/octet-stream';
    }
    return normalized;
}

export function addCharsetIfNeeded(contentType) {
    if (!contentType || /charset\s*=/i.test(contentType)) return contentType;
    const baseType = getMimeTypeBase(contentType);
    if (TEXT_MIME_PREFIXES.some(prefix => baseType.startsWith(prefix))) {
        return `${contentType}; charset=utf-8`;
    }
    return contentType;
}
