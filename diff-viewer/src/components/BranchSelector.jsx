// diff-viewer/src/components/BranchSelector.jsx
import React, { useState } from 'react';
import { GitBranch, Check, Plus, X } from 'lucide-react';
import { createBranch, switchBranch } from '../services/api';

export function BranchSelector({ branches, currentBranch, onClose, onRefresh, darkMode }) {
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSwitchBranch = async (branchName) => {
    if (branchName === currentBranch) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await switchBranch(branchName);
      console.log('Switched to branch:', result);
      
      // Refresh the page to show the new branch's commits
      if (onRefresh) {
        await onRefresh();
      }
      
      onClose();
      
      // success message
      alert(`${result.message}`);
    } catch (err) {
      console.error('Error switching branch:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await createBranch(newBranchName.trim());
      console.log('Created branch:', result);
      
      setNewBranchName('');
      setShowCreateBranch(false);
      
      // Refresh branches list
      if (onRefresh) {
        await onRefresh();
      }
      
      // Show success message
      alert(`${result.message}`);
    } catch (err) {
      console.error('Error creating branch:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`absolute top-16 left-6 z-50 w-80 rounded-lg shadow-lg border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-3 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          <span className="font-semibold">Switch branches</span>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Create Branch Form */}
      {showCreateBranch ? (
        <form onSubmit={handleCreateBranch} className={`p-3 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="Branch name"
            autoFocus
            className={`w-full px-3 py-2 rounded border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Create branch
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateBranch(false);
                setNewBranchName('');
              }}
              className={`px-3 py-1.5 rounded text-sm ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowCreateBranch(true)}
          className={`w-full flex items-center gap-2 px-3 py-2 border-b ${
            darkMode
              ? 'border-gray-700 hover:bg-gray-700'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Create new branch</span>
        </button>
      )}

      {/* Branch List */}
      <div className="max-h-64 overflow-y-auto">
        {branches.map((branch) => (
          <button
            key={branch.name}
            onClick={() => handleSwitchBranch(branch.name)}
            disabled={branch.current}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm ${
              branch.current
                ? darkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-100'
                : darkMode
                ? 'hover:bg-gray-700'
                : 'hover:bg-gray-50'
            } ${branch.current ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className="flex items-center gap-2">
              <GitBranch className="w-3 h-3" />
              {branch.name}
            </span>
            {branch.current && <Check className="w-4 h-4 text-green-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}