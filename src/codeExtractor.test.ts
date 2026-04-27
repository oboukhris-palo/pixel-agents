/**
 * Layer 2 Tests: Code Extractor Utility
 * Story: US-001-002 - Real-Time Agent Activity Monitor with Code Snippets
 * 
 * Tests validate git diff parsing, language detection, line extraction,
 * and truncation logic following AC2 (extract code from git diff).
 */

import {
  extractCodeFromDiff,
  detectLanguageFromFilePath,
  truncateLongLines,
  parseGitDiff,
  CodeExtractResult,
} from './codeExtractor';
import { CODE_DISPLAY_CONFIG } from './agentActivityTypes';

describe('Code Extractor Utility - Layer 2', () => {
  describe('detectLanguageFromFilePath', () => {
    it('should detect TypeScript files', () => {
      expect(detectLanguageFromFilePath('src/component.ts')).toBe('typescript');
      expect(detectLanguageFromFilePath('tests/test.tsx')).toBe('typescript');
    });
    
    it('should detect JavaScript files', () => {
      expect(detectLanguageFromFilePath('app.js')).toBe('javascript');
      expect(detectLanguageFromFilePath('component.jsx')).toBe('javascript');
    });
    
    it('should detect CSS files', () => {
      expect(detectLanguageFromFilePath('styles.css')).toBe('css');
      expect(detectLanguageFromFilePath('component.module.css')).toBe('css');
    });
    
    it('should detect HTML files', () => {
      expect(detectLanguageFromFilePath('index.html')).toBe('html');
    });
    
    it('should return typescript as default for unknown extensions', () => {
      expect(detectLanguageFromFilePath('README.md')).toBe('typescript');
      expect(detectLanguageFromFilePath('config.json')).toBe('typescript');
    });
  });
  
  describe('truncateLongLines', () => {
    it('should truncate lines exceeding MAX_CHARS_PER_LINE (AC7)', () => {
      const longLine = 'x'.repeat(CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE + 50);
      const result = truncateLongLines(longLine);
      
      expect(result.length).toBe(CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE + CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR.length);
      expect(result.endsWith(CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR)).toBe(true);
    });
    
    it('should preserve lines within limit', () => {
      const validLine = 'const foo = "bar";';
      const result = truncateLongLines(validLine);
      
      expect(result).toBe(validLine);
    });
    
    it('should handle multiline input', () => {
      const input = [
        'short line',
        'x'.repeat(250), // Exceeds 200
        'another short line',
      ].join('\n');
      
      const result = truncateLongLines(input);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('short line');
      expect(lines[1].endsWith(CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR)).toBe(true);
      expect(lines[2]).toBe('another short line');
    });
    
    it('should handle empty input', () => {
      expect(truncateLongLines('')).toBe('');
    });
  });
  
  describe('parseGitDiff', () => {
    it('should extract added lines from git diff output', () => {
      const gitDiff = `
diff --git a/src/component.ts b/src/component.ts
index 1234567..abcdefg 100644
--- a/src/component.ts
+++ b/src/component.ts
@@ -10,5 +10,8 @@ export function Component() {
   const [state, setState] = useState(0);
+  
+  const handleClick = () => {
+    setState(state + 1);
+  };
   
   return <div>Component</div>;
 }
`;
      
      const result = parseGitDiff(gitDiff);
      
      expect(result.addedLines).toContain('  const handleClick = () => {');
      expect(result.addedLines).toContain('    setState(state + 1);');
      expect(result.addedLines).toContain('  };');
      expect(result.addedLines.length).toBeGreaterThan(0);
    });
    
    it('should extract file path from diff header', () => {
      const gitDiff = `
diff --git a/src/test.ts b/src/test.ts
index 1234567..abcdefg 100644
--- a/src/test.ts
+++ b/src/test.ts
@@ -5,3 +5,4 @@ const x = 1;
+const y = 2;
`;
      
      const result = parseGitDiff(gitDiff);
      
      expect(result.filePath).toBe('src/test.ts');
    });
    
    it('should handle multiple files and extract from last file', () => {
      const gitDiff = `
diff --git a/src/file1.ts b/src/file1.ts
+line from file1

diff --git a/src/file2.js b/src/file2.js
+line from file2
`;
      
      const result = parseGitDiff(gitDiff);
      
      expect(result.filePath).toBe('src/file2.js');
      expect(result.addedLines).toContain('line from file2');
    });
    
    it('should return empty result for empty diff', () => {
      const result = parseGitDiff('');
      
      expect(result.addedLines).toEqual([]);
      expect(result.filePath).toBe('');
    });
    
    it('should ignore removed lines (only added lines with +)', () => {
      const gitDiff = `
diff --git a/src/test.ts b/src/test.ts
@@ -5,3 +5,3 @@
-const old = 1;
+const new = 2;
`;
      
      const result = parseGitDiff(gitDiff);
      
      expect(result.addedLines).not.toContain('const old = 1;');
      expect(result.addedLines).toContain('const new = 2;');
    });
    
    it('should filter out +++ header lines', () => {
      const gitDiff = `
diff --git a/src/test.ts b/src/test.ts
--- a/src/test.ts
+++ b/src/test.ts
@@ -5,3 +5,4 @@
+const real = 1;
`;
      
      const result = parseGitDiff(gitDiff);
      
      expect(result.addedLines).toContain('const real = 1;');
      expect(result.addedLines).not.toContain('+++ b/src/test.ts');
    });
  });
  
  describe('extractCodeFromDiff', () => {
    it('should extract last 15 lines from git diff (AC2)', () => {
      const gitDiff = `
diff --git a/src/component.ts b/src/component.ts
+line 1
+line 2
+line 3
+line 4
+line 5
+line 6
+line 7
+line 8
+line 9
+line 10
+line 11
+line 12
+line 13
+line 14
+line 15
+line 16
+line 17
+line 18
+line 19
+line 20
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      expect(result).not.toBeNull();
      expect(result!.content.split('\n').length).toBeLessThanOrEqual(15);
      expect(result!.content).toContain('line 20'); // Should include most recent lines
    });
    
    it('should detect language from file extension', () => {
      const gitDiff = `
diff --git a/styles.css b/styles.css
+.button { color: red; }
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      expect(result).not.toBeNull();
      expect(result!.language).toBe('css');
    });
    
    it('should truncate long lines (AC7)', () => {
      const longLine = 'x'.repeat(250);
      const gitDiff = `
diff --git a/test.ts b/test.ts
+${longLine}
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      expect(result).not.toBeNull();
      expect(result!.content.length).toBeLessThanOrEqual(CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE + CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR.length);
      expect(result!.content.endsWith(CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR)).toBe(true);
    });
    
    it('should extract line numbers from diff hunks', () => {
      const gitDiff = `
diff --git a/test.ts b/test.ts
@@ -42,3 +42,5 @@ function test() {
+  const x = 1;
+  const y = 2;
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      expect(result).not.toBeNull();
      expect(result!.lineNumbers).toBeDefined();
      expect(result!.lineNumbers!.length).toBeGreaterThan(0);
      expect(result!.lineNumbers![0]).toBeGreaterThanOrEqual(42); // Based on @@ -42,3 +42,5 @@
    });
    
    it('should return null for empty diff', () => {
      const result = extractCodeFromDiff('');
      
      expect(result).toBeNull();
    });
    
    it('should return null for diff with only deletions', () => {
      const gitDiff = `
diff --git a/test.ts b/test.ts
@@ -5,3 +5,0 @@
-const removed = 1;
-const alsoRemoved = 2;
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      expect(result).toBeNull();
    });
    
    it('should handle TypeScript files with .tsx extension', () => {
      const gitDiff = `
diff --git a/Component.tsx b/Component.tsx
+export const Component = () => <div>Test</div>;
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      expect(result).not.toBeNull();
      expect(result!.language).toBe('typescript');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle binary file diffs gracefully', () => {
      const gitDiff = `
diff --git a/image.png b/image.png
Binary files differ
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      expect(result).toBeNull();
    });
    
    it('should handle malformed diff output', () => {
      const malformedDiff = 'not a valid diff format';
      
      expect(() => extractCodeFromDiff(malformedDiff)).not.toThrow();
      expect(extractCodeFromDiff(malformedDiff)).toBeNull();
    });
    
    it('should handle diffs with no file path', () => {
      const gitDiff = `
@@ -5,3 +5,4 @@
+some code
`;
      
      const result = extractCodeFromDiff(gitDiff);
      
      // Should still extract code even without file path (defaults to typescript)
      expect(result).not.toBeNull();
      expect(result!.language).toBe('typescript');
    });
  });
});
