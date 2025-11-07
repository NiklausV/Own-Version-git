// cli-tool/src/core/constants.js
import path from 'path';
import { findRepoRoot } from '../utils/findRepoRoot.js';

// Get the current working directory where the command is run
export const CWD = process.cwd();

// All paths should be relative to CWD
export const MYGIT_DIR = findRepoRoot();
export const OBJECTS_DIR = path.join(MYGIT_DIR, 'objects');
export const REFS_DIR = path.join(MYGIT_DIR, 'refs');
export const HEAD_FILE = path.join(MYGIT_DIR, 'HEAD');
export const INDEX_FILE = path.join(MYGIT_DIR, 'index.json');
export const CONFIG_FILE = path.join(MYGIT_DIR, 'config');