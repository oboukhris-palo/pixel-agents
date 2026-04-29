/**
 * Layer 1 Tests: Implementation Plan Types & Validation
 * Story: Pixel Agents v1.0.5 - UI/UX Enhancement
 * 
 * Tests validate type contracts for ImplementationPlanCheckbox, ImplementationPlanTask,
 * and FileOperation types along with their parsing utility functions.
 */

import {
  parseCheckboxLine,
  calculateCurrentCheckbox,
  isValidCheckbox,
  isValidFileOperation,
  type ImplementationPlanCheckbox,
  type ImplementationPlanTask,
  type FileOperation,
  type AgentActionEnhanced,
  CHECKBOX_LINE_PATTERN,
  LAYER_PHASE_PATTERN,
} from './implementationPlanTypes';

describe('ImplementationPlanCheckbox - Type Validation', () => {
  it('should accept valid layer numbers 1-4', () => {
    const validLayers: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
    validLayers.forEach(layer => {
      const checkbox: ImplementationPlanCheckbox = {
        layerNumber: layer,
        phase: 'RED',
        cycleNumber: 1,
        description: 'Test task',
        completed: false,
        lineNumber: 10,
      };
      expect(isValidCheckbox(checkbox)).toBe(true);
    });
  });

  it('should reject layer numbers outside 1-4', () => {
    const invalid = {
      layerNumber: 5 as any,
      phase: 'RED' as const,
      cycleNumber: 1,
      description: 'Test task',
      completed: false,
      lineNumber: 10,
    };
    expect(isValidCheckbox(invalid)).toBe(false);
  });

  it('should reject layer number 0', () => {
    const invalid = {
      layerNumber: 0 as any,
      phase: 'GREEN' as const,
      cycleNumber: 1,
      description: 'Test task',
      completed: false,
      lineNumber: 10,
    };
    expect(isValidCheckbox(invalid)).toBe(false);
  });

  it('should accept valid phase values RED, GREEN, REFACTOR', () => {
    const phases = ['RED', 'GREEN', 'REFACTOR'] as const;
    phases.forEach(phase => {
      const checkbox: ImplementationPlanCheckbox = {
        layerNumber: 1,
        phase,
        cycleNumber: 1,
        description: 'Test task',
        completed: false,
        lineNumber: 10,
      };
      expect(isValidCheckbox(checkbox)).toBe(true);
    });
  });

  it('should reject invalid phase values', () => {
    const invalid = {
      layerNumber: 1,
      phase: 'DEPLOY' as any,
      cycleNumber: 1,
      description: 'Test task',
      completed: false,
      lineNumber: 10,
    };
    expect(isValidCheckbox(invalid)).toBe(false);
  });

  it('should reject empty description', () => {
    const invalid = {
      layerNumber: 1,
      phase: 'RED' as const,
      cycleNumber: 1,
      description: '',
      completed: false,
      lineNumber: 10,
    };
    expect(isValidCheckbox(invalid)).toBe(false);
  });

  it('should reject negative cycle number', () => {
    const invalid = {
      layerNumber: 1,
      phase: 'RED' as const,
      cycleNumber: -1,
      description: 'Test task',
      completed: false,
      lineNumber: 10,
    };
    expect(isValidCheckbox(invalid)).toBe(false);
  });
});

describe('parseCheckboxLine()', () => {
  it('should parse a checked checkbox line', () => {
    const line = '- [x] RED Phase - Cycle 1: Create type definitions';
    const result = parseCheckboxLine(line, 42);
    
    expect(result).not.toBeNull();
    expect(result!.completed).toBe(true);
    expect(result!.phase).toBe('RED');
    expect(result!.cycleNumber).toBe(1);
    expect(result!.description).toBe('Create type definitions');
    expect(result!.lineNumber).toBe(42);
  });

  it('should parse an unchecked checkbox line', () => {
    const line = '- [ ] GREEN Phase - Cycle 2: Implement service';
    const result = parseCheckboxLine(line, 10);
    
    expect(result).not.toBeNull();
    expect(result!.completed).toBe(false);
    expect(result!.phase).toBe('GREEN');
    expect(result!.cycleNumber).toBe(2);
    expect(result!.description).toBe('Implement service');
  });

  it('should parse REFACTOR phase', () => {
    const line = '- [x] REFACTOR Phase - Cycle 3: Extract utility';
    const result = parseCheckboxLine(line, 5);
    
    expect(result).not.toBeNull();
    expect(result!.phase).toBe('REFACTOR');
    expect(result!.cycleNumber).toBe(3);
  });

  it('should return null for non-checkbox lines', () => {
    expect(parseCheckboxLine('## Layer 1: Types', 1)).toBeNull();
    expect(parseCheckboxLine('Some random text', 2)).toBeNull();
    expect(parseCheckboxLine('', 3)).toBeNull();
  });

  it('should return null for checkbox lines without phase pattern', () => {
    const line = '- [x] Create the main configuration file';
    const result = parseCheckboxLine(line, 1);
    // Generic checkboxes without RED|GREEN|REFACTOR phase pattern return null
    expect(result).toBeNull();
  });

  it('should handle multi-digit cycle numbers', () => {
    const line = '- [ ] RED Phase - Cycle 12: Write edge case tests';
    const result = parseCheckboxLine(line, 100);
    
    expect(result).not.toBeNull();
    expect(result!.cycleNumber).toBe(12);
  });

  it('should trim whitespace from description', () => {
    const line = '- [x] GREEN Phase - Cycle 1:   Implement with spaces  ';
    const result = parseCheckboxLine(line, 1);
    
    expect(result).not.toBeNull();
    expect(result!.description).toBe('Implement with spaces');
  });
});

