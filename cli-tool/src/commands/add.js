// cli-tool/src/commands/add.js
import fs from 'fs/promises';
import path from 'path';
import { INDEX_FILE } from '../core/constants.js';
import { createBlob } from '../core/objects.js';

export async function addCommand(files) {
  // Read the index file
  let index;
  try {
    const indexContent = await fs.readFile(INDEX_FILE, 'utf-8');
    index = JSON.parse(indexContent);
  } catch (error) {
    throw new Error(`Cannot read index file. Make sure you're in a mygit repository. ${error.message}`);
  }
  
  // Process all files and collect them
  await processFiles(files, index);
  
  // Write updated index ONCE at the end
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
}

async function processFiles(files, index) {
  for (const file of files) {
    // Resolve the file path relative to CWD
    const filePath = path.resolve(file);
    
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (error) {
      console.warn(`Warning: Cannot stat ${file}, skipping...`);
      continue;
    }
    
    if (stats.isDirectory()) {
      // Handle directory recursively
      const dirFiles = await fs.readdir(filePath);
      const fullPaths = dirFiles
        .filter(f => f !== '.mygit' && f !== 'node_modules')
        .map(f => path.join(file, f));
      
      if (fullPaths.length > 0) {
        // Recursively process but don't write yet
        await processFiles(fullPaths, index);
      }
      continue;
    }
    
    // Read file content and create blob
    const content = await fs.readFile(filePath, 'utf-8');
    const hash = await createBlob(content);
    
    // Use relative path from CWD as the key
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Add to index
    index.files[relativePath] = {
      hash,
      mode: '100644',
      size: stats.size,
      mtime: stats.mtime.getTime()
    };
  }
}