// api/src/routes/branches.js
import express from 'express';
import { 
  getCurrentBranch, 
  listBranches, 
  createBranch as createBranchRef,
  getCurrentCommit,
  updateRef,
  isDetached,
  getRepositoryPaths  
} from '../utils/gitParser.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// GET /api/branches 
router.get('/', async (req, res) => {
  try {
    const branches = await listBranches();
    const currentBranch = await getCurrentBranch();
    const currentCommit = await getCurrentCommit();
    
    res.json({
      branches,
      current: currentBranch,
      detached: await isDetached(),
      head: currentCommit
    });
  } catch (error) {
    console.error('Error listing branches:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/branches - Create new branch
router.post('/', async (req, res) => {
  try {
    const { name, startPoint } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Branch name is required' });
    }
    
    // Validate branch name
    if (!/^[a-zA-Z0-9_\-\.\/]+$/.test(name)) {
      return res.status(400).json({ 
        error: 'Invalid branch name. Use only alphanumeric characters, dashes, underscores, dots, and slashes.' 
      });
    }
    
    // Get the commit to branch from
    const commitHash = startPoint || await getCurrentCommit();
    
    if (!commitHash) {
      return res.status(400).json({ error: 'No commits yet. Cannot create branch.' });
    }
    
    // Create the branch
    await createBranchRef(name, commitHash);
    
    res.status(201).json({
      success: true,
      branch: name,
      commit: commitHash,
      message: `Branch '${name}' created`
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// POST /api/branches/checkout - Switch to a branch
router.post('/checkout', async (req, res) => {
  try {
    const { branch } = req.body;
    
    if (!branch) {
      return res.status(400).json({ error: 'Branch name is required' });
    }
    
    const paths = getRepositoryPaths();
    const branchPath = path.join(paths.REFS_DIR, 'heads', branch);
    
    // Check if branch exists
    try {
      await fs.access(branchPath);
    } catch {
      return res.status(404).json({ error: `Branch '${branch}' not found` });
    }
    
    // Get the commit hash for this branch
    const commitHash = (await fs.readFile(branchPath, 'utf-8')).trim();
    
    // Update HEAD to point to the branch
    await fs.writeFile(paths.HEAD_FILE, `ref: refs/heads/${branch}\n`);
    
    res.json({
      success: true,
      branch,
      commit: commitHash,
      message: `Switched to branch '${branch}'`
    });
  } catch (error) {
    console.error('Error switching branch:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/branches/:name - Delete a branch
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const currentBranch = await getCurrentBranch();
    
    if (name === currentBranch) {
      return res.status(400).json({ 
        error: `Cannot delete the current branch '${name}'` 
      });
    }
    
    const paths = getRepositoryPaths();
    const branchPath = path.join(paths.REFS_DIR, 'heads', name);
    
    try {
      await fs.unlink(branchPath);
    } catch {
      return res.status(404).json({ error: `Branch '${name}' not found` });
    }
    
    res.json({
      success: true,
      message: `Branch '${name}' deleted`
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;