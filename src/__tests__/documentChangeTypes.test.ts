/**
 * Layer 1 RED: Failing tests for DocumentChange types and validators
 * Story: US-001-003 - Real-Time Document Monitoring Engine
 * BDD: AC1 (file extension detection), AC4 (event type classification)
 */

import {
  FileChangeEvent,
  isValidDocumentChange,
  isMarkdownFile,
  isYamlFile,
  isFeatureFile,
  isDocumentFile,
  createDocumentChange,
  type DocumentChange,
  type ParsedMetrics,
  getDefaultParsedMetrics,
} from '../documentChangeTypes';

describe('FileChangeEvent enum', () => {
  it('has expected values', () => {
    expect(FileChangeEvent.Added).toBe('added');
    expect(FileChangeEvent.Modified).toBe('modified');
    expect(FileChangeEvent.Deleted).toBe('deleted');
    expect(FileChangeEvent.All).toBe('all');
  });
});

describe('isMarkdownFile', () => {
  it('returns true for .md files', () => {
    expect(isMarkdownFile('user-stories.md')).toBe(true);
    expect(isMarkdownFile('/docs/01-requirements/requirements.md')).toBe(true);
    expect(isMarkdownFile('README.MD')).toBe(true); // case-insensitive
  });

  it('returns false for non-.md files', () => {
    expect(isMarkdownFile('file.ts')).toBe(false);
    expect(isMarkdownFile('config.yml')).toBe(false);
    expect(isMarkdownFile('test.feature')).toBe(false);
    expect(isMarkdownFile('')).toBe(false);
  });
});

describe('isYamlFile', () => {
  it('returns true for .yml and .yaml files', () => {
    expect(isYamlFile('config.yml')).toBe(true);
    expect(isYamlFile('plan-approval.yaml')).toBe(true);
    expect(isYamlFile('/docs/plan.YML')).toBe(true); // case-insensitive
    expect(isYamlFile('settings.YAML')).toBe(true);
  });

  it('returns false for non-yaml files', () => {
    expect(isYamlFile('file.md')).toBe(false);
    expect(isYamlFile('test.feature')).toBe(false);
    expect(isYamlFile('')).toBe(false);
  });
});

describe('isFeatureFile', () => {
  it('returns true for .feature files', () => {
    expect(isFeatureFile('login.feature')).toBe(true);
    expect(isFeatureFile('/bdd-scenarios/auth.FEATURE')).toBe(true);
  });

  it('returns false for non-feature files', () => {
    expect(isFeatureFile('test.ts')).toBe(false);
    expect(isFeatureFile('README.md')).toBe(false);
    expect(isFeatureFile('')).toBe(false);
  });
});

describe('isDocumentFile', () => {
  it('returns true for markdown, yaml, or feature files', () => {
    expect(isDocumentFile('file.md')).toBe(true);
    expect(isDocumentFile('config.yml')).toBe(true);
    expect(isDocumentFile('config.yaml')).toBe(true);
    expect(isDocumentFile('test.feature')).toBe(true);
  });

  it('returns false for other file types', () => {
    expect(isDocumentFile('script.ts')).toBe(false);
    expect(isDocumentFile('image.png')).toBe(false);
    expect(isDocumentFile('')).toBe(false);
  });
});

describe('createDocumentChange factory', () => {
  it('creates a DocumentChange with correct fields', () => {
    const before = Date.now();
    const change = createDocumentChange('/docs/01-requirements/user-stories.md', FileChangeEvent.Modified);
    const after = Date.now();

    expect(change.path).toBe('/docs/01-requirements/user-stories.md');
    expect(change.changeType).toBe(FileChangeEvent.Modified);
    expect(change.timestamp).toBeGreaterThanOrEqual(before);
    expect(change.timestamp).toBeLessThanOrEqual(after);
    expect(change.isMarkdown).toBe(true);
    expect(change.isYaml).toBe(false);
    expect(change.isFeature).toBe(false);
  });

  it('creates a DocumentChange for yaml file', () => {
    const change = createDocumentChange('/docs/plan-approval.yaml', FileChangeEvent.Added);
    expect(change.isMarkdown).toBe(false);
    expect(change.isYaml).toBe(true);
    expect(change.isFeature).toBe(false);
    expect(change.changeType).toBe(FileChangeEvent.Added);
  });

  it('creates a DocumentChange for feature file', () => {
    const change = createDocumentChange('test.feature', FileChangeEvent.Deleted);
    expect(change.isMarkdown).toBe(false);
    expect(change.isYaml).toBe(false);
    expect(change.isFeature).toBe(true);
  });
});

describe('isValidDocumentChange', () => {
  it('returns true for valid DocumentChange', () => {
    const change: DocumentChange = {
      path: '/docs/user-stories.md',
      changeType: FileChangeEvent.Modified,
      timestamp: Date.now(),
      isMarkdown: true,
      isYaml: false,
      isFeature: false,
    };
    expect(isValidDocumentChange(change)).toBe(true);
  });

  it('returns false for null/undefined', () => {
    expect(isValidDocumentChange(null)).toBe(false);
    expect(isValidDocumentChange(undefined)).toBe(false);
  });

  it('returns false when path is empty', () => {
    const change: DocumentChange = {
      path: '',
      changeType: FileChangeEvent.Modified,
      timestamp: Date.now(),
      isMarkdown: true,
      isYaml: false,
      isFeature: false,
    };
    expect(isValidDocumentChange(change)).toBe(false);
  });

  it('returns false when changeType is invalid', () => {
    const change = {
      path: '/docs/file.md',
      changeType: 'invalid',
      timestamp: Date.now(),
      isMarkdown: true,
      isYaml: false,
      isFeature: false,
    };
    expect(isValidDocumentChange(change as unknown as DocumentChange)).toBe(false);
  });
});

describe('getDefaultParsedMetrics', () => {
  it('returns metrics with zero values', () => {
    const metrics: ParsedMetrics = getDefaultParsedMetrics();
    expect(metrics.storyCount).toBe(0);
    expect(metrics.epicsCount).toBe(0);
    expect(metrics.completionPercent).toBe(0);
    expect(metrics.lastUpdated).toBeDefined();
  });
});
