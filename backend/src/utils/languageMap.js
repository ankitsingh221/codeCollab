export const LANGUAGE_MAP = {
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  cpp: "cpp",
  cc: "cpp",
  c: "c",
  h: "cpp",
  hpp: "cpp",
  java: "java",
  json: "json",
  md: "markdown",
  txt: "plaintext",
  go: "go",
  rs: "rust",
  php: "php",
  rb: "ruby",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  sh: "shell",
};

export const getLanguageFromFilename = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return LANGUAGE_MAP[ext] || "plaintext";
};

export const DEFAULT_BOILERPLATE = {
  html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>",
  css: "body {\n  \n}",
  javascript: "// Your code here\n",
  python: "# Your code here\n",
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  java: "public class Main {\n    public static void main(String[] args) {\n        \n    }\n}",
};