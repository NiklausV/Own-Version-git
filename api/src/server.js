// api/src/server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import commitsRouter from './routes/commits.js';
import diffRouter from './routes/diff.js';
import branchesRouter from './routes/branches.js';
import filesRouter from './routes/files.js';
import { getCurrentBranch, listBranches, setRepositoryPath } from './utils/gitParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Auto-detect .mygit repository
 * Searches up from current directory and checks sibling directories
 */
async function findMyGitRepository() {
  // First, check if MYGIT_REPO_PATH is set
  if (process.env.MYGIT_REPO_PATH) {
    const envPath = path.resolve(process.env.MYGIT_REPO_PATH);
    const mygitDir = path.join(envPath, '.mygit');
    try {
      await fs.access(mygitDir);
      console.log('Using repository from MYGIT_REPO_PATH environment variable');
      return envPath;
    } catch {
      console.log('MYGIT_REPO_PATH set but .mygit not found there');
    }
  }

  // Check current working directory
  let currentDir = process.cwd();
  let mygitPath = path.join(currentDir, '.mygit');
  
  try {
    await fs.access(mygitPath);
    console.log('Found .mygit in current directory');
    return currentDir;
  } catch {}

  // Search up the directory tree
  for (let i = 0; i < 5; i++) {
    currentDir = path.dirname(currentDir);
    mygitPath = path.join(currentDir, '.mygit');
    
    try {
      await fs.access(mygitPath);
      console.log(`Found .mygit in parent directory: ${currentDir}`);
      return currentDir;
    } catch {}
  }

  // Check sibling directories (common pattern: api/ and test-repo/)
  const apiDir = path.dirname(__dirname); // Go up from src/
  const parentDir = path.dirname(apiDir);
  
  try {
    const siblings = await fs.readdir(parentDir, { withFileTypes: true });
    
    for (const sibling of siblings) {
      if (sibling.isDirectory() && sibling.name !== 'api' && sibling.name !== 'node_modules') {
        const siblingPath = path.join(parentDir, sibling.name);
        const siblingMygit = path.join(siblingPath, '.mygit');
        
        try {
          await fs.access(siblingMygit);
          console.log(`Found .mygit in sibling directory: ${sibling.name}`);
          return siblingPath;
        } catch {}
      }
    }
  } catch {}

  // Strategy 4: Look for any .mygit in common locations relative to project
  const projectRoot = path.dirname(path.dirname(apiDir));
  const commonPaths = [
    path.join(projectRoot, 'test-repo'),
    path.join(projectRoot, 'repo'),
    path.join(projectRoot, 'my-repo'),
    path.join(parentDir, 'test-repo'),
    path.join(parentDir, 'repo')
  ];

  for (const testPath of commonPaths) {
    try {
      const testMygit = path.join(testPath, '.mygit');
      await fs.access(testMygit);
      console.log(`Found .mygit at: ${testPath}`);
      return testPath;
    } catch {}
  }

  console.log('No .mygit repository found. Using current directory as fallback.');
  return process.cwd();
}

// Initialize repository path
const REPO_PATH = await findMyGitRepository();
const MYGIT_DIR = path.join(REPO_PATH, '.mygit');
const INDEX_FILE = path.join(MYGIT_DIR, 'index.json');

// Set the repository path for gitParser
setRepositoryPath(REPO_PATH);

// Mount routers
app.use('/api/commits', commitsRouter);
app.use('/api/diff', diffRouter);
app.use('/api/branches', branchesRouter);  
app.use('/api/files', filesRouter);       

// GET /api/status - Get repository status
app.get('/api/status', async (req, res) => {
  try {
    const index = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8'));
    const currentBranch = await getCurrentBranch();
    
    res.json({
      staged: Object.keys(index.files),
      branch: currentBranch || 'HEAD (detached)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'mygit-api',
    version: '1.0.0',
    repository: MYGIT_DIR
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`MyGit API server running on http://localhost:${PORT}`);
  console.log(`Using repository at: ${MYGIT_DIR}`);
  
  // Check if repository exists and has commits
  try {
    await fs.access(MYGIT_DIR);
    const currentBranch = await getCurrentBranch();
    console.log(`Repository found`);
    console.log(`Current branch: ${currentBranch || 'No branch (detached HEAD)'}`);
  } catch {
    console.log(`Warning: .mygit directory not found at ${MYGIT_DIR}`);
    console.log(`Make sure to run 'mygit init' in your repository`);
    console.log(`Or set MYGIT_REPO_PATH environment variable`);
  }
  
  console.log(`Health check: http://localhost:${PORT}/health`);
});