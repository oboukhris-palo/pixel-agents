/**
 * Mock VS Code API for testing
 */

export enum ExtensionMode {
  Production = 1,
  Development = 2,
  Test = 3,
}

const mockListeners: { [key: string]: jest.Mock } = {
  onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
  onDidCreateFiles: jest.fn(() => ({ dispose: jest.fn() })),
  onDidDeleteFiles: jest.fn(() => ({ dispose: jest.fn() })),
  onDidOpenTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
  onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
  onDidChangeActiveTextEditor: jest.fn(() => ({ dispose: jest.fn() })),
  onDidStartTerminalShellExecution: jest.fn(() => ({ dispose: jest.fn() })),
  onDidEndTerminalShellExecution: jest.fn(() => ({ dispose: jest.fn() })),
};

export const workspace = {
  workspaceFolders: [] as any[],
  onDidChangeTextDocument: mockListeners.onDidChangeTextDocument,
  onDidCreateFiles: mockListeners.onDidCreateFiles,
  onDidDeleteFiles: mockListeners.onDidDeleteFiles,
  onDidOpenTextDocument: mockListeners.onDidOpenTextDocument,
  onDidChangeConfiguration: mockListeners.onDidChangeConfiguration,
} as any;

export const window = {
  onDidChangeActiveTextEditor: mockListeners.onDidChangeActiveTextEditor,
  onDidStartTerminalShellExecution: mockListeners.onDidStartTerminalShellExecution,
  onDidEndTerminalShellExecution: mockListeners.onDidEndTerminalShellExecution,
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  showInputBox: jest.fn(),
} as any;

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

export const extensions = {
  getExtension: jest.fn(),
};

export const Uri = {
  file: (path: string) => ({
    scheme: 'file',
    authority: '',
    path: path,
    query: '',
    fragment: '',
    fsPath: path,
    with: jest.fn(),
    toString: () => `file://${path}`,
  }),
};

export interface ExtensionContext {
  extensionMode: ExtensionMode;
  extensionPath: string;
  extension: any;
  globalStoragePath: string;
  globalState: any;
  logPath: string;
  storageUri: any;
  storagePath: string;
  subscriptions: any[];
  workspaceState: any;
  extensionUri: any;
  environmentVariableCollection: any;
  secrets: any;
}

export interface Webview {
  postMessage: (message: any) => void;
}

export interface WebviewViewResolveContext {
  state?: any;
}
