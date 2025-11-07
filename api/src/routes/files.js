// api/src/routes/files.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { createBlob } from '../core/objects.js';
import { readIndex, writeIndex } from '../core/staging.js';
import { hashContent } from '../core/hash.js';

const router = express.Router();

// GET /api/files/:path - Get file content from working directory
router.get('/:path(*)', async (req, res) => {
  try {
    const filePath = req.params.path;
    const fullPath = path.join(process.cwd(), filePath);
    
    // Security check - prevent directory traversal
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(process.cwd())) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const content = await fs.readFile(fullPath, 'utf-8');
    const stats = await fs.stat(fullPath);
    
    res.json({
      path: filePath,
      content,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/files/:path - Update file content
router.put('/:path(*)', async (req, res) => {
  try {
    const filePath = req.params.path;
    const { content, autoStage = false } = req.body;
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const fullPath = path.join(process.cwd(), filePath);
    
    // Security check
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(process.cwd())) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Write the file
    await fs.writeFile(fullPath, content, 'utf-8');
    
    if (autoStage) {
      const blob = `blob ${content.length}\0${content}`;
      const hash = hashContent(blob);
      await createBlob(content);
      
      const index = await readIndex();
      const stats = await fs.stat(fullPath);
      
      index.files[filePath] = {
        hash,
        mode: '100644',
        size: stats.size,
        mtime: stats.mtime.getTime()
      };
      
      await writeIndex(index);
    }
    
    res.json({
      success: true,
      path: filePath,
      message: autoStage ? 'File updated and staged' : 'File updated',
      staged: autoStage
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files - Create new file
router.post('/', async (req, res) => {
  try {
    const { path: filePath, content = '', autoStage = false } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    const fullPath = path.join(process.cwd(), filePath);
    
    // Security check
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(process.cwd())) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file already exists
    try {
      await fs.access(fullPath);
      return res.status(409).json({ error: 'File already exists' });
    } catch {
      // File doesn't exist, continue
    }
    
    // Create directory if needed
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Create the file
    await fs.writeFile(fullPath, content, 'utf-8');
    
    // Optionally stage
    if (autoStage) {
      const blob = `blob ${content.length}\0${content}`;
      const hash = hashContent(blob);
      await createBlob(content);
      
      const index = await readIndex();
      const stats = await fs.stat(fullPath);
      
      index.files[filePath] = {
        hash,
        mode: '100644',
        size: stats.size,
        mtime: stats.mtime.getTime()
      };
      
      await writeIndex(index);
    }
    
    res.status(201).json({
      success: true,
      path: filePath,
      message: autoStage ? 'File created and staged' : 'File created',
      staged: autoStage
    });
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:path - Delete file
router.delete('/:path(*)', async (req, res) => {
  try {
    const filePath = req.params.path;
    const fullPath = path.join(process.cwd(), filePath);
    
    // Security check
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(process.cwd())) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await fs.unlink(fullPath);
    
    // Remove from index if staged
    const index = await readIndex();
    if (index.files[filePath]) {
      delete index.files[filePath];
      await writeIndex(index);
    }
    
    res.json({
      success: true,
      message: 'File deleted'
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;