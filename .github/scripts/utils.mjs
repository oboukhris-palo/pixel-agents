#!/usr/bin/env node
/**
 * utils/index.mjs
 * Shared utilities for framework scripts
 */

import fs from 'node:fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Minimal replacements for a subset of fs-extra used by this framework.
 *
 * Rationale:
 * - The framework scripts are intended to run with **no npm dependencies**
 *   (see .github/scripts/README.md).
 * - Node.js provides equivalents for everything we need.
 */
function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeSync(targetPath) {
  // rmSync with recursive+force is the closest equivalent to fs-extra's removeSync.
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function copySync(srcPath, destPath) {
  // cpSync is available in modern Node versions; this framework requires Node >= 18.
  fs.cpSync(srcPath, destPath, { recursive: true });
}

/**
 * Color codes for terminal output
 */
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Logger with color support
 */
export const logger = {
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}→${colors.reset} ${msg}`),
  status: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
  section: (msg) => {
    console.log(`\n${colors.blue}${'═'.repeat(63)}${colors.reset}`);
    console.log(`${colors.blue}${msg}${colors.reset}`);
    console.log(`${colors.blue}${'═'.repeat(63)}${colors.reset}\n`);
  },
  newline: () => console.log(''),
};

/**
 * Resolve absolute path, handling ~ expansion
 */
export function resolvePath(pathStr) {
  if (!pathStr) return null;
  if (pathStr.startsWith('~')) {
    return path.join(process.env.HOME || process.env.USERPROFILE, pathStr.slice(1));
  }
  return path.resolve(pathStr);
}

/**
 * Calculate relative path between two directories
 */
export function getRelativePath(fromPath, toPath) {
  return path.relative(resolvePath(fromPath), resolvePath(toPath));
}

/**
 * Create symlink
 */
export async function createSymlink(targetPath, linkPath, options = {}) {
  const { force = false, relative = true, dryRun = false } = options;
  
  const target = resolvePath(targetPath);
  const link = resolvePath(linkPath);
  
  if (!fs.existsSync(target)) {
    throw new Error(`Target does not exist: ${target}`);
  }
  
  if (dryRun) {
    logger.info(`[DRY RUN] Would create symlink: ${link} -> ${target}`);
    return;
  }
  
  // Remove existing symlink or directory
  if (fs.existsSync(link)) {
    if (fs.lstatSync(link).isSymbolicLink()) {
      logger.info(`Removing old symlink: ${link}`);
      removeSync(link);
    } else if (force) {
      logger.warn(`Removing old directory: ${link}`);
      removeSync(link);
    } else {
      throw new Error(`Path already exists and is not a symlink: ${link}`);
    }
  }
  
  // Ensure parent directory exists
  ensureDirSync(path.dirname(link));
  
  // Create symlink
  const symLinkTarget = relative ? getRelativePath(link, target) : target;
  fs.symlinkSync(symLinkTarget, link, 'dir');
  logger.success(`Symlink created: ${link} -> ${symLinkTarget}`);
}

/**
 * List files in directory matching pattern
 */
export function findFiles(dirPath, pattern) {
  const dir = resolvePath(dirPath);
  if (!fs.existsSync(dir)) return [];
  
  const regex = new RegExp(pattern);
  const files = fs.readdirSync(dir).filter(f => regex.test(f));
  return files.map(f => path.join(dir, f));
}

/**
 * Check if path is a symlink
 */
export function isSymlink(linkPath) {
  try {
    return fs.lstatSync(resolvePath(linkPath)).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Get symlink target
 */
export function getSymlinkTarget(linkPath) {
  try {
    return fs.readlinkSync(resolvePath(linkPath));
  } catch {
    return null;
  }
}

/**
 * Copy directory recursively, excluding certain patterns
 */
export async function copyDir(srcPath, destPath, options = {}) {
  const {
    exclude = [],
    dryRun = false,
  } = options;
  
  const src = resolvePath(srcPath);
  const dest = resolvePath(destPath);
  
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }
  
  if (dryRun) {
    logger.info(`[DRY RUN] Would copy: ${src} -> ${dest}`);
    return;
  }
  
  ensureDirSync(dest);
  
  const copyRecursive = (currentSrc, currentDest) => {
    const files = fs.readdirSync(currentSrc);
    
    files.forEach(file => {
      // Check if file should be excluded
      if (exclude.some(pattern => new RegExp(pattern).test(file))) {
        return;
      }
      
      const srcFile = path.join(currentSrc, file);
      const destFile = path.join(currentDest, file);
      const stat = fs.statSync(srcFile);
      
      if (stat.isDirectory()) {
        ensureDirSync(destFile);
        copyRecursive(srcFile, destFile);
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    });
  };
  
  copyRecursive(src, dest);
  logger.success(`Directory copied: ${src} -> ${dest}`);
}

/**
 * Remove files matching pattern from directory
 */
export function removeFiles(dirPath, patterns, options = {}) {
  const { dryRun = false } = options;
  const dir = resolvePath(dirPath);
  
  if (!fs.existsSync(dir)) return [];
  
  const removed = [];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const shouldRemove = patterns.some(pattern => new RegExp(pattern).test(file));
    
    if (shouldRemove) {
      if (!dryRun) {
        removeSync(filePath);
      }
      removed.push(file);
      logger.info(`Remove: ${file}`);
    }
  });
  
  return removed;
}

/**
 * Create backup of directory
 */
export function backupDir(dirPath) {
  const dir = resolvePath(dirPath);
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${dir}_backup_${timestamp}`;
  
  copySync(dir, backupPath);
  logger.success(`Backup created: ${backupPath}`);
  
  return backupPath;
}

/**
 * Write JSON file
 */
export function writeJSON(filePath, data, pretty = true) {
  const file = resolvePath(filePath);
  ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, pretty ? 2 : 0));
  logger.success(`File created: ${file}`);
}

/**
 * Read JSON file
 */
export function readJSON(filePath) {
  const file = resolvePath(filePath);
  if (!fs.existsSync(file)) {
    throw new Error(`File does not exist: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

/**
 * Aliases for compatibility with different naming conventions
 */
export const ensureDir = ensureDirSync;
export const loadJsonFile = readJSON;
export const saveJsonFile = writeJSON;

/**
 * Write markdown file
 */
export function writeMD(filePath, content) {
  const file = resolvePath(filePath);
  ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, content);
  logger.success(`File created: ${file}`);
}

/**
 * Read file as string
 */
export function readFile(filePath) {
  const file = resolvePath(filePath);
  return fs.readFileSync(file, 'utf-8');
}

/**
 * Check if directory contains file
 */
export function hasFile(dirPath, fileName) {
  const dir = resolvePath(dirPath);
  return fs.existsSync(path.join(dir, fileName));
}

/**
 * Count files matching pattern in directory
 */
export function countFiles(dirPath, pattern) {
  const files = findFiles(dirPath, pattern);
  return files.length;
}

/**
 * Execute shell command
 */
export function exec(command, options = {}) {
  const { silent = false, cwd = null } = options;
  try {
    const output = execSync(command, {
      stdio: silent ? 'pipe' : 'inherit',
      cwd: cwd ? resolvePath(cwd) : undefined,
      encoding: 'utf-8',
    });
    return output ? output.trim() : '';
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

/**
 * Get current date in YYYYMMDD format
 */
export function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Get timestamp
 */
export function getTimestamp(format = 'iso') {
  const now = new Date();
  
  if (format === 'iso') return now.toISOString();
  if (format === 'date') return now.toISOString().split('T')[0];
  if (format === 'datetime-file') return now.toISOString().replace(/[:.]/g, '-');
  
  return now.toISOString();
}

/**
 * Parse command line arguments
 */
export function parseArgs(args = process.argv.slice(2)) {
  const result = { _: [] };
  let currentKey = null;
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      currentKey = key;
      result[key] = value || true;
    } else if (arg.startsWith('-')) {
      currentKey = arg.slice(1);
      result[currentKey] = true;
    } else if (currentKey) {
      result[currentKey] = arg;
      currentKey = null;
    } else {
      // Positional argument (e.g., the CLI command name)
      result._.push(arg);
    }
  });
  
  return result;
}

/**
 * Generic file system operations
 */
export const fs_ops = {
  existsSync: (p) => fs.existsSync(resolvePath(p)),
  statSync: (p) => fs.statSync(resolvePath(p)),
  ensureDirSync: (p) => ensureDirSync(resolvePath(p)),
  readdirSync: (p) => fs.readdirSync(resolvePath(p)),
  removeSync: (p) => removeSync(resolvePath(p)),
  copyFileSync: (src, dest) => fs.copyFileSync(resolvePath(src), resolvePath(dest)),
};

export default {
  colors,
  logger,
  resolvePath,
  getRelativePath,
  createSymlink,
  findFiles,
  isSymlink,
  getSymlinkTarget,
  copyDir,
  removeFiles,
  backupDir,
  writeJSON,
  readJSON,
  writeMD,
  readFile,
  hasFile,
  countFiles,
  exec,
  getCurrentDate,
  getTimestamp,
  parseArgs,
  // Aliases for compatibility
  ensureDir,
  loadJsonFile,
  saveJsonFile,
  fs_ops,
};
