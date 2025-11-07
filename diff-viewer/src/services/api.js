// diff-viewer/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function getCommits(limit = 50) {
  try {
    const response = await fetch(`${API_URL}/commits?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching commits:', error);
    throw error;
  }
}

export async function getCommit(hash) {
  try {
    const response = await fetch(`${API_URL}/commits/${hash}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching commit:', error);
    throw error;
  }
}

export async function getDiff(hash1, hash2) {
  try {
    const response = await fetch(`${API_URL}/diff/${hash1}/${hash2}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching diff:', error);
    throw error;
  }
}

export async function getStatus() {
  try {
    const response = await fetch(`${API_URL}/status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
}

export async function getBranches() {
  try {
    const response = await fetch(`${API_URL}/branches`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // The API returns { branches, current, detached, head }
    // Return just the branches array
    return data.branches || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
}

export async function getCommitFiles(hash) {
  try {
    const response = await fetch(`${API_URL}/commits/${hash}/files`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const files = await response.json();
    console.log(`Fetched ${files.length} files for commit ${hash}:`, files);
    return files;
  } catch (error) {
    console.error('Error fetching commit files:', error);
    throw error;
  }
}

export async function getFileFromCommit(hash, filename) {
  try {
    const response = await fetch(`${API_URL}/diff/${hash}/${encodeURIComponent(filename)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching file from commit:', error);
    throw error;
  }
}

// Branch operations
export async function createBranch(name, startPoint = null) {
  try {
    const response = await fetch(`${API_URL}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, startPoint })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create branch');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
}

export async function switchBranch(branch) {
  try {
    const response = await fetch(`${API_URL}/branches/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to switch branch');
    }
    return await response.json();
  } catch (error) {
    console.error('Error switching branch:', error);
    throw error;
  }
}

export async function deleteBranch(name) {
  try {
    const response = await fetch(`${API_URL}/branches/${name}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete branch');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting branch:', error);
    throw error;
  }
}

// File operations
export async function getFile(path) {
  try {
    const response = await fetch(`${API_URL}/files/${path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
}

export async function updateFile(path, content, autoStage = false) {
  try {
    const response = await fetch(`${API_URL}/files/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, autoStage })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update file');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
}

export async function createFile(path, content = '', autoStage = false) {
  try {
    const response = await fetch(`${API_URL}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content, autoStage })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create file');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating file:', error);
    throw error;
  }
}

export async function deleteFile(path) {
  try {
    const response = await fetch(`${API_URL}/files/${path}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete file');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}