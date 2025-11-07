#!/usr/bin/env node
// cli-tool/src/index.js
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { commitCommand } from './commands/commit.js';
import { logCommand } from './commands/log.js';
import { statusCommand } from './commands/status.js';
import { diffCommand } from './commands/diff.js';
import { checkoutCommand } from './commands/checkout.js';
import { branchCommand } from './commands/branch.js';
import { logger } from './utils/logger.js';

const program = new Command();

program
  .name('mygit')
  .description('A custom Git implementation')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new repository')
  .action(async () => {
    try {
      await initCommand();
      logger.success('Initialized empty MyGit repository');
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('add <files...>')
  .description('Add files to the staging area')
  .action(async (files) => {
    try {
      await addCommand(files);
      logger.success(`Added ${files.length} file(s) to staging area`);
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('commit')
  .description('Create a new commit')
  .option('-m, --message <message>', 'commit message')
  .action(async (options) => {
    try {
      if (!options.message) {
        logger.error('commit message required');
        process.exit(1);
      }
      const hash = await commitCommand(options.message);
      logger.success(`Created commit: ${hash.substring(0, 7)}`);
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('log')
  .description('Show commit history')
  .option('-n, --number <count>', 'number of commits to show', '10')
  .action(async (options) => {
    try {
      await logCommand(parseInt(options.number));
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show the working tree status')
  .action(async () => {
    try {
      await statusCommand();
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('diff')
  .description('Show changes between commits or working tree')
  .argument('[commit1]', 'first commit hash')
  .argument('[commit2]', 'second commit hash')
  .action(async (commit1, commit2) => {
    try {
      await diffCommand(commit1, commit2);
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('checkout <target>')
  .description('Switch branches or restore working tree files')
  .option('-b, --create', 'create a new branch')
  .action(async (target, options) => {
    try {
      await checkoutCommand(target, options);
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('branch')
  .description('List, create, or delete branches')
  .argument('[name]', 'branch name')
  .option('-d, --delete', 'delete a branch')
  .action(async (name, options) => {
    try {
      await branchCommand(name, options);
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program.parse();