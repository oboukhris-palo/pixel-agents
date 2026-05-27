/**
 * Layer 2: Implementation Plan Parser Service
 * Story: Pixel Agents v1.0.5 - UI/UX Enhancement
 *
 * Reads and parses implementation-plan.md files from the workspace.
 * Finds the current In Progress user story and aggregates task progression data.
 */

import * as vscode from 'vscode';
import {
  parseCheckboxLine,
  calculateCurrentCheckbox,
  LAYER_HEADER_PATTERN,
  type ImplementationPlanCheckbox,
  type ImplementationPlanTask,
  type TaskProgressionEnhanced,
  type LayerNumber,
} from './implementationPlanTypes';

/** Status pattern matching emoji + status text in user-stories.md */
const STATUS_PATTERN = /\*\*Status\*\*:\s*[^a-zA-Z]*(Not Started|In Progress|Implemented|Delivered)/;

/** Pattern to extract story ref from ## US-XXX-XXX: heading */
const STORY_HEADER_PATTERN = /^###\s+(US-[\d]+-[\d]+):/;

/**
 * ImplementationPlanParser
 *
 * Parses implementation-plan.md files and user-stories.md to build
 * TaskProgressionEnhanced payloads for the TaskProgressionBar component.
 */
export class ImplementationPlanParser {
  private outputChannel?: vscode.OutputChannel;

  constructor(
    private readonly workspaceRoot: vscode.Uri,
    outputChannel?: vscode.OutputChannel,
  ) {
    this.outputChannel = outputChannel;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Parse the implementation-plan.md for the given story and return a structured task.
   *
   * @param storyRef  - e.g. "US-001-002"
   * @param epicRef   - e.g. "EPIC-001"
   */
  async parseImplementationPlan(
    storyRef: string,
    epicRef: string,
  ): Promise<ImplementationPlanTask> {
    const planPath = this.buildPlanPath(storyRef, epicRef);
    try {
      const raw = await vscode.workspace.fs.readFile(planPath);
      const markdown = Buffer.isBuffer(raw) ? raw.toString('utf8') : new TextDecoder().decode(raw);
      const checkboxes = this.extractCheckboxes(markdown);
      const currentCheckbox = calculateCurrentCheckbox(checkboxes);
      const completed = checkboxes.filter(cb => cb.completed).length;

      return {
        storyRef,
        epicRef,
        title: this.extractTitle(markdown),
        checkboxes,
        totalCheckboxes: checkboxes.length,
        completedCheckboxes: completed,
        currentCheckbox,
      };
    } catch (err) {
      this.log(`parseImplementationPlan: could not read ${planPath.path} — ${err}`);
      return {
        storyRef,
        epicRef,
        title: '',
        checkboxes: [],
        totalCheckboxes: 0,
        completedCheckboxes: 0,
        currentCheckbox: null,
      };
    }
  }

  /**
   * Scan user-stories.md and return the storyRef + epicRef of the story
   * currently marked as "In Progress", or null if none found.
   */
  async findCurrentUserStory(): Promise<{ storyRef: string; epicRef: string } | null> {
    const storiesPath = vscode.Uri.joinPath(
      this.workspaceRoot,
      'docs', '05-implementation', 'user-stories.md',
    );
    try {
      const raw = await vscode.workspace.fs.readFile(storiesPath);
      const lines = (Buffer.isBuffer(raw) ? raw.toString('utf8') : new TextDecoder().decode(raw)).split('\n');

      let currentStoryRef: string | null = null;

      for (const line of lines) {
        const headerMatch = STORY_HEADER_PATTERN.exec(line);
        if (headerMatch) {
          currentStoryRef = headerMatch[1];
          continue;
        }

        if (currentStoryRef) {
          const statusMatch = STATUS_PATTERN.exec(line);
          if (statusMatch && statusMatch[1] === 'In Progress') {
            // Derive epicRef from storyRef (US-001-002 → EPIC-001)
            const epicRef = this.deriveEpicRef(currentStoryRef);
            return { storyRef: currentStoryRef, epicRef };
          }
          // Reset if we hit a new story header before finding status
          if (/^###\s+US-/.test(line) && line !== `### ${currentStoryRef}:`) {
            currentStoryRef = null;
          }
        }
      }
    } catch (err) {
      this.log(`findCurrentUserStory: could not read user-stories.md — ${err}`);
    }
    return null;
  }

  /**
   * Combine findCurrentUserStory + parseImplementationPlan into a single
   * TaskProgressionEnhanced payload, or null if no story is In Progress.
   */
  async getCurrentTaskProgression(): Promise<TaskProgressionEnhanced | null> {
    const current = await this.findCurrentUserStory();
    if (!current) { return null; }

    const task = await this.parseImplementationPlan(current.storyRef, current.epicRef);
    const checkboxes = task.checkboxes;
    const currentIdx = checkboxes.findIndex(cb => !cb.completed);
    const currentCheckbox = currentIdx >= 0 ? checkboxes[currentIdx] : null;
    const nextCheckbox = currentIdx >= 0 && currentIdx + 1 < checkboxes.length
      ? checkboxes[currentIdx + 1]
      : null;

    return {
      planPath: this.buildPlanPath(current.storyRef, current.epicRef).path,
      currentCheckbox,
      nextCheckbox,
      totalCheckboxes: task.totalCheckboxes,
      completedCheckboxes: task.completedCheckboxes,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Extract and assign layerNumber from "## Layer N:" headers,
   * then parse each checkbox line within that layer context.
   */
  private extractCheckboxes(markdown: string): ImplementationPlanCheckbox[] {
    const lines = markdown.split('\n');
    const results: ImplementationPlanCheckbox[] = [];
    let currentLayer: LayerNumber = 1;

    lines.forEach((line, idx) => {
      const layerMatch = LAYER_HEADER_PATTERN.exec(line);
      if (layerMatch) {
        const layerNum = parseInt(layerMatch[1], 10);
        if (layerNum >= 1 && layerNum <= 4) {
          currentLayer = layerNum as LayerNumber;
        }
        return;
      }

      const checkbox = parseCheckboxLine(line, idx + 1);
      if (checkbox) {
        results.push({ ...checkbox, layerNumber: currentLayer });
      }
    });

    return results;
  }

  /** Extract the first H1 title from the markdown */
  private extractTitle(markdown: string): string {
    const match = /^# (.+)$/m.exec(markdown);
    return match ? match[1].trim() : '';
  }

  /** Build vscode.Uri for the implementation-plan.md of a story */
  private buildPlanPath(storyRef: string, epicRef: string): vscode.Uri {
    return vscode.Uri.joinPath(
      this.workspaceRoot,
      'docs', '05-implementation', 'epics', epicRef,
      'user-stories', storyRef, 'implementation-plan.md',
    );
  }

  /** Derive epicRef from storyRef: "US-001-002" → "EPIC-001" */
  private deriveEpicRef(storyRef: string): string {
    const match = /^US-(\d+)-/.exec(storyRef);
    return match ? `EPIC-${match[1]}` : 'EPIC-001';
  }

  private log(message: string): void {
    this.outputChannel?.appendLine(`[ImplementationPlanParser] ${message}`);
  }
}
