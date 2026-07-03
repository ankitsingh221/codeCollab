export const EXECUTABLE_LANGUAGES = new Set([
  'python',
  'javascript',
  'typescript',
  'cpp',
  'c',
  'java',
  'go',
  'rust',
  'php',
  'ruby',
  'shell',
]);

export const isExecutable = (language) => EXECUTABLE_LANGUAGES.has(language);

// Web languages get the iframe live-preview instead of Run
export const isPreviewLanguage = (language) =>
  ['html', 'css', 'javascript'].includes(language);