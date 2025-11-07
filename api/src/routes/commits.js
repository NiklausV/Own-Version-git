// api/src/routes/commits.js
import express from 'express';
import { readObject, parseCommit, parseTree } from '../utils/gitParser.js';
import { getCurrentCommit, getCurrentBranch } from '../utils/gitParser.js';

const router = express.Router();

// GET /api/commits - Get all commits
router.get('/', async (req, res) => {
  try {
    const currentHash = await getCurrentCommit();
    
    if (!currentHash) {
      return res.json([]);
    }
    
    const commits = [];
    const limit = parseInt(req.query.limit) || 50;
    let hash = currentHash;
    
    while (hash && commits.length < limit) {
      const commitObj = await readObject(hash);
      if (!commitObj) break;
      
      const parsed = parseCommit(commitObj.content);
      
      // Get files from tree
      let files = [];
      try {
        const treeObj = await readObject(parsed.tree);
        if (treeObj) {
          const treeEntries = parseTree(treeObj.content);
          files = Object.keys(treeEntries);
        }
      } catch (error) {
        console.error(`Error getting files for commit ${hash}:`, error);
      }
      
      commits.push({
        hash: hash,
        ...parsed,
        files: files,
        date: new Date(parsed.timestamp * 1000)
      });
      
      hash = parsed.parent;
    }
    
    res.json(commits);
  } catch (error) {
    console.error('Error in GET /api/commits:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/commits/:hash - Get specific commit
router.get('/:hash', async (req, res) => {
  try {
    const commitObj = await readObject(req.params.hash);
    
    if (!commitObj) {
      return res.status(404).json({ error: 'Commit not found' });
    }
    
    const parsed = parseCommit(commitObj.content);
    
    console.log(`[Commit ${req.params.hash.substring(0, 7)}] Tree hash: ${parsed.tree}`);
    
    // Get tree to find files
    let files = [];
    let treeDebug = null;
    try {
      const treeObj = await readObject(parsed.tree);
      if (treeObj) {
        console.log(`[Commit ${req.params.hash.substring(0, 7)}] Tree content length: ${treeObj.content.length}`);
        console.log(`[Commit ${req.params.hash.substring(0, 7)}] Tree content preview:`, 
          treeObj.content.substring(0, 100).split('').map(c => 
            c.charCodeAt(0) < 32 ? `\\x${c.charCodeAt(0).toString(16)}` : c
          ).join('')
        );
        
        const treeEntries = parseTree(treeObj.content);
        files = Object.keys(treeEntries);
        
        console.log(`[Commit ${req.params.hash.substring(0, 7)}] Parsed files:`, files);
        
        treeDebug = {
          hash: parsed.tree,
          contentLength: treeObj.content.length,
          parsedFiles: files,
          entries: treeEntries
        };
      }
    } catch (error) {
      console.error(`[Commit ${req.params.hash.substring(0, 7)}] Error parsing tree:`, error);
    }
    
    res.json({
      hash: req.params.hash,
      ...parsed,
      date: new Date(parsed.timestamp * 1000),
      files,
      _debug: treeDebug
    });
  } catch (error) {
    console.error('Error in GET /api/commits/:hash:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/commits/:hash/files - Get files in a commit
router.get('/:hash/files', async (req, res) => {
  try {
    const commitObj = await readObject(req.params.hash);
    if (!commitObj) {
      return res.status(404).json({ error: 'Commit not found' });
    }
    
    const parsed = parseCommit(commitObj.content);
    const treeObj = await readObject(parsed.tree);
    
    if (!treeObj) {
      return res.json([]);
    }
    
    const treeEntries = parseTree(treeObj.content);
    
    const files = await Promise.all(
      Object.entries(treeEntries).map(async ([name, entry]) => {
        const blob = await readObject(entry.hash);
        return {
          name,
          mode: entry.mode,
          hash: entry.hash,
          size: blob?.content.length || 0,
          content: blob?.content || ''
        };
      })
    );
    
    res.json(files);
  } catch (error) {
    console.error('Error in GET /api/commits/:hash/files:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;