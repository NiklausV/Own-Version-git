// api/src/utils/gitParser.js
import fs from 'fs/promises';
import path from 'path';

// Make path configurable
let REPO_BASE_PATH = process.cwd();

export function setRepositoryPath(repoPath) {
  REPO_BASE_PATH = repoPath;
}

const MYGIT_DIR = () => path.join(REPO_BASE_PATH, '.mygit');
const OBJECTS_DIR = () => path.join(MYGIT_DIR(), 'objects');
const REFS_DIR = () => path.join(MYGIT_DIR(), 'refs');
const HEAD_FILE = () => path.join(MYGIT_DIR(), 'HEAD');

/**
 * Read a Git object by hash
 */
export async function readObject(hash) {
  try {
    const objectPath = path.join(OBJECTS_DIR(), hash.substring(0, 2), hash.substring(2));
    const data = await fs.readFile(objectPath, 'utf-8');
    
    const nullIndex = data.indexOf('\0');
    const header = data.substring(0, nullIndex);
    const content = data.substring(nullIndex + 1);
    
    const [type, size] = header.split(' ');
    
    return {
      type,
      size: parseInt(size),
      content
    };
  } catch (error) {
    return null;
  }
}

/**
 * Parse commit object content
 */
export function parseCommit(commitContent) {
  const lines = commitContent.split('\n');
  
  const result = {
    tree: null,
    parent: null,
    author: null,
    committer: null,
    message: '',
    timestamp: null
  };
  
  let messageStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('tree ')) {
      result.tree = line.substring(5);
    } else if (line.startsWith('parent ')) {
      result.parent = line.substring(7);
    } else if (line.startsWith('author ')) {
      const authorLine = line.substring(7);
      result.author = authorLine;
      
      // Extract timestamp from author line 
      const timestampMatch = authorLine.match(/(\d+)\s+[+-]\d{4}$/);
      if (timestampMatch) {
        result.timestamp = parseInt(timestampMatch[1]);
      }
    } else if (line.startsWith('committer ')) {
      result.committer = line.substring(10);
    } else if (line === '') {
      messageStartIndex = i + 1;
      break;
    }
  }
  
  // Get commit message 
  if (messageStartIndex >= 0 && messageStartIndex < lines.length) {
    result.message = lines.slice(messageStartIndex).join('\n').trim();
  }
  
  return result;
}

/**
 * Parse tree object content
 */
export function parseTree(treeContent) {
  const entries = {};
  
  if (!treeContent) {
    console.error('parseTree: Empty tree content');
    return entries;
  }
  
  // Split by newlines, but be careful with the format
  // Tree format: "mode name\0hash\n" for each entry
  const lines = treeContent.split('\n').filter(line => line.length > 0);
  
  if (lines.length === 0) {
    console.error('parseTree: No lines in tree content');
    return entries;
  }
  
  if (process.env.DEBUG) {
    console.log(`parseTree: Processing ${lines.length} lines`);
    console.log('parseTree: First line sample:', lines[0].substring(0, 50).split('').map(c => 
      c.charCodeAt(0) < 32 ? `\\x${c.charCodeAt(0).toString(16)}` : c
    ).join(''));
  }
  
  for (const line of lines) {
    // Format: "mode name\0hash"
    const spaceIndex = line.indexOf(' ');
    if (spaceIndex === -1) {
      console.warn('parseTree: No space found in line');
      continue;
    }
    
    const mode = line.substring(0, spaceIndex);
    const rest = line.substring(spaceIndex + 1);
    
    const nullIndex = rest.indexOf('\0');
    if (nullIndex === -1) {
      console.warn('parseTree: No null character found. Line might be:', 
        rest.split('').map(c => 
          c.charCodeAt(0) < 32 ? `\\x${c.charCodeAt(0).toString(16)}` : c
        ).join('').substring(0, 100)
      );
      continue;
    }
    
    const name = rest.substring(0, nullIndex);
    const hash = rest.substring(nullIndex + 1).trim();
    
    if (name && hash) {
      entries[name] = { mode, hash };
      if (process.env.DEBUG) {
        console.log(`parseTree: Added entry: ${name} -> ${hash.substring(0, 10)}...`);
      }
    }
  }
  
  console.log(`parseTree: Found ${Object.keys(entries).length} entries:`, Object.keys(entries));
  
  return entries;
}

/**
 * Get current HEAD commit hash
 */
export async function getCurrentCommit() {
  try {
    const headContent = await fs.readFile(HEAD_FILE(), 'utf-8');
    const refMatch = headContent.match(/ref: (.+)/);
    
    if (refMatch) {
      // HEAD points to a branch
      const refPath = path.join(MYGIT_DIR(), refMatch[1].trim());
      try {
        const commitHash = await fs.readFile(refPath, 'utf-8');
        return commitHash.trim();
      } catch {
        return null; // Branch exists but has no commits
      }
    } else {
      // Detached HEAD
      return headContent.trim();
    }
  } catch {
    return null;
  }
}

/**
 * Get current branch name
 */
export async function getCurrentBranch() {
  try {
    const headContent = await fs.readFile(HEAD_FILE(), 'utf-8');
    const match = headContent.match(/ref: refs\/heads\/(.+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

/**
 * List all branches
 */
export async function listBranches() {
  try {
    const headsDir = path.join(REFS_DIR(), 'heads');
    const branches = await fs.readdir(headsDir);
    const currentBranch = await getCurrentBranch();
    
    return branches.map(branch => ({
      name: branch,
      current: branch === currentBranch,
      path: `refs/heads/${branch}`
    }));
  } catch {
    return [];
  }
}

/**
 * Get commit by hash with full details
 */
export async function getCommitDetails(hash) {
  const commitObj = await readObject(hash);
  if (!commitObj || commitObj.type !== 'commit') {
    return null;
  }
  
  const parsed = parseCommit(commitObj.content);
  
  // Get files from tree
  const treeObj = await readObject(parsed.tree);
  const treeEntries = parseTree(treeObj.content);
  const files = Object.keys(treeEntries);
  
  return {
    hash,
    ...parsed,
    files,
    date: new Date(parsed.timestamp * 1000)
  };
}

/**
 * Get commit history starting from a hash
 */
export async function getCommitHistory(startHash, limit = 50) {
  const commits = [];
  let currentHash = startHash;
  
  while (currentHash && commits.length < limit) {
    const details = await getCommitDetails(currentHash);
    if (!details) break;
    
    commits.push(details);
    currentHash = details.parent;
  }
  
  return commits;
}

/**
 * Check if repository is initialized
 */
export async function isRepositoryInitialized() {
  try {
    await fs.access(MYGIT_DIR());
    await fs.access(OBJECTS_DIR());
    await fs.access(HEAD_FILE());
    return true;
  } catch {
    return false;
  }
}

/**
 * Get blob content by hash
 */
export async function getBlobContent(hash) {
  const blob = await readObject(hash);
  return blob?.type === 'blob' ? blob.content : null;
}

/**
 * Compare two trees and return diff
 */
export async function compareTrees(tree1Hash, tree2Hash) {
  const tree1 = await readObject(tree1Hash);
  const tree2 = await readObject(tree2Hash);
  
  if (!tree1 || !tree2) return null;
  
  const entries1 = parseTree(tree1.content);
  const entries2 = parseTree(tree2.content);
  
  const allFiles = new Set([...Object.keys(entries1), ...Object.keys(entries2)]);
  const changes = {};
  
  for (const filename of allFiles) {
    const entry1 = entries1[filename];
    const entry2 = entries2[filename];
    
    if (!entry1) {
      changes[filename] = { status: 'added', hash: entry2.hash };
    } else if (!entry2) {
      changes[filename] = { status: 'deleted', hash: entry1.hash };
    } else if (entry1.hash !== entry2.hash) {
      changes[filename] = { status: 'modified', oldHash: entry1.hash, newHash: entry2.hash };
    }
  }
  
  return changes;
}

/**
 * Format author info
 */
export function formatAuthor(authorLine) {
  // Format: "Name <email> timestamp timezone"
  const match = authorLine.match(/^(.+?) <(.+?)> (\d+) ([+-]\d{4})$/);
  
  if (match) {
    return {
      name: match[1],
      email: match[2],
      timestamp: parseInt(match[3]),
      timezone: match[4]
    };
  }
  
  return {
    name: authorLine,
    email: '',
    timestamp: null,
    timezone: ''
  };
}

/**
 * Create a new branch reference
 */
export async function createBranch(branchName, commitHash) {
  const headsDir = path.join(REFS_DIR(), 'heads');
  const branchPath = path.join(headsDir, branchName);
  
  // Check if branch already exists
  try {
    await fs.access(branchPath);
    throw new Error(`Branch '${branchName}' already exists`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      throw error;
    }
    // Branch doesn't exist, which is what we want
  }
  
  // Ensure refs/heads directory exists
  try {
    await fs.mkdir(headsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  // Create the branch file with the commit hash
  await fs.writeFile(branchPath, `${commitHash}\n`);
}

/**
 * Get repository paths
 */
export function getRepositoryPaths() {
  return {
    MYGIT_DIR: MYGIT_DIR(),
    OBJECTS_DIR: OBJECTS_DIR(),
    REFS_DIR: REFS_DIR(),
    HEAD_FILE: HEAD_FILE()
  };
}



/**
 * Update a reference (branch or HEAD)
 */
export async function updateRef(refPath, commitHash) {
  const fullPath = path.join(MYGIT_DIR(), refPath);
  await fs.writeFile(fullPath, `${commitHash}\n`);
}

/**
 * Check if HEAD is in detached state
 */
export async function isDetached() {
  try {
    const headContent = await fs.readFile(HEAD_FILE(), 'utf-8');
    // If HEAD contains "ref:", it's pointing to a branch (not detached)
    return !headContent.startsWith('ref:');
  } catch {
    return false;
  }
}

/**
 * Get repository statistics
 */
export async function getRepositoryStats() {
  const currentHash = await getCurrentCommit();
  if (!currentHash) {
    return {
      totalCommits: 0,
      branches: 0,
      currentBranch: null
    };
  }
  
  const commits = await getCommitHistory(currentHash, Infinity);
  const branches = await listBranches();
  const currentBranch = await getCurrentBranch();
  
  return {
    totalCommits: commits.length,
    branches: branches.length,
    currentBranch: currentBranch || 'HEAD (detached)'
  };
}