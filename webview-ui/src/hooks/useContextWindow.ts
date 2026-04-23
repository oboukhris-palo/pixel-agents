import { useState, useEffect, useCallback } from 'react';
import type { TokenUsage } from '../../../src/contextTypes';
import { isContextWindowMessage } from '../../../src/contextMessageHandler';

export interface UseContextWindowResult {
  tokenUsage: TokenUsage | null;
  loading: boolean;
  error: string | null;
}

/**
 * React hook that subscribes to context.window.update messages from the VS Code extension backend.
 * Provides current token usage state with loading/error handling.
 */
export function useContextWindow(): UseContextWindowResult {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    const message = event.data;
    if (!isContextWindowMessage(message)) return;

    try {
      setTokenUsage(message.data.tokenUsage);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to parse context window data');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return { tokenUsage, loading, error };
}
