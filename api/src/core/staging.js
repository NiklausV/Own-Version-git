// api/src/core/staging.js
import fs from 'fs/promises';
import path from 'path';

const MYGIT_DIR = process.env.MYGIT_DIR || path.join(process.cwd(), '.mygit');
const INDEX_FILE = path.join(MYGIT_DIR, 'index.json');

export async function readIndex() {
  try {
    const content = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { files: {} };
  }
}

export async function writeIndex(index) {
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
}