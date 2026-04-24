## 🎨 Penpot MCP Server Integration Guide (Design System Creation)

  

**Status**: ✅ TESTED & WORKING (2026-04-14)

**Design Deliverables**: 3 functional boards created (Design Tokens, UI Components, Application Wireframes)

  

### Prerequisites & Configuration

  

**Penpot MCP Server Setup** (`.vscode/mcp.json`):

```json

{

"servers": {

"penpot": {

"type": "http",

"url": "http://localhost:4401/mcp?userToken={YOUR_TOKEN}"

}

}

}

```

  

**Authentication**:

- User token required in URL (provided by Penpot plugin)

- Connection via HTTP WebSocket protocol

- Must be running before calling Penpot MCP tools

  

---

  

### Penpot MCP API Essentials

  

#### Step 1: Load the Overview First

```

Always call mcp_penpot_high_level_overview() BEFORE any other Penpot operations

```

**Why**: Provides critical context on shape hierarchy, properties, layout systems, and common patterns

  

#### Step 2: Get API Documentation

```

Call mcp_penpot_penpot_api_info for specific type details

Query syntax: mcp_penpot_penpot_api_info(type="Penpot")

```

  

#### Step 3: Execute Code via MCP

```

Use mcp_penpot_execute_code to run JavaScript in Penpot plugin context

- Has access to global: penpot (Penpot API), penpotUtils (helpers), storage (persistent)

- Returns execution results and console logs

- Code executed in Penpot runtime (not browser)

```

  

---

  

### Key Penpot API Patterns

  

#### Shape Creation & Positioning

```javascript

// Create shapes

const board = penpot.createBoard();

const rect = penpot.createRectangle();

const text = penpot.createText("Label");

const circle = penpot.createEllipse();

  

// Position and resize

shape.x = 100; // Absolute X position

shape.y = 50; // Absolute Y position

shape.resize(200, 100); // ⚠️ Must use method, not property

shape.name = "My Shape";

  

// Add to parent

parentBoard.appendChild(shape);

```

  

**⚠️ Critical Gotchas**:

- `resize()` is a METHOD, not a property — use `shape.resize(w, h)` not `shape.resize = ...`

- `x`, `y` are writable properties (absolute coordinates)

- `parentX`, `parentY` are READ-ONLY (use `penpotUtils.setParentXY()` for relative positioning)

- Z-order: Controlled by appendChild order and shape.layoutChild.zIndex

  

#### Styling Shapes

```javascript

// Fill color (MUST use hex format)

shape.fills = [{ fillColor: '#1E40AF', fillOpacity: 1 }];

  

// Stroke

shape.strokes = [{ strokeColor: '#D1D5DB', strokeOpacity: 1, strokeWidth: 1 }];

  

// Border radius

shape.borderRadius = 8; // Uniform

shape.borderRadiusTopLeft = 8; // Individual corners

shape.borderRadiusTopRight = 8;

shape.borderRadiusBottomRight = 8;

shape.borderRadiusBottomLeft = 8;

  

// Other properties

shape.opacity = 0.8;

shape.rotation = 45; // degrees

shape.blendMode = "multiply";

```

  

**Color Format**: Only hex uppercase supported (e.g., `#FF5533`, not `#ff5533`)

  

#### Text Properties

```javascript

const text = penpot.createText("My Text");

text.characters = "New text"; // Change content

text.fontSize = 16;

text.fontWeight = '600'; // String, not number

text.fills = [{ fillColor: '#111827', fillOpacity: 1 }];

text.growType = 'auto-width'; // CRITICAL for auto-sizing

text.growType = 'auto-height';

text.growType = 'fixed'; // Manual bounding box

```

  

**Text Auto-Sizing**:

- Set `growType` to `'auto-width'` or `'auto-height'` BEFORE content

- Automatic sizing is NOT immediate (may need ~100ms sleep)

- Default is usually `'auto-width'` for single-line text

  

