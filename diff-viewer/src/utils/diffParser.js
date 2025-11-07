// diff-viewer/src/utils/diffParser.js

export function parseDiffLines(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result = [];
  
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      result.push({
        type: 'add',
        oldLineNum: null,
        newLineNum: newIndex + 1,
        content: newLines[newIndex]
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      result.push({
        type: 'remove',
        oldLineNum: oldIndex + 1,
        newLineNum: null,
        content: oldLines[oldIndex]
      });
      oldIndex++;
    } else if (oldLines[oldIndex] === newLines[newIndex]) {
      result.push({
        type: 'normal',
        oldLineNum: oldIndex + 1,
        newLineNum: newIndex + 1,
        content: oldLines[oldIndex]
      });
      oldIndex++;
      newIndex++;
    } else {
      // Look ahead to see if we can find a match
      const oldMatch = newLines.slice(newIndex).findIndex(l => l === oldLines[oldIndex]);
      const newMatch = oldLines.slice(oldIndex).findIndex(l => l === newLines[newIndex]);
      
      if (oldMatch !== -1 && (newMatch === -1 || oldMatch < newMatch)) {
        // Lines were added
        for (let i = 0; i < oldMatch; i++) {
          result.push({
            type: 'add',
            oldLineNum: null,
            newLineNum: newIndex + 1,
            content: newLines[newIndex]
          });
          newIndex++;
        }
      } else if (newMatch !== -1) {
        // Lines were removed
        for (let i = 0; i < newMatch; i++) {
          result.push({
            type: 'remove',
            oldLineNum: oldIndex + 1,
            newLineNum: null,
            content: oldLines[oldIndex]
          });
          oldIndex++;
        }
      } else {
        // Lines were modified
        result.push({
          type: 'remove',
          oldLineNum: oldIndex + 1,
          newLineNum: null,
          content: oldLines[oldIndex]
        });
        result.push({
          type: 'add',
          oldLineNum: null,
          newLineNum: newIndex + 1,
          content: newLines[newIndex]
        });
        oldIndex++;
        newIndex++;
      }
    }
  }
  
  return result;
}

export function getDiffStats(diff) {
  const stats = {
    additions: 0,
    deletions: 0,
    changes: 0
  };
  
  Object.values(diff).forEach(fileDiff => {
    const lines = parseDiffLines(fileDiff.oldContent, fileDiff.newContent);
    stats.additions += lines.filter(l => l.type === 'add').length;
    stats.deletions += lines.filter(l => l.type === 'remove').length;
  });
  
  stats.changes = Object.keys(diff).length;
  
  return stats;
}

export function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function getLanguageFromFilename(filename) {
  const extension = getFileExtension(filename);
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    xml: 'xml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml'
  };
  
  return languageMap[extension] || 'text';
}