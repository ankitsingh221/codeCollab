// Judge0 CE language IDs — https://github.com/judge0/judge0/blob/master/docs/api/languages.md
export const JUDGE0_LANGUAGE_MAP = {
  python: 71,       // Python 3.8.1
  javascript: 63,    // Node.js 12.14.0
  typescript: 74,    // TypeScript 3.7.4
  cpp: 54,           // C++ (GCC 9.2.0)
  c: 50,             // C (GCC 9.2.0)
  java: 62,          // Java (OpenJDK 13.0.1)
  go: 60,            // Go 1.13.5
  rust: 73,          // Rust 1.40.0
  php: 68,           // PHP 7.4.1
  ruby: 72,          // Ruby 2.7.0
  shell: 46,         // Bash 5.0.0
};

export const isExecutable = (language) =>
  Object.prototype.hasOwnProperty.call(JUDGE0_LANGUAGE_MAP, language);