export const LANGUAGE_MAP = {
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  cpp: 'cpp',
  cc: 'cpp',
  c: 'c',
  h: 'cpp',
  hpp: 'cpp',
  java: 'java',
  json: 'json',
  md: 'markdown',
  txt: 'plaintext',
  go: 'go',
  rs: 'rust',
  php: 'php',
  rb: 'ruby',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  sh: 'shell',
};

export const getLanguageFromFilename = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return LANGUAGE_MAP[ext] || 'plaintext';
};

// Color + label used for file icons in the sidebar
export const LANGUAGE_META = {
  html: { color: '#e34c26', label: 'HTML' },
  css: { color: '#264de4', label: 'CSS' },
  scss: { color: '#c6538c', label: 'SCSS' },
  javascript: { color: '#f0db4f', label: 'JS' },
  typescript: { color: '#3178c6', label: 'TS' },
  python: { color: '#3572A5', label: 'PY' },
  cpp: { color: '#f34b7d', label: 'C++' },
  c: { color: '#555555', label: 'C' },
  java: { color: '#b07219', label: 'JAVA' },
  json: { color: '#cbcb41', label: 'JSON' },
  markdown: { color: '#ffffff', label: 'MD' },
  plaintext: { color: '#888888', label: 'TXT' },
  go: { color: '#00ADD8', label: 'GO' },
  rust: { color: '#dea584', label: 'RS' },
  php: { color: '#4F5D95', label: 'PHP' },
  ruby: { color: '#701516', label: 'RB' },
  sql: { color: '#e38c00', label: 'SQL' },
  yaml: { color: '#cb171e', label: 'YAML' },
  xml: { color: '#0060ac', label: 'XML' },
  shell: { color: '#89e051', label: 'SH' },
};