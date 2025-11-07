// cli-tool/src/commands/diff.js
import fs from 'fs/promises';
import chalk from 'chalk';
import { INDEX_FILE, HEAD_FILE } from '../core/constants.js';
import { readObject } from '../core/objects.js';

export async function diffCommand(commit1, commit2) {
  if (!commit1 && !commit2) {
    // Show diff between working tree and staging area
    await diffWorkingTreeToStaging();
  } else if (commit1 && commit2) {
    // Show diff between two commits
    await diffCommits(commit1, commit2);
  } else {
    throw new Error('Invalid diff arguments. Use: mygit diff OR mygit diff <commit1> <commit2>');
  }
}

async function diffWorkingTreeToStaging() {
  const index = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8'));
  
  if (Object.keys(index.files).length === 0) {
    console.log(chalk.gray('No staged files to compare'));
    return;
  }
  
  console.log(chalk.bold('Changes between working tree and staging area:\n'));
  
  for (const [file, info] of Object.entries(index.files)) {
    try {
      const currentContent = await fs.readFile(file, 'utf-8');
      const stagedBlob = await readObject(info.hash);
      
      if (currentContent !== stagedBlob.content) {
        console.log(chalk.yellow(`diff --git a/${file} b/${file}`));
        console.log(chalk.gray(`--- a/${file}`));
        console.log(chalk.gray(`+++ b/${file}`));
        
        const diff = simpleDiff(stagedBlob.content, currentContent);
        diff.forEach(line => {
          if (line.startsWith('+')) {
            console.log(chalk.green(line));
          } else if (line.startsWith('-')) {
            console.log(chalk.red(line));
          } else {
            console.log(chalk.gray(line));
          }
        });
        console.log();
      }
    } catch (error) {
      console.log(chalk.red(`Error reading ${file}: ${error.message}`));
    }
  }
}

async function diffCommits(hash1, hash2) {
  const commit1 = await readObject(hash1);
  const commit2 = await readObject(hash2);
  
  if (!commit1 || !commit2) {
    throw new Error('One or both commits not found');
  }
  
  // Parse commits to get tree hashes
  const tree1Hash = commit1.content.split('\n')[0].split(' ')[1];
  const tree2Hash = commit2.content.split('\n')[0].split(' ')[1];
  
  const tree1 = await readObject(tree1Hash);
  const tree2 = await readObject(tree2Hash);
  
  // Parse tree entries
  const entries1 = parseTree(tree1.content);
  const entries2 = parseTree(tree2.content);
  
  console.log(chalk.bold(`Comparing commits ${hash1.substring(0, 7)}...${hash2.substring(0, 7)}\n`));
  
  // Find all unique files
  const allFiles = new Set([...Object.keys(entries1), ...Object.keys(entries2)]);
  
  for (const file of allFiles) {
    const blob1 = entries1[file] ? await readObject(entries1[file].hash) : null;
    const blob2 = entries2[file] ? await readObject(entries2[file].hash) : null;
    
    if (!blob1) {
      console.log(chalk.green(`+++ ${file} (added)`));
    } else if (!blob2) {
      console.log(chalk.red(`--- ${file} (deleted)`));
    } else if (blob1.content !== blob2.content) {
      console.log(chalk.yellow(`diff --git a/${file} b/${file}`));
      console.log(chalk.gray(`--- a/${file}`));
      console.log(chalk.gray(`+++ b/${file}`));
      
      const diff = simpleDiff(blob1.content, blob2.content);
      diff.forEach(line => {
        if (line.startsWith('+')) {
          console.log(chalk.green(line));
        } else if (line.startsWith('-')) {
          console.log(chalk.red(line));
        } else {
          console.log(chalk.gray(line));
        }
      });
    }
    console.log();
  }
}

function parseTree(treeContent) {
  const entries = {};
  const lines = treeContent.split('\n').filter(Boolean);
  
  for (const line of lines) {
    const [mode, rest] = line.split(' ');
    const [name, hash] = rest.split('\0');
    entries[name] = { mode, hash };
  }
  
  return entries;
}

function simpleDiff(text1, text2) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const result = [];
  
  let i = 0, j = 0;
  
  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      result.push(`+ ${lines2[j]}`);
      j++;
    } else if (j >= lines2.length) {
      result.push(`- ${lines1[i]}`);
      i++;
    } else if (lines1[i] === lines2[j]) {
      result.push(`  ${lines1[i]}`);
      i++;
      j++;
    } else {
      result.push(`- ${lines1[i]}`);
      result.push(`+ ${lines2[j]}`);
      i++;
      j++;
    }
  }
  
  return result;
}