describe('calculateCurrentCheckbox()', () => {
  it('should return first unchecked checkbox', () => {
    const checkboxes: ImplementationPlanCheckbox[] = [
      { layerNumber: 1, phase: 'RED', cycleNumber: 1, description: 'First task', completed: true, lineNumber: 1 },
      { layerNumber: 1, phase: 'GREEN', cycleNumber: 1, description: 'Second task', completed: false, lineNumber: 2 },
      { layerNumber: 1, phase: 'REFACTOR', cycleNumber: 1, description: 'Third task', completed: false, lineNumber: 3 },
    ];
    
    const current = calculateCurrentCheckbox(checkboxes);
    
    expect(current).not.toBeNull();
    expect(current!.description).toBe('Second task');
    expect(current!.phase).toBe('GREEN');
  });

  it('should return null when all checkboxes are complete', () => {
    const checkboxes: ImplementationPlanCheckbox[] = [
      { layerNumber: 1, phase: 'RED', cycleNumber: 1, description: 'Task 1', completed: true, lineNumber: 1 },
      { layerNumber: 1, phase: 'GREEN', cycleNumber: 1, description: 'Task 2', completed: true, lineNumber: 2 },
    ];
    
    expect(calculateCurrentCheckbox(checkboxes)).toBeNull();
  });

  it('should return null for empty array', () => {
    expect(calculateCurrentCheckbox([])).toBeNull();
  });

  it('should return the very first checkbox if none completed', () => {
    const checkboxes: ImplementationPlanCheckbox[] = [
      { layerNumber: 1, phase: 'RED', cycleNumber: 1, description: 'First', completed: false, lineNumber: 1 },
      { layerNumber: 1, phase: 'GREEN', cycleNumber: 1, description: 'Second', completed: false, lineNumber: 2 },
    ];
    
    const current = calculateCurrentCheckbox(checkboxes);
    expect(current!.description).toBe('First');
  });
});

describe('FileOperation - Type Validation', () => {
  it('should accept valid operation types', () => {
    const types = ['read', 'write', 'delete', 'rename'] as const;
    types.forEach(type => {
      const op: FileOperation = {
        type,
        filePath: 'src/example.ts',
        timestamp: Date.now(),
      };
      expect(isValidFileOperation(op)).toBe(true);
    });
  });

  it('should reject invalid operation types', () => {
    const invalid = {
      type: 'copy' as any,
      filePath: 'src/example.ts',
      timestamp: Date.now(),
    };
    expect(isValidFileOperation(invalid)).toBe(false);
  });

  it('should reject empty file path', () => {
    const invalid: FileOperation = {
      type: 'read',
      filePath: '',
      timestamp: Date.now(),
    };
    expect(isValidFileOperation(invalid)).toBe(false);
  });

  it('should reject negative timestamp', () => {
    const invalid: FileOperation = {
      type: 'write',
      filePath: 'src/file.ts',
      timestamp: -1,
    };
    expect(isValidFileOperation(invalid)).toBe(false);
  });
});

describe('AgentActionEnhanced - Type Contract', () => {
  it('should include fileOperations array in enhanced action', () => {
    const action: AgentActionEnhanced = {
      type: 'RED',
      cycle: 1,
      description: 'Writing tests',
      fileOperations: [
        { type: 'read', filePath: 'src/types.ts', timestamp: Date.now() },
        { type: 'write', filePath: 'src/types.test.ts', timestamp: Date.now() },
      ],
      lastUpdated: Date.now(),
    };
    
    expect(action.fileOperations).toHaveLength(2);
    expect(action.fileOperations[0].type).toBe('read');
    expect(action.fileOperations[1].type).toBe('write');
  });

  it('should allow empty fileOperations array', () => {
    const action: AgentActionEnhanced = {
      type: 'GREEN',
      cycle: 2,
      description: 'Implementing service',
      fileOperations: [],
      lastUpdated: Date.now(),
    };
    
    expect(action.fileOperations).toHaveLength(0);
  });

  it('should allow optional codeSnippet', () => {
    const withSnippet: AgentActionEnhanced = {
      type: 'REFACTOR',
      cycle: 3,
      description: 'Refactoring utilities',
      fileOperations: [],
      codeSnippet: 'const x = 1;',
      lastUpdated: Date.now(),
    };
    
    const withoutSnippet: AgentActionEnhanced = {
      type: 'RED',
      cycle: 1,
      description: 'Writing tests',
      fileOperations: [],
      lastUpdated: Date.now(),
    };
    
    expect(withSnippet.codeSnippet).toBe('const x = 1;');
    expect(withoutSnippet.codeSnippet).toBeUndefined();
  });
});

describe('Regex Pattern Constants', () => {
  it('CHECKBOX_LINE_PATTERN should match checkbox lines', () => {
    expect(CHECKBOX_LINE_PATTERN.test('- [x] Some task')).toBe(true);
    expect(CHECKBOX_LINE_PATTERN.test('- [ ] Some task')).toBe(true);
    expect(CHECKBOX_LINE_PATTERN.test('## Header')).toBe(false);
    expect(CHECKBOX_LINE_PATTERN.test('Plain text')).toBe(false);
  });

  it('LAYER_PHASE_PATTERN should match phase-cycle patterns', () => {
    expect(LAYER_PHASE_PATTERN.test('RED Phase - Cycle 1: description')).toBe(true);
    expect(LAYER_PHASE_PATTERN.test('GREEN Phase - Cycle 12: description')).toBe(true);
    expect(LAYER_PHASE_PATTERN.test('REFACTOR Phase - Cycle 3: description')).toBe(true);
    expect(LAYER_PHASE_PATTERN.test('Some other text')).toBe(false);
  });
});
