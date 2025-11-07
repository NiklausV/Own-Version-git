// cli-tool/src/utils/logger.js
import chalk from 'chalk';

export const logger = {
  success(message) {
    console.log(chalk.green('✓'), message);
  },
  
  error(message) {
    console.error(chalk.red('✗ Error:'), message);
  },
  
  warning(message) {
    console.log(chalk.yellow('⚠'), message);
  },
  
  info(message) {
    console.log(chalk.blue('ℹ'), message);
  },
  
  debug(message) {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message);
    }
  },
  
  header(message) {
    console.log(chalk.bold.cyan(`\n${message}\n`));
  },
  
  dim(message) {
    console.log(chalk.gray(message));
  },
  
  highlight(message) {
    console.log(chalk.yellow(message));
  },
  
  code(message) {
    console.log(chalk.cyan(`  ${message}`));
  }
};

export function formatCommitHash(hash) {
  return chalk.yellow(hash.substring(0, 7));
}

export function formatBranch(branch, isCurrent = false) {
  return isCurrent ? chalk.green(`* ${branch}`) : `  ${branch}`;
}

export function formatFilename(filename, status = null) {
  const statusColors = {
    modified: chalk.yellow,
    added: chalk.green,
    deleted: chalk.red,
    untracked: chalk.red
  };
  
  const colorFn = status ? statusColors[status] || chalk.white : chalk.white;
  return colorFn(filename);
}