// api/src/core/objects.js
import fs from 'fs/promises';
import path from 'path';
import { hashContent } from './hash.js';

const MYGIT_DIR = process.env.MYGIT_DIR || path.join(process.cwd(), '.mygit');
const OBJECTS_DIR = path.join(MYGIT_DIR, 'objects');

/**
 * Create a blob object from content
 */
export async function createBlob(content) {
  const blob = `blob ${content.length}\0${content}`;
  const hash = hashContent(blob);
  
  // Store in objects directory
  const dir = path.join(OBJECTS_DIR, hash.substring(0, 2));
  const file = path.join(dir, hash.substring(2));
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, blob);
  
  return hash;
}