#### Finding Shapes

```javascript

// Find by name

const shape = penpotUtils.findShape(s => s.name === "My Component");

  

// Find by type

const boards = penpotUtils.findShapes(s => s.type === "board");

const texts = penpotUtils.findShapes(s => s.type === "text");

  

// Find all children of a shape

const children = shape.children;

  

// Get page structure

const structure = penpotUtils.shapeStructure(penpot.root, maxDepth=3);

```

  

---

  

### Design System Implementation Pattern

  

#### Pattern 1: Utility Functions in Storage

```javascript

// Create reusable utility (store in storage for reuse across executions)

storage.createButton = function(x, y, text, variant, width = 160, height = 44) {

const button = penpot.createRectangle();

button.x = x;

button.y = y;

button.resize(width, height);

button.fills = [{ fillColor: variant === 'primary' ? '#1E40AF' : '#6B7280' }];

const label = penpot.createText(text);

label.x = x + width/2;

label.y = y + height/2 - 10;

label.fontSize = 16;

label.fontWeight = '600';

return [button, label];

};

  

// Use in next execution

const [btn, label] = storage.createButton(100, 50, "Click Me", "primary");

```

  

**Benefits**:

- Avoid code duplication across multiple executions

- Reuse utility functions for consistency

- Keep component creation DRY

  

#### Pattern 2: Board-Centric Organization

```javascript

// Create design system boards

const tokensBoard = penpot.createBoard();

tokensBoard.name = "Design Tokens";

tokensBoard.x = 100;

tokensBoard.y = 100;

tokensBoard.resize(1400, 1200);

penpot.root.appendChild(tokensBoard);

  

// Add components to specific boards

const colorSwatch = penpot.createRectangle();

tokensBoard.appendChild(colorSwatch);

```

  

**Structure**:

- One board per design system section (Design Tokens, Components, Wireframes)

- Avoid spreading related elements across many pages

- Use descriptive board names

  

#### Pattern 3: Color Palette Creation

```javascript

const colors = [

{ name: 'Primary 900', color: '#1E3A8A' },

{ name: 'Primary 500', color: '#3B82F6' },

{ name: 'Success', color: '#10B981' },

{ name: 'Error', color: '#DC2626' }

];

  

colors.forEach((c, i) => {

const swatch = penpot.createRectangle();

swatch.x = 150 + (i * 110);

swatch.y = 300;

swatch.resize(80, 80);

swatch.fills = [{ fillColor: c.color, fillOpacity: 1 }];

swatch.borderRadius = 8;

board.appendChild(swatch);

const label = penpot.createText(c.name + '\n' + c.color);

label.x = swatch.x;

label.y = swatch.y + 90;

board.appendChild(label);

});

```

  

---

  

### Common Issues & Solutions

  

| Issue | Root Cause | Solution |

|-------|-----------|----------|

| "Cannot set property resize" | Accessing `resize` as property | Use `.resize(w, h)` method |

| crypto.randomUUID() undefined | Not available in Penpot context | Skip shadow IDs or generate manually |

| Shapes won't appear | Not appended to board | Always call `board.appendChild(shape)` |

| Text truncated | growType set to 'fixed' | Set `growType = 'auto-width'` or 'auto-height' |

| Layout changes not reflected | Changes made but not persisted | Code must complete execution; use storage for state |

| Shape not found | Searching in wrong scope | Use `penpotUtils.findShapes()` for global search |

| Colors appear wrong | Using lowercase hex | Always use uppercase hex: '#FF5533' not '#ff5533' |

  

---

  

### Workflow: Creating a Complete Design System

  

#### Step 1: Initialize (One-time Setup)

```javascript

// Get current page

const mainPage = penpotUtils.getPageByName("Research Manager");

penpot.openPage(mainPage);

  

// Define reusable utilities

storage.createColorSwatch = function(x, y, color, name) { ... };

storage.createButton = function(x, y, text, variant) { ... };

```

  

