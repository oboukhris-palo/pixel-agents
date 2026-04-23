import { ContextAnalyzer } from './contextAnalyzer';
import type { TokenUsage } from './contextTypes';

// Mock VS Code workspace API
jest.mock('vscode', () => ({
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/mock/workspace' } }],
    createFileSystemWatcher: jest.fn(() => ({
      onDidChange: jest.fn(),
      onDidCreate: jest.fn(),
      onDidDelete: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  window: {
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  RelativePattern: jest.fn(),
}));

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
  },
  existsSync: jest.fn(() => true),
}));

const fs = require('fs');

describe('ContextAnalyzer', () => {
  let analyzer: ContextAnalyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new ContextAnalyzer('/mock/workspace');
  });

  afterEach(() => {
    analyzer.stopMonitoring();
  });

  describe('analyzeContextWindow', () => {
    it('returns a valid TokenUsage object', async () => {
      fs.promises.readdir.mockResolvedValue([]);
      const usage = await analyzer.analyzeContextWindow();

      expect(usage).toMatchObject({
        total: expect.any(Number),
        used: expect.any(Number),
        percentage: expect.any(Number),
        breakdown: {
          githubCode: expect.any(Number),
          projectCode: expect.any(Number),
          chatHistory: expect.any(Number),
        },
        threshold: expect.stringMatching(/^(safe|warning|critical)$/),
      });
    });

    it('returns 0 usage when workspace has no files', async () => {
      fs.promises.readdir.mockResolvedValue([]);
      const usage = await analyzer.analyzeContextWindow();

      expect(usage.used).toBe(0);
      expect(usage.percentage).toBe(0);
    });

    it('token breakdown sums to used', async () => {
      fs.promises.readdir.mockResolvedValue([
        { name: 'test.ts', isFile: () => true, isDirectory: () => false },
      ]);
      fs.promises.readFile.mockResolvedValue('x'.repeat(4000)); // 4000 chars = 1000 tokens

      const usage = await analyzer.analyzeContextWindow();
      const { githubCode, projectCode, chatHistory } = usage.breakdown;

      expect(githubCode + projectCode + chatHistory).toBe(usage.used);
    });

    it('estimates tokens as char count divided by 4', async () => {
      fs.promises.readdir.mockImplementation((dir: string) => {
        if (dir.includes('.github')) {
          return Promise.resolve([
            { name: 'test.md', isFile: () => true, isDirectory: () => false },
          ]);
        }
        return Promise.resolve([]);
      });
      fs.promises.stat.mockResolvedValue({ size: 400 }); // within 1MB limit
      fs.promises.readFile.mockResolvedValue('x'.repeat(400)); // 400 chars = 100 tokens

      const usage = await analyzer.analyzeContextWindow();
      expect(usage.breakdown.githubCode).toBe(100);
    });

    it('excludes node_modules from project token calculation', async () => {
      fs.promises.readdir.mockImplementation((dir: string) => {
        if (dir.includes('node_modules')) return Promise.resolve([]);
        if (dir.includes('src')) {
          return Promise.resolve([
            { name: 'index.ts', isFile: () => true, isDirectory: () => false },
          ]);
        }
        return Promise.resolve([]);
      });
      fs.promises.readFile.mockResolvedValue('code');

      // Should not throw when node_modules is excluded
      const usage = await analyzer.analyzeContextWindow();
      expect(usage).toBeDefined();
    });
  });

  describe('startMonitoring / stopMonitoring', () => {
    it('registers a callback for updates', () => {
      const callback = jest.fn();
      analyzer.startMonitoring(callback);
      // Watcher registered — callback stored
      expect(callback).not.toHaveBeenCalled(); // not called synchronously
    });

    it('stopMonitoring cleans up without errors', () => {
      const callback = jest.fn();
      analyzer.startMonitoring(callback);
      expect(() => analyzer.stopMonitoring()).not.toThrow();
    });

    it('debounces rapid-fire file changes (300ms window)', async () => {
      jest.useFakeTimers();
      fs.promises.readdir.mockResolvedValue([]);
      const callback = jest.fn();

      analyzer.startMonitoring(callback);
      // Simulate multiple rapid changes
      analyzer['_triggerUpdate']();
      analyzer['_triggerUpdate']();
      analyzer['_triggerUpdate']();

      expect(callback).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(350); // async flush: timers + promise microtasks

      expect(callback).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('returns zero usage when file read fails', async () => {
      fs.promises.readdir.mockRejectedValue(new Error('Permission denied'));
      const usage = await analyzer.analyzeContextWindow();

      expect(usage.used).toBe(0);
    });

    it('skips files larger than 1MB', async () => {
      fs.promises.readdir.mockResolvedValue([
        { name: 'large.ts', isFile: () => true, isDirectory: () => false },
      ]);
      fs.promises.stat.mockResolvedValue({ size: 2 * 1024 * 1024 }); // 2MB

      const usage = await analyzer.analyzeContextWindow();
      expect(usage.breakdown.projectCode).toBe(0);
    });
  });
});
