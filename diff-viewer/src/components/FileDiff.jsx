// diff-viewer/src/components/FileDiff.jsx
import React from 'react';
import * as Diff from 'diff';

export function FileDiff({ filename, diff, darkMode }) {
  const getDiffLines = () => {
    const diffResult = Diff.diffLines(diff.oldContent || '', diff.newContent || '');
    return diffResult;
  };

  const getStatusBadge = (status) => {
    const badges = {
      added: { color: 'bg-green-600', text: 'Added' },
      deleted: { color: 'bg-red-600', text: 'Deleted' },
      modified: { color: 'bg-yellow-600', text: 'Modified' }
    };
    
    const badge = badges[status] || badges.modified;
    
    return (
      <span className={`${badge.color} text-white text-xs px-2 py-1 rounded`}>
        {badge.text}
      </span>
    );
  };

  const diffLines = getDiffLines();

  return (
    <div className="p-6">
      <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className={`px-4 py-2 font-mono text-sm font-semibold flex items-center justify-between ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <span>{filename}</span>
          {getStatusBadge(diff.status)}
        </div>
        
        <div className="font-mono text-sm">
          {diffLines.map((part, i) => {
            const bgColor = part.added
              ? darkMode ? 'bg-green-900/30' : 'bg-green-100'
              : part.removed
              ? darkMode ? 'bg-red-900/30' : 'bg-red-100'
              : darkMode ? 'bg-gray-800' : 'bg-white';
            
            const textColor = part.added
              ? darkMode ? 'text-green-400' : 'text-green-700'
              : part.removed
              ? darkMode ? 'text-red-400' : 'text-red-700'
              : darkMode ? 'text-gray-300' : 'text-gray-700';
            
            const borderColor = part.added
              ? 'border-green-500'
              : part.removed
              ? 'border-red-500'
              : 'border-transparent';
            
            const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
            
            return part.value.split('\n').map((line, lineIdx) => {
              if (!line && lineIdx === part.value.split('\n').length - 1) return null;
              
              return (
                <div
                  key={`${i}-${lineIdx}`}
                  className={`${bgColor} ${textColor} px-4 py-1 hover:bg-opacity-80 border-l-4 ${borderColor}`}
                >
                  <span className={`select-none mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {prefix}
                  </span>
                  <span className="whitespace-pre-wrap">{line || ' '}</span>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}