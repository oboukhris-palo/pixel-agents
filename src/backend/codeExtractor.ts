/**
 * Layer 2: Code Extractor Utility
 * Story: US-001-002 - Real-Time Agent Activity Monitor with Code Snippets
 * 
 * Parses git diff output to extract code snippets with language detection,
 * line truncation, and line number extraction for ActionBubbleMessage display.
 * 
 * BDD Mapping:
 *   - AC2: Extract last 5-15 lines from git diff (configurable)
 *   - AC7: Truncate lines exceeding CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE
 */

import { CodeSnippetInfo, CODE_DISPLAY_CONFIG, CodeLanguage } from './agentActivityTypes';

/**
 * Result of parsing git diff output
 */
export interface CodeExtractResult {
  /** Added lines (starting with +, excluding +++ headers) */
  addedLines: string[];
  /** File path extracted from diff header */
  filePath: string;
}

/**
 * Detect programming language from file path extension
 * 
 * @param filePath - File path with extension
 * @returns Language identifier for syntax highlighting
 */
export function detectLanguageFromFilePath(filePath: string): CodeLanguage {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'css':
    case 'scss':
    case 'sass':
      return 'css';
    case 'html':
    case 'htm':
      return 'html';
    default:
      return 'typescript'; // Default fallback
  }
}

/**
 * Truncate lines exceeding MAX_CHARS_PER_LINE with ... indicator (AC7)
 * 
 * @param content - Code content (single or multiline)
 * @returns Truncated content with ... for long lines
 */
export function truncateLongLines(content: string): string {
  if (!content) {return '';}
  
  const lines = content.split('\n');
  const truncatedLines = lines.map(line => {
    if (line.length > CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE) {
      return line.substring(0, CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE) + CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR;
    }
    return line;
  });
  
  return truncatedLines.join('\n');
}

/**
 * Parse git diff output to extract added lines and file path
 * 
 * @param gitDiff - Raw git diff output
 * @returns Extracted added lines and file path
 */
export function parseGitDiff(gitDiff: string): CodeExtractResult {
  const result: CodeExtractResult = {
    addedLines: [],
    filePath: '',
  };
  
  if (!gitDiff || gitDiff.trim().length === 0) {
    return result;
  }
  
  const lines = gitDiff.split('\n');
  let currentFilePath = '';
  
  for (const line of lines) {
    // Extract file path from diff header: diff --git a/path/to/file.ts b/path/to/file.ts
    if (line.startsWith('diff --git')) {
      const match = line.match(/diff --git a\/.+ b\/(.+)$/);
      if (match) {
        currentFilePath = match[1];
        result.filePath = currentFilePath; // Update to most recent file
      }
    }
    
    // Extract added lines (starting with + but not +++ header)
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const addedLine = line.substring(1); // Remove leading +
      result.addedLines.push(addedLine);
    }
  }
  
  return result;
}

/**
 * Extract code snippet from git diff output (AC2)
 * Returns last 5-15 lines (configurable) with language detection and truncation
 * 
 * @param gitDiff - Raw git diff output (from git diff HEAD~1 HEAD or git diff --staged)
 * @param maxLines - Maximum lines to extract (default 15)
 * @returns CodeSnippetInfo or null if no code available
 */
export function extractCodeFromDiff(gitDiff: string, maxLines: number = 15): CodeSnippetInfo | null {
  const parsed = parseGitDiff(gitDiff);
  
  // Return null if no added lines
  if (parsed.addedLines.length === 0) {
    return null;
  }
  
  // Take last N lines (most recent changes)
  const recentLines = parsed.addedLines.slice(-maxLines);
  
  // Join lines and truncate long lines
  const content = truncateLongLines(recentLines.join('\n'));
  
  // Detect language from file path (or default to typescript)
  const language = parsed.filePath ? detectLanguageFromFilePath(parsed.filePath) : 'typescript';
  
  // Extract line numbers from diff hunks (if available)
  const lineNumbers = extractLineNumbersFromDiff(gitDiff);
  
  return {
    language,
    content,
    lineNumbers: lineNumbers.length > 0 ? lineNumbers : undefined,
  };
}

/**
 * Extract line numbers from git diff hunk headers (@@ -X,Y +A,B @@)
 * 
 * @param gitDiff - Raw git diff output
 * @returns Array of line numbers where changes occurred
 */
function extractLineNumbersFromDiff(gitDiff: string): number[] {
  const lineNumbers: number[] = [];
  const lines = gitDiff.split('\n');
  
  for (const line of lines) {
    // Match hunk header: @@ -42,3 +42,5 @@ function test() {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -\d+,\d+ \+(\d+),\d+ @@/);
      if (match) {
        const startLine = parseInt(match[1], 10);
        lineNumbers.push(startLine);
      }
    }
  }
  
  return lineNumbers;
}
