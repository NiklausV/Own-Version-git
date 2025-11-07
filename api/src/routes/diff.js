// api/src/routes/diff.js
import express from 'express';
import { readObject, parseCommit, parseTree } from '../utils/gitParser.js';

const router = express.Router();

// GET /api/diff/:hash1/:hash2 - Get diff between commits
router.get('/:hash1/:hash2', async (req, res) => {
  try {
    const { hash1, hash2 } = req.params;
    
    // Handle case where hash1 might be null (first commit)
    let commit1 = null;
    let parsed1 = null;
    let entries1 = {};
    
    if (hash1 && hash1 !== 'null') {
      commit1 = await readObject(hash1);
      if (commit1) {
        parsed1 = parseCommit(commit1.content);
        const tree1 = await readObject(parsed1.tree);
        if (tree1) {
          entries1 = parseTree(tree1.content);
        }
      }
    }
    
    const commit2 = await readObject(hash2);
    if (!commit2) {
      return res.status(404).json({ error: 'Commit not found' });
    }
    
    const parsed2 = parseCommit(commit2.content);
    const tree2 = await readObject(parsed2.tree);
    
    if (!tree2) {
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const entries2 = parseTree(tree2.content);
    
    const allFiles = new Set([...Object.keys(entries1), ...Object.keys(entries2)]);
    const diffs = {};
    
    for (const file of allFiles) {
      const entry1 = entries1[file];
      const entry2 = entries2[file];
      
      let blob1Content = '';
      let blob2Content = '';
      
      if (entry1) {
        const blob1 = await readObject(entry1.hash);
        blob1Content = blob1?.content || '';
      }
      
      if (entry2) {
        const blob2 = await readObject(entry2.hash);
        blob2Content = blob2?.content || '';
      }
      
      let status = 'modified';
      if (!entry1) {
        status = 'added';
      } else if (!entry2) {
        status = 'deleted';
      } else if (entry1.hash === entry2.hash) {
        // Files are identical, skip
        continue;
      }
      
      diffs[file] = {
        oldContent: blob1Content,
        newContent: blob2Content,
        status: status
      };
    }
    
    res.json(diffs);
  } catch (error) {
    console.error('Error in GET /api/diff/:hash1/:hash2:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// GET /api/diff/:hash/:file - Get specific file diff (file in commit vs parent)
router.get('/:hash/:file(*)', async (req, res) => {
  try {
    const commitObj = await readObject(req.params.hash);
    if (!commitObj) {
      return res.status(404).json({ error: 'Commit not found' });
    }
    
    const parsed = parseCommit(commitObj.content);
    const treeObj = await readObject(parsed.tree);
    
    if (!treeObj) {
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const entries = parseTree(treeObj.content);
    
    const filename = req.params.file;
    const entry = entries[filename];
    
    if (!entry) {
      return res.status(404).json({ error: 'File not found in commit' });
    }
    
    const blob = await readObject(entry.hash);
    
    if (!blob) {
      return res.status(404).json({ error: 'Blob not found' });
    }
    
    res.json({
      filename,
      content: blob.content,
      hash: entry.hash,
      mode: entry.mode
    });
  } catch (error) {
    console.error('Error in GET /api/diff/:hash/:file:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;