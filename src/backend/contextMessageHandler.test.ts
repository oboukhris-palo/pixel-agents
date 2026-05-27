import { ContextMessageHandler, isContextWindowMessage } from './contextMessageHandler';
import type { TokenUsage } from './contextTypes';

const mockPostMessage = jest.fn();
jest.mock('vscode', () => ({
  window: {
    createOutputChannel: jest.fn(() => ({ appendLine: jest.fn(), dispose: jest.fn() })),
  },
}));

const sampleUsage: TokenUsage = {
  total: 128000,
  used: 64000,
  percentage: 50,
  breakdown: { githubCode: 30000, projectCode: 24000, chatHistory: 10000 },
  threshold: 'safe',
};

describe('ContextMessageHandler', () => {
  let handler: ContextMessageHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ContextMessageHandler(mockPostMessage);
  });

  describe('sendUpdate', () => {
    it('posts a context.window.update message', () => {
      handler.sendUpdate(sampleUsage);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      const msg = mockPostMessage.mock.calls[0][0];
      expect(msg.type).toBe('context.window.update');
    });

    it('message data includes TokenUsage', () => {
      handler.sendUpdate(sampleUsage);
      const msg = mockPostMessage.mock.calls[0][0];

      expect(msg.data.tokenUsage).toEqual(sampleUsage);
    });

    it('message includes ISO8601 timestamp', () => {
      handler.sendUpdate(sampleUsage);
      const msg = mockPostMessage.mock.calls[0][0];

      expect(msg.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('includes warnings array when threshold is warning', () => {
      const warningUsage = { ...sampleUsage, percentage: 75, threshold: 'warning' as const };
      handler.sendUpdate(warningUsage);
      const msg = mockPostMessage.mock.calls[0][0];

      expect(msg.data.warnings).toBeDefined();
      expect(msg.data.warnings.length).toBeGreaterThan(0);
      expect(msg.data.warnings[0].threshold).toBe(70);
    });

    it('includes warnings array when threshold is critical', () => {
      const criticalUsage = { ...sampleUsage, percentage: 92, threshold: 'critical' as const };
      handler.sendUpdate(criticalUsage);
      const msg = mockPostMessage.mock.calls[0][0];

      expect(msg.data.warnings).toBeDefined();
      expect(msg.data.warnings[0].threshold).toBe(90);
    });

    it('warnings array is empty for safe threshold', () => {
      handler.sendUpdate(sampleUsage);
      const msg = mockPostMessage.mock.calls[0][0];
      expect(msg.data.warnings).toHaveLength(0);
    });
  });

  describe('isContextWindowMessage type guard', () => {
    it('returns true for valid context.window.update message', () => {
      const msg = {
        type: 'context.window.update',
        data: { tokenUsage: sampleUsage, timestamp: new Date().toISOString(), warnings: [] },
      };
      expect(isContextWindowMessage(msg)).toBe(true);
    });

    it('returns false for unknown message type', () => {
      expect(isContextWindowMessage({ type: 'other.message', data: {} })).toBe(false);
    });

    it('returns false for null', () => {
      expect(isContextWindowMessage(null)).toBe(false);
    });

    it('returns false for missing data', () => {
      expect(isContextWindowMessage({ type: 'context.window.update' })).toBe(false);
    });
  });
});