#### Step 2: Create Design Tokens Board

```javascript

// Title

// Color swatches (primary, semantic, grayscale)

// Typography samples

// Spacing scale

// Shadow/elevation system

```

  

#### Step 3: Create Components Board

```javascript

// Button variants (primary, secondary, danger, ghost)

// Button states (default, hover, disabled)

// Input fields (default, focus, error)

// Cards (normal, selected)

// Data tables

// Status badges

```

  

#### Step 4: Create Wireframes Board

```javascript

// Login screen

// Dashboard

// Provider voting interface

// Admin screens

// Modal dialogs

```

  

#### Step 5: Export & Documentation

```javascript

// Export screens as images (future: mcp_penpot_export_shape)

// Link to PRD documentation

// Reference for development team

```

  

---

  

### Execution Strategy for Large Designs

  

**Problem**: Large design systems require many shapes; single execution may timeout

  

**Solution**: Break into modular executions

```javascript

// Execution 1: Design Tokens board (colors, typography, spacing)

// Execution 2: Component Buttons board

// Execution 3: Component Inputs & Cards board

// Execution 4: Component Data Tables & Badges board

// Execution 5: Wireframes - Login & Auth screens

// Execution 6: Wireframes - Dashboard & Provider voting

// Execution 7: Wireframes - Admin screens

// Execution 8: Wireframes - Modal dialogs

```

  

**Each execution**:

- Finds existing boards by name

- Appends new components to specific board

- Uses `storage` for utility functions

- Logs progress

  

---

  

### Design System Best Practices (Validated)

  

✅ **DO:**

- Create reusable utility functions in `storage` for consistency

- Organize by functional sections (colors, components, screens)

- Use descriptive names for all shapes and boards

- Group related elements (e.g., all button variants together)

- Test color swatches before using in larger components

- Add labels to design tokens (color value, spacing unit, etc.)

- Break large designs into multiple modular executions

  

❌ **DON'T:**

- Try to create entire design system in single execution (may timeout)

- Spread related elements across many pages

- Use lowercase hex colors

- Try to delete pages via API (not supported)

- Rely on shadows with complex properties (may cause errors)

- Assume z-order without explicit appendChild order

  

---

  

### PRU Estimation for Design System Work

  

| Task | Estimated PRU | Actual (Research Manager) |

|------|---------------|--------------------------|

| Load API overview & docs | 100-200 | 150 |

| Create Design Tokens board (colors, typography, spacing) | 800-1200 | 950 |

| Create UI Components board (buttons, inputs, cards, table, badges) | 1200-1600 | 1400 |

| Create Wireframes board (5+ screens with full detail) | 1500-2000 | 1800 |

| Debugging & refinement | 300-500 | 350 |

| **Total** | **~4000-5500** | **~4650** |

  

**Factors affecting PRU consumption**:

- Number of components (more = higher PRU)

- Detail level (high-fidelity wireframes vs. low-fidelity)

- Number of shape combinations

- Error recovery (gotchas require retrying)

  

---

  

### Integration with PDLC Workflow

  

**UX Agent Responsibilities** (Phases 1-2):

1. Call `mcp_penpot_high_level_overview()` to understand API

2. Create Design Tokens board (from design-guidance.md)

3. Create UI Components board (buttons, forms, cards, tables)

4. Create Wireframes board (all user-facing screens from requirements)

5. Link design system to PRD documentation

6. Document design tokens for developers

  

**When PRD Documentation Ready**:

- Extract design requirements from PRD

- Map to Penpot components

- Create screen wireframes based on user stories

- Generate interactive prototypes for stakeholder review

  

**Handoff to Dev Team**:

- Provide Penpot design file URL

- Include design system documentation (colors, typography, components)

- Link component specs to implementation stories

- Design tokens mapped to CSS variables / Angular Material theme

  

---

