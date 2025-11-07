// diff-viewer/src/components/FileTree.jsx
import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

export function FileTree({ files, selectedFile, onSelectFile, darkMode }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const fileTree = useMemo(() => {
    const tree = {};
    
    files.forEach(filepath => {
      const parts = filepath.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? null : {};
        }
        if (index < parts.length - 1) {
          current = current[part];
        }
      });
    });
    
    return tree;
  }, [files]);

  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTree = (node, path = '') => {
    return Object.entries(node).map(([name, children]) => {
      const currentPath = path ? `${path}/${name}` : name;
      const isFolder = children !== null;
      const isExpanded = expandedFolders.has(currentPath);
      const isSelected = selectedFile === currentPath;

      if (isFolder) {
        return (
          <div key={currentPath}>
            <button
              onClick={() => toggleFolder(currentPath)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Folder className="w-4 h-4" />
              <span className="font-medium">{name}</span>
            </button>
            {isExpanded && (
              <div className="ml-4">
                {renderTree(children, currentPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <button
            key={currentPath}
            onClick={() => onSelectFile(currentPath)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
              isSelected
                ? darkMode
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'bg-blue-100 text-blue-700'
                : darkMode
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className="w-4" />
            <File className="w-4 h-4" />
            <span>{name}</span>
          </button>
        );
      }
    });
  };

  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No files in this commit
      </div>
    );
  }

  return (
    <div className="py-2">
      {renderTree(fileTree)}
    </div>
  );
}