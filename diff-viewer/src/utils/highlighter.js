// diff-viewer/src/utils/highlighter.js

/**
 * Syntax highlighter without external dependencies
 * Supports multiple languages with keyword, string, comment, and number detection
 */

// Language definitions
const LANGUAGES = {
  javascript: {
    keywords: [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch',
      'throw', 'finally', 'class', 'extends', 'import', 'export', 'from', 'as',
      'async', 'await', 'new', 'this', 'super', 'static', 'get', 'set',
      'typeof', 'instanceof', 'in', 'of', 'void', 'delete', 'yield', 'with'
    ],
    builtins: [
      'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON',
      'Promise', 'Set', 'Map', 'Symbol', 'Error', 'RegExp', 'console', 'window',
      'document', 'undefined', 'null', 'true', 'false', 'NaN', 'Infinity'
    ],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringChars: ['"', "'", '`']
  },
  
  typescript: {
    keywords: [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch',
      'throw', 'finally', 'class', 'extends', 'import', 'export', 'from', 'as',
      'async', 'await', 'new', 'this', 'super', 'static', 'get', 'set',
      'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract',
      'implements', 'private', 'public', 'protected', 'readonly', 'any', 'never',
      'unknown', 'void', 'string', 'number', 'boolean'
    ],
    builtins: [
      'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON',
      'Promise', 'Set', 'Map', 'Symbol', 'Error', 'RegExp', 'console'
    ],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringChars: ['"', "'", '`']
  },
  
  python: {
    keywords: [
      'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'in',
      'is', 'not', 'and', 'or', 'True', 'False', 'None', 'try', 'except',
      'finally', 'raise', 'with', 'as', 'import', 'from', 'pass', 'break',
      'continue', 'lambda', 'yield', 'assert', 'del', 'global', 'nonlocal',
      'async', 'await'
    ],
    builtins: [
      'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set',
      'tuple', 'bool', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr',
      'enumerate', 'zip', 'map', 'filter', 'sorted', 'sum', 'min', 'max', 'abs'
    ],
    commentSingle: '#',
    stringChars: ['"', "'"]
  },
  
  java: {
    keywords: [
      'public', 'private', 'protected', 'static', 'final', 'abstract', 'class',
      'interface', 'extends', 'implements', 'return', 'if', 'else', 'for',
      'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'try',
      'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'void',
      'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short',
      'String', 'true', 'false', 'null', 'package', 'import'
    ],
    builtins: [
      'System', 'String', 'Integer', 'Double', 'Boolean', 'Math', 'Object',
      'ArrayList', 'HashMap', 'List', 'Map', 'Set'
    ],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringChars: ['"']
  },
  
  html: {
    keywords: [],
    builtins: [],
    commentMultiStart: '<!--',
    commentMultiEnd: '-->',
    stringChars: ['"', "'"]
  },
  
  css: {
    keywords: [],
    builtins: [
      'display', 'position', 'width', 'height', 'margin', 'padding', 'border',
      'color', 'background', 'font', 'flex', 'grid', 'absolute', 'relative',
      'fixed', 'static', 'sticky'
    ],
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringChars: ['"', "'"]
  }
};

/**
 * Detect language from filename
 */
export function detectLanguage(filename) {
  if (!filename) return 'text';
  
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const extensionMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    json: 'json',
    xml: 'xml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    yml: 'yaml',
    yaml: 'yaml'
  };
  
  return extensionMap[ext] || 'text';
}

/**
 * Get language icon emoji
 */
export function getLanguageIcon(language) {
  const icons = {
    javascript: '📜',
    typescript: '📘',
    python: '🐍',
    java: '☕',
    cpp: '⚙️',
    c: '⚙️',
    html: '🌐',
    css: '🎨',
    json: '📋',
    markdown: '📝',
    bash: '💻',
    sql: '🗃️',
    yaml: '⚙️',
    text: '📄'
  };
  
  return icons[language] || '📄';
}

/**
 * Tokenize code into basic tokens
 */
function tokenize(code, language) {
  const lang = LANGUAGES[language] || LANGUAGES.javascript;
  const tokens = [];
  let i = 0;
  
  while (i < code.length) {
    let matched = false;
    
    // Check for multi-line comment start
    if (lang.commentMultiStart && code.substr(i, lang.commentMultiStart.length) === lang.commentMultiStart) {
      const endIndex = code.indexOf(lang.commentMultiEnd, i + lang.commentMultiStart.length);
      if (endIndex !== -1) {
        tokens.push({
          type: 'comment',
          value: code.substring(i, endIndex + lang.commentMultiEnd.length)
        });
        i = endIndex + lang.commentMultiEnd.length;
        matched = true;
      }
    }
    
    // Check for single-line comment
    if (!matched && lang.commentSingle && code.substr(i, lang.commentSingle.length) === lang.commentSingle) {
      const endIndex = code.indexOf('\n', i);
      tokens.push({
        type: 'comment',
        value: code.substring(i, endIndex === -1 ? code.length : endIndex)
      });
      i = endIndex === -1 ? code.length : endIndex;
      matched = true;
    }
    
    // Check for strings
    if (!matched && lang.stringChars) {
      for (const quote of lang.stringChars) {
        if (code[i] === quote) {
          let j = i + 1;
          let escaped = false;
          
          while (j < code.length) {
            if (code[j] === '\\' && !escaped) {
              escaped = true;
            } else if (code[j] === quote && !escaped) {
              break;
            } else {
              escaped = false;
            }
            j++;
          }
          
          tokens.push({
            type: 'string',
            value: code.substring(i, j + 1)
          });
          i = j + 1;
          matched = true;
          break;
        }
      }
    }
    
    // Check for numbers
    if (!matched && /\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) {
        j++;
      }
      tokens.push({
        type: 'number',
        value: code.substring(i, j)
      });
      i = j;
      matched = true;
    }
    
    // Check for words (keywords, builtins, identifiers)
    if (!matched && /[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
        j++;
      }
      const word = code.substring(i, j);
      
      let type = 'identifier';
      if (lang.keywords && lang.keywords.includes(word)) {
        type = 'keyword';
      } else if (lang.builtins && lang.builtins.includes(word)) {
        type = 'builtin';
      }
      
      tokens.push({ type, value: word });
      i = j;
      matched = true;
    }
    
    // Other characters (operators, punctuation, whitespace)
    if (!matched) {
      tokens.push({
        type: 'other',
        value: code[i]
      });
      i++;
    }
  }
  
  return tokens;
}

/**
 * Highlight code with HTML spans for styling
 * Returns the code with <span> tags for syntax highlighting
 */
export function highlightCode(code, language = 'javascript') {
  if (!code) return '';
  
  // For unsupported languages, return as-is
  if (language === 'text' || !LANGUAGES[language]) {
    return code;
  }
  
  const tokens = tokenize(code, language);
  
  return tokens.map(token => {
    const className = `token-${token.type}`;
    return `<span class="${className}">${escapeHtml(token.value)}</span>`;
  }).join('');
}

/**
 * Get CSS classes for token types
 */
export function getTokenStyles(darkMode = true) {
  if (darkMode) {
    return {
      'token-keyword': 'color: #ff79c6;',      // Pink
      'token-string': 'color: #f1fa8c;',       // Yellow
      'token-comment': 'color: #6272a4;',      // Gray
      'token-number': 'color: #bd93f9;',       // Purple
      'token-builtin': 'color: #8be9fd;',      // Cyan
      'token-identifier': 'color: #f8f8f2;',   // White
      'token-other': 'color: #f8f8f2;'         // White
    };
  } else {
    return {
      'token-keyword': 'color: #d73a49;',      // Red
      'token-string': 'color: #032f62;',       // Dark blue
      'token-comment': 'color: #6a737d;',      // Gray
      'token-number': 'color: #005cc5;',       // Blue
      'token-builtin': 'color: #6f42c1;',      // Purple
      'token-identifier': 'color: #24292e;',   // Black
      'token-other': 'color: #24292e;'         // Black
    };
  }
}

/**
 * Classify a single token (for inline use)
 */
export function classifyToken(token, language) {
  const lang = LANGUAGES[language] || LANGUAGES.javascript;
  
  if (lang.keywords && lang.keywords.includes(token)) {
    return 'keyword';
  }
  
  if (lang.builtins && lang.builtins.includes(token)) {
    return 'builtin';
  }
  
  if (/^['"`].*['"`]$/.test(token)) {
    return 'string';
  }
  
  if (/^(\/\/|#|\/\*)/.test(token)) {
    return 'comment';
  }
  
  if (/^\d+(\.\d+)?$/.test(token)) {
    return 'number';
  }
  
  if (/^[A-Z_][A-Z0-9_]*$/.test(token)) {
    return 'constant';
  }
  
  return 'identifier';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Generate CSS for syntax highlighting
 */
export function generateHighlightCSS(darkMode = true) {
  const styles = getTokenStyles(darkMode);
  
  return Object.entries(styles)
    .map(([className, style]) => `.${className} { ${style} }`)
    .join('\n');
}