// cli-tool/src/commands/branch.js
import { listBranches, createBranch, deleteBranch, getCurrentCommit } from '../core/refs.js';
import { logger, formatBranch } from '../utils/logger.js';

export async function branchCommand(name, options = {}) {
  if (options.delete) {
    // Delete a branch
    if (!name) {
      throw new Error('Branch name required for deletion');
    }
    await deleteBranch(name);
    logger.success(`Deleted branch '${name}'`);
  } else if (name) {
    // Create a new branch
    const currentHash = await getCurrentCommit();
    if (!currentHash) {
      throw new Error('No commits yet - cannot create branch');
    }
    await createBranch(name, currentHash);
    logger.success(`Created branch '${name}'`);
  } else {
    // List branches
    const branches = await listBranches();
    
    if (branches.length === 0) {
      logger.info('No branches yet');
      return;
    }
    
    logger.header('Branches:');
    branches.forEach(branch => {
      console.log(formatBranch(branch.name, branch.current));
    });
  }
}