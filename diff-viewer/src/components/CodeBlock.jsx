// diff-viewer/src/components/CodeBlock.jsx
import React from 'react';
import { highlightCode } from '../utils/highlighter';

export function CodeBlock({ code, language, darkMode, showLineNumbers = true }) {
  const lines = code.split('\n');
  const highlighted = highlightCode(code, language);

  return (
    <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <pre className="p-4">
        <code className="font-mono text-sm">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {showLineNumbers && (
                <span
                  className={`select-none mr-4 text-right w-8 ${
                    darkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {index + 1}
                </span>
              )}
              <span className="flex-1">{line || ' '}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}