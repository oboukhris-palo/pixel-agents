import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface AgentMetadata {
	/** Agent file name without extension (e.g., "po", "dev-lead") */
	id: string;
	/** Display name from YAML frontmatter (e.g., "Product Owner") */
	name: string;
	/** Short description of agent's role */
	description: string;
	/** Optional argument hint */
	argumentHint?: string;
}

/**
 * Parse YAML frontmatter from an agent definition file.
 * Extracts: name, description, argumentHint
 */
function parseAgentFrontmatter(content: string): Omit<AgentMetadata, 'id'> | null {
	const match = content.match(/^---\s*\n([\s\S]+?)\n---/);
	if (!match) {
		return null;
	}

	const yaml = match[1];
	const nameMatch = yaml.match(/^name:\s*(.+)$/m);
	const descMatch = yaml.match(/^description:\s*(.+)$/m);
	const argMatch = yaml.match(/^argumentHint:\s*(.+)$/m);

	if (!nameMatch) {
		return null;
	}

	return {
		name: nameMatch[1].trim(),
		description: descMatch ? descMatch[1].trim() : '',
		argumentHint: argMatch ? argMatch[1].trim() : undefined,
	};
}

/**
 * Scan `.github/agents/` for agent definition files and extract metadata.
 * Returns a map of agent ID → metadata.
 */
export async function loadAgentMetadata(workspaceRoot: string): Promise<Map<string, AgentMetadata>> {
	const agentsDir = path.join(workspaceRoot, '.github', 'agents');
	const metadata = new Map<string, AgentMetadata>();

	try {
		const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(agentsDir));
		for (const [fileName, fileType] of files) {
			if (fileType !== vscode.FileType.File || !fileName.endsWith('.agent.md')) {
				continue;
			}

			const filePath = path.join(agentsDir, fileName);
			const content = fs.readFileSync(filePath, 'utf8');
			const parsed = parseAgentFrontmatter(content);

			if (parsed) {
				const id = fileName.replace(/\.agent\.md$/, '');
				metadata.set(id, { id, ...parsed });
			}
		}
	} catch (err) {
		console.warn('[Pixel Agents] Failed to load agent metadata from .github/agents/', err);
	}

	console.log(`[Pixel Agents] Loaded ${metadata.size} agent definitions:`, Array.from(metadata.keys()));
	return metadata;
}
