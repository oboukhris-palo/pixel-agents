import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import type { AgentState } from './types.js';
import {
	launchNewAgent,
	removeAgent,
	restoreAgents,
	persistAgents,
	sendExistingAgents,
	sendLayout,
} from './agentManager.js';
import { registerActivityListeners } from './activityDetector.js';
import { loadFurnitureAssets, sendAssetsToWebview, loadFloorTiles, sendFloorTilesToWebview, loadWallTiles, sendWallTilesToWebview, loadCharacterSprites, sendCharacterSpritesToWebview, loadDefaultLayout } from './assetLoader.js';
import { WORKSPACE_KEY_AGENT_SEATS, GLOBAL_KEY_SOUND_ENABLED } from './constants.js';
import { writeLayoutToFile, readLayoutFromFile, watchLayoutFile } from './layoutPersistence.js';
import type { LayoutWatcher } from './layoutPersistence.js';
import { loadAgentMetadata, type AgentMetadata } from './agentMetadata.js';
import { WorkflowDetector } from './workflowDetector.js';
import { DocumentWatcherService } from './documentWatcherService.js';
import { DocumentWatcherMessageHandler } from './documentWatcherMessageHandler.js';
import type { WorkflowState } from './types.js';

export class PixelAgentsViewProvider implements vscode.WebviewViewProvider {
	nextAgentId = { current: 1 };
	agents = new Map<number, AgentState>();
	webviewView: vscode.WebviewView | undefined;

	// Per-agent timers
	waitingTimers = new Map<number, ReturnType<typeof setTimeout>>();
	permissionTimers = new Map<number, ReturnType<typeof setTimeout>>();

	// Bundled default layout (loaded from assets/default-layout.json)
	defaultLayout: Record<string, unknown> | null = null;

	// Cross-window layout sync
	layoutWatcher: LayoutWatcher | null = null;

	// Workflow detector
	workflowDetector: WorkflowDetector | null = null;
	workflowWatcherDisposable: vscode.Disposable | null = null;

	// Document watcher (US-001-003)
	documentWatcherService: DocumentWatcherService | null = null;
	documentWatcherHandler: DocumentWatcherMessageHandler | null = null;
	documentWatcherOutputChannel: vscode.OutputChannel | null = null;

	// Agent metadata from .github/agents/
	agentMetadata = new Map<string, AgentMetadata>();

	constructor(private readonly context: vscode.ExtensionContext) {}

	private get extensionUri(): vscode.Uri {
		return this.context.extensionUri;
	}

	private get webview(): vscode.Webview | undefined {
		return this.webviewView?.webview;
	}

	private persistAgents = (): void => {
		persistAgents(this.agents, this.context);
	};

	resolveWebviewView(webviewView: vscode.WebviewView) {
		console.log('[Pixel Agents] 🎨 Webview resolving...');
		this.webviewView = webviewView;
		webviewView.webview.options = { enableScripts: true };
		webviewView.webview.html = getWebviewContent(webviewView.webview, this.extensionUri);

			webviewView.webview.onDidReceiveMessage(async (message) => {
			if (message.type === 'openAgent') {
				// Register activity listeners when first agent is created
				if (this.agents.size === 0) {
					console.log('[Pixel Agents] 🎮 Registering activity listeners...');
					registerActivityListeners(
						this.context,
						this.agents,
						this.waitingTimers,
						this.permissionTimers,
						() => this.webview,
						this.agentMetadata,
					);
				}
				
				await launchNewAgent(
					this.nextAgentId,
					this.agents,
					this.waitingTimers,
					this.permissionTimers,
					this.webview,
					this.persistAgents,
					message.folderPath as string | undefined,
				);
			} else if (message.type === 'closeAgent') {
				const agent = this.agents.get(message.id);
				if (agent) {
					removeAgent(
						message.id,
						this.agents,
						this.waitingTimers,
						this.permissionTimers,
						this.persistAgents,
					);
					this.webview?.postMessage({ type: 'agentClosed', id: message.id });
				}
			} else if (message.type === 'saveAgentSeats') {
				// Store seat assignments in a separate key (never touched by persistAgents)
				console.log(`[Pixel Agents] saveAgentSeats:`, JSON.stringify(message.seats));
				this.context.workspaceState.update(WORKSPACE_KEY_AGENT_SEATS, message.seats);
			} else if (message.type === 'saveLayout') {
				this.layoutWatcher?.markOwnWrite();
				writeLayoutToFile(message.layout as Record<string, unknown>);
			} else if (message.type === 'setSoundEnabled') {
				this.context.globalState.update(GLOBAL_KEY_SOUND_ENABLED, message.enabled);
			} else if (message.type === 'webviewReady') {
				restoreAgents(
					this.context,
					this.nextAgentId,
					this.agents,
					this.webview,
					this.persistAgents,
				);
				
				// Register activity listeners if any agents were restored
				if (this.agents.size > 0) {
					console.log('[Pixel Agents] 🎮 Registering activity listeners (restored agents)...');
					registerActivityListeners(
						this.context,
						this.agents,
						this.waitingTimers,
						this.permissionTimers,
						() => this.webview,
						this.agentMetadata,
					);
				}
				
				// Send persisted settings to webview
				const soundEnabled = this.context.globalState.get<boolean>(GLOBAL_KEY_SOUND_ENABLED, true);
				this.webview?.postMessage({ type: 'settingsLoaded', soundEnabled });

				// Send workspace folders to webview (only when multi-root)
				const wsFolders = vscode.workspace.workspaceFolders;
				if (wsFolders && wsFolders.length > 1) {
					this.webview?.postMessage({
						type: 'workspaceFolders',
						folders: wsFolders.map(f => ({ name: f.name, path: f.uri.fsPath })),
					});
				}

				const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
				console.log('[Extension] workspaceRoot:', workspaceRoot);

				// Load furniture assets BEFORE sending layout
				(async () => {
					try {
						console.log('[Extension] Loading furniture assets...');
						const extensionPath = this.extensionUri.fsPath;
						console.log('[Extension] extensionPath:', extensionPath);

						// Check bundled location first: extensionPath/dist/assets/
						const bundledAssetsDir = path.join(extensionPath, 'dist', 'assets');
						let assetsRoot: string | null = null;
						if (fs.existsSync(bundledAssetsDir)) {
							console.log('[Extension] Found bundled assets at dist/');
							assetsRoot = path.join(extensionPath, 'dist');
						} else if (workspaceRoot) {
							// Fall back to workspace root (development or external assets)
							console.log('[Extension] Trying workspace for assets...');
							assetsRoot = workspaceRoot;
						}

						if (!assetsRoot) {
							console.log('[Extension] ⚠️  No assets directory found');
							if (this.webview) {
								sendLayout(this.context, this.webview, this.defaultLayout);
								this.startLayoutWatcher();
							}
							return;
						}

						console.log('[Extension] Using assetsRoot:', assetsRoot);

						// Load bundled default layout
						this.defaultLayout = loadDefaultLayout(assetsRoot);

						// Load character sprites
						const charSprites = await loadCharacterSprites(assetsRoot);
						if (charSprites && this.webview) {
							console.log('[Extension] Character sprites loaded, sending to webview');
							sendCharacterSpritesToWebview(this.webview, charSprites);
						}

						// Load floor tiles
						const floorTiles = await loadFloorTiles(assetsRoot);
						if (floorTiles && this.webview) {
							console.log('[Extension] Floor tiles loaded, sending to webview');
							sendFloorTilesToWebview(this.webview, floorTiles);
						}

						// Load wall tiles
						const wallTiles = await loadWallTiles(assetsRoot);
						if (wallTiles && this.webview) {
							console.log('[Extension] Wall tiles loaded, sending to webview');
							sendWallTilesToWebview(this.webview, wallTiles);
						}

						const assets = await loadFurnitureAssets(assetsRoot);
						if (assets && this.webview) {
							console.log('[Extension] ✅ Assets loaded, sending to webview');
							sendAssetsToWebview(this.webview, assets);
						}

						// Load agent metadata from .github/agents/
						if (workspaceRoot) {
							const agentMetadata = await loadAgentMetadata(workspaceRoot);
							this.agentMetadata = agentMetadata; // Store for handoff logic
							if (agentMetadata.size > 0 && this.webview) {
								console.log('[Extension] ✅ Agent metadata loaded, sending to webview');
								const metadataArray = Array.from(agentMetadata.values());
								this.webview.postMessage({ 
									type: 'agentMetadataLoaded', 
									metadata: metadataArray 
								});
							}

							// Initialize workflow detector
							console.log('[Extension] 🔍 Initializing workflow detector...');
							this.workflowDetector = new WorkflowDetector(workspaceRoot);
							
							// Send initial state
							const initialState = this.workflowDetector.detectWorkflowState();
							if (this.webview) {
								this.webview.postMessage({
									type: 'workflowUpdated',
									state: initialState
								});
							}
							
							// Watch for changes
							this.workflowWatcherDisposable = this.workflowDetector.startWatching((state: WorkflowState) => {
								console.log('[Extension] 📊 Workflow state updated:', state);
								if (this.webview) {
									this.webview.postMessage({
										type: 'workflowUpdated',
										state
									});
								}
							});
							this.context.subscriptions.push(this.workflowWatcherDisposable);

							// Initialize document watcher (US-001-003)
							console.log('[Extension] 📄 Initializing document watcher...');
							
							// Create output channel for document watcher logging
							if (!this.documentWatcherOutputChannel) {
								this.documentWatcherOutputChannel = vscode.window.createOutputChannel('Pixel Agents: Document Watcher');
							}
							
							this.documentWatcherService = new DocumentWatcherService(
								workspaceRoot,
								true,
								this.documentWatcherOutputChannel
							);
							if (this.webview) {
								this.documentWatcherHandler = new DocumentWatcherMessageHandler(
									this.documentWatcherService,
									this.webview,
									this.documentWatcherOutputChannel
								);
								this.documentWatcherHandler.start();
							}
							this.documentWatcherService.start();
						}
					} catch (err) {
						console.error('[Extension] ❌ Error loading assets:', err);
					}
					// Always send saved layout (or null for default)
					if (this.webview) {
						console.log('[Extension] Sending saved layout');
						sendLayout(this.context, this.webview, this.defaultLayout);
						this.startLayoutWatcher();
					}
				})();

				sendExistingAgents(this.agents, this.context, this.webview);
			} else if (message.type === 'exportLayout') {
				const layout = readLayoutFromFile();
				if (!layout) {
					vscode.window.showWarningMessage('Pixel Agents: No saved layout to export.');
					return;
				}
				const uri = await vscode.window.showSaveDialog({
					filters: { 'JSON Files': ['json'] },
					defaultUri: vscode.Uri.file(path.join(os.homedir(), 'pixel-agents-layout.json')),
				});
				if (uri) {
					fs.writeFileSync(uri.fsPath, JSON.stringify(layout, null, 2), 'utf-8');
					vscode.window.showInformationMessage('Pixel Agents: Layout exported successfully.');
				}
			} else if (message.type === 'importLayout') {
				const uris = await vscode.window.showOpenDialog({
					filters: { 'JSON Files': ['json'] },
					canSelectMany: false,
				});
				if (!uris || uris.length === 0) {return;}
				try {
					const raw = fs.readFileSync(uris[0].fsPath, 'utf-8');
					const imported = JSON.parse(raw) as Record<string, unknown>;
					if (imported.version !== 1 || !Array.isArray(imported.tiles)) {
						vscode.window.showErrorMessage('Pixel Agents: Invalid layout file.');
						return;
					}
					this.layoutWatcher?.markOwnWrite();
					writeLayoutToFile(imported);
					this.webview?.postMessage({ type: 'layoutLoaded', layout: imported });
					vscode.window.showInformationMessage('Pixel Agents: Layout imported successfully.');
				} catch {
					vscode.window.showErrorMessage('Pixel Agents: Failed to read or parse layout file.');
				}
			}
		});
	}

	/** Export current saved layout to webview-ui/public/assets/default-layout.json (dev utility) */
	exportDefaultLayout(): void {
		const layout = readLayoutFromFile();
		if (!layout) {
			vscode.window.showWarningMessage('Pixel Agents: No saved layout found.');
			return;
		}
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			vscode.window.showErrorMessage('Pixel Agents: No workspace folder found.');
			return;
		}
		const targetPath = path.join(workspaceRoot, 'webview-ui', 'public', 'assets', 'default-layout.json');
		const json = JSON.stringify(layout, null, 2);
		fs.writeFileSync(targetPath, json, 'utf-8');
		vscode.window.showInformationMessage(`Pixel Agents: Default layout exported to ${targetPath}`);
	}

	private startLayoutWatcher(): void {
		if (this.layoutWatcher) {return;}
		this.layoutWatcher = watchLayoutFile((layout) => {
			console.log('[Pixel Agents] External layout change — pushing to webview');
			this.webview?.postMessage({ type: 'layoutLoaded', layout });
		});
	}

	/**
	 * LAYER 3: Send task progression update to webview
	 * 
	 * Sends real-time task progression state from backend to frontend
	 * with message throttling to prevent UI overload.
	 * 
	 * @param state - Current task progression state from TaskProgressionTracker
	 * 
	 * @example
	 * const state = tracker.getCurrentTaskProgression();
	 * provider.sendTaskProgressionUpdate(state);
	 */
	sendTaskProgressionUpdate(state: import('./types.js').TaskProgressionState): void {
		if (!this.webview) {
			return; // Webview not initialized yet
		}

		const message: import('./types.js').TaskProgressionMessage = {
			type: 'taskProgression',
			previous: state.previous,
			current: state.current,
			next: state.next,
		};

		this.webview.postMessage(message);
	}

	/**
	 * Send real-time agent activity update to the webview (US-001-002).
	 * Called by AgentActivityMonitor on 'agent-activity-update' event.
	 */
	sendAgentActivityUpdate(payload: import('./agentActivityTypes.js').AgentActivityState): void {
		if (!this.webview) return;
		this.webview.postMessage({ type: 'agent-activity-update', payload });
	}

	dispose() {
		this.layoutWatcher?.dispose();
		this.layoutWatcher = null;
		
		// Dispose document watcher (US-001-003)
		this.documentWatcherHandler?.stop();
		this.documentWatcherHandler = null;
		this.documentWatcherService?.stop();
		this.documentWatcherService = null;
		this.documentWatcherOutputChannel?.dispose();
		this.documentWatcherOutputChannel = null;
		
		for (const id of [...this.agents.keys()]) {
			removeAgent(
				id,
				this.agents,
				this.waitingTimers,
				this.permissionTimers,
				this.persistAgents,
			);
		}
	}
}

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
	const distPath = vscode.Uri.joinPath(extensionUri, 'dist', 'webview');
	const indexPath = vscode.Uri.joinPath(distPath, 'index.html').fsPath;

	let html = fs.readFileSync(indexPath, 'utf-8');

	html = html.replace(/(href|src)="\.\/([^"]+)"/g, (_match, attr, filePath) => {
		const fileUri = vscode.Uri.joinPath(distPath, filePath);
		const webviewUri = webview.asWebviewUri(fileUri);
		return `${attr}="${webviewUri}"`;
	});

	return html;
}
