// Judge0 CE language IDs — https://github.com/judge0/judge0/blob/master/docs/api/languages.md
export const JUDGE0_LANGUAGE_MAP = {
  python: 71,       
  javascript: 63,    
  typescript: 74,   
  cpp: 54,          
  c: 50,             
  java: 62,         
  go: 60,           
  rust: 73,        
  php: 68,         
  ruby: 72,       
  shell: 46,         
};

export const isExecutable = (language) =>
  Object.prototype.hasOwnProperty.call(JUDGE0_LANGUAGE_MAP, language);