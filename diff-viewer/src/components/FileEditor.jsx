// diff-viewer/src/components/FileEditor.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Download } from 'lucide-react';
import { getFile, updateFile } from '../services/api';

export function FileEditor({ filename, onClose, onSave, darkMode }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [autoStage, setAutoStage] = useState(true);

  useEffect(() => {
    async function loadFile() {
      try {
        setLoading(true);
        setError(null);
        const file = await getFile(filename);
        setContent(file.content);
      } catch (err) {
        console.error('Error loading file:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFile();
  }, [filename]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const result = await updateFile(filename, content, autoStage);
      console.log('File saved:', result);
      
      alert(`${result.message}`);
      
      if (onSave) {
        onSave(result);
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving file:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl h-[80vh] rounded-lg shadow-xl flex flex-col ${
        darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className="text-lg font-semibold">Edit File</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filename}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Loading file...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className={`p-4 rounded ${
              darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
            }`}>
              Error: {error}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full h-full p-4 font-mono text-sm rounded border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-900 border-gray-700 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              spellCheck={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoStage}
              onChange={(e) => setAutoStage(e.target.checked)}
              className="rounded"
            />
            <span>Automatically stage changes</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}