---
description: Guidelines for maintaining and updating the glossary
applyTo: "00-context/glossary.md"
---
# Glossary Maintenance Instructions

## Overview

This document provides systematic instructions for maintaining and updating project glossaries using the AI-first delivery methodology. These instructions follow knowledge management best practices and transform terminology management into structured glossary maintenance that ensures consistent definitions, eliminates ambiguity, and maintains current technical vocabulary across all project documentation and communications.

## Process Overview

**Glossary Maintenance Implementation** transforms terminology management requirements into systematic glossary updates that deliver consistent definitions, eliminate ambiguous terms, maintain current technical vocabulary, and ensure all stakeholders share common understanding through structured definition management and regular review processes across all project artifacts.

## Implementation Process

## STATUS: ALWAYS APPLY

These instructions govern how to maintain, update, and validate terms in the Edenred AI-first delivery assessment glossary.

---

## Core Principle: Two-Level Validation

The glossary uses a **pragmatic, two-level validation approach** to balance rigor with velocity:

### Level 1: Direct Validation [VALIDATED]

**Criteria:** Mark as **[VALIDATED]** immediately when:
- ✅ Confirmed by **domain experts** in their area of expertise:
  - Tech Leads for technical architecture, tools, practices
  - Scrum Masters / Agile Leads for ceremonies, governance, processes
  - QA Leads for testing tools and practices
  - Product Owners for product management practices
  - Operations leads for infrastructure and tooling
- ✅ **Operational facts** currently in use (tools, ceremonies, team structures)
- ✅ Documented in **official artifacts** (internal guides, documentation, recorded demos)
- ✅ Observable during **meetings or sessions** (PI Planning, Factory Demo, etc.)

**Examples:**
- Product Board → Confirmed by Amel Limam (Agile Delivery Lead) = **[VALIDATED]**
- Factory Demo → Existing weekly ceremony = **[VALIDATED]**
- OpsGenie → Tool in production use = **[VALIDATED]**
- Smart SDK → Confirmed by Tech Lead = **[VALIDATED]**

### Level 2: Strategic Validation [TO BE VALIDATED]

**Criteria:** Mark as **[TO BE VALIDATED]** when:
- ⚠️ **Strategic decisions** requiring executive alignment (CTO, CIO, CPO level)
- ⚠️ **Organizational changes** or restructuring initiatives
- ⚠️ **Budget or resource allocation** topics
- ⚠️ **Ambiguities** requiring arbitration between conflicting sources
- ⚠️ **Future programs** or initiatives not yet formally announced
- ⚠️ **Cross-platform strategies** affecting multiple business units

**Examples:**
- Convergence strategy across platforms = **[TO BE VALIDATED]**
- POC budget and timeline = **[TO BE VALIDATED]**
- Future program names (Summit, OneHub) = **[TO BE VALIDATED]**
- GCC organization structure = **[TO BE VALIDATED]**

**Validation Path:** These terms are reviewed and validated during:
- STEERCO meetings (Gil Cruveiller, Nao, Frédéric Nguyen, CTOs)
- Checkpoint Engagement sessions with extended leadership
- Direct confirmation with executive sponsors

### Level 3: Pending Context [PENDING CONTEXT]

**Criteria:** Mark as **[PENDING CONTEXT]** when:
- ❓ Term mentioned but **definition unclear** or incomplete
- ❓ **Conflicting information** from multiple sources needs reconciliation
- ❓ Requires **technical clarification** from subject matter experts
- ❓ **Acronym or abbreviation** without confirmed expansion

**Action:** Schedule follow-up interview or request documentation to clarify.

**Examples:**
- Navigator → Mentioned but unclear if role or tool = **[PENDING CONTEXT]**
- Path → Service mentioned but purpose unclear = **[PENDING CONTEXT]**

---

## When to Update the Glossary

### 1. After Every Interview or Meeting

**Process:**
1. Review meeting report (CR) for new terms, tools, processes, or concepts
2. Check if term already exists in glossary
3. If new → Add immediately with appropriate validation tag
4. If exists → Enhance definition with new insights or sources

**Timing:** Update glossary **within 24 hours** of meeting report completion.

### 2. When Contradictory Information Emerges

**Process:**
1. Document both perspectives in the term definition
2. Mark as **[PENDING CONTEXT]** or **[TO BE VALIDATED]**
3. Note the contradiction explicitly: "Note: Conflicting information from [Source A] and [Source B]"
4. Schedule clarification meeting or ask during next interview

### 3. After STEERCO Meetings

**Process:**
1. Promote **[TO BE VALIDATED]** terms confirmed by executives to **[VALIDATED]**
2. Add any strategic decisions or directions as new terms
3. Update version history with STEERCO validation note

### 4. When Official Documentation Is Shared

**Process:**
1. Enhance existing terms with references to official docs
2. Validate previously uncertain terms if confirmed by documentation
3. Add document reference to "Sources & References" section

---

## Format Standards

### Term Entry Structure

```markdown
**Term Name** [VALIDATION STATUS]
- **Definition:** Clear, concise definition (1-2 sentences)
- **Context:** How it's used in Edenred context, specific details
- **Usage:** (Optional) Maturity level, adoption rate, challenges
- **Related Terms:** (Optional) Cross-references to related concepts
- **Source:** Interview name (Date), meeting CR, or document reference
```

### Validation Status Tags

Use exactly these three tags:
- `[VALIDATED]` - Green light, confirmed by appropriate authority
- `[TO BE VALIDATED]` - Yellow, pending strategic confirmation
- `[PENDING CONTEXT]` - Red, needs clarification or additional information

### Source Attribution

Always include source with format:
- Interview: `Source: [Person Name] Interview (YYYY-MM-DD)`
- Meeting: `Source: [Meeting Name] (YYYY-MM-DD)`
- Document: `Source: [Document Name], [Section/Page]`
- Multiple sources: `Source: [Source 1], [Source 2]`

### Cross-References

When a term relates to another glossary term, use Markdown links:
```markdown
- **Related Terms:** [PI Planning](#pi-planning-program-increment-planning), [Factory Demo](#factory-demo)
```

---

## Categorization Rules

### Organizational Structure & Roles
- Leadership roles (CIO, CTO, CPO, etc.)
- Team structures (Squad, Tribe, Community of Practice)
- Specific roles (Tech Lead, QA Lead, Scrum Master, etc.)

### Edenred Platforms & Programs
- Current platforms (Smarter, Explorer, Reward Gateway)
- Future programs (Summit, OneHub, Mobility)
- Business domains (Merchant, Client, User, Employee)

### AI-first Delivery Methodology & Concepts
- Methodology principles (Gen-e2, AI-First Delivery)
- Assessment dimensions (Maturity Assessment, Baseline Metrics)
- Technical concepts (MCP Server, Mono Repository, AI Agents)

### Governance & Ceremonies
- Meetings (STEERCO, PI Planning, Factory Demo, Inspect & Adapt)
- Deliverables (Maturity Report, Implementation Plan, Capability Gap Matrix)

### Tools & Platforms
- Collaboration tools (Teams, Miro, Confluence)
- Development tools (Jira, GitHub, Product Board)
- Operations tools (OpsGenie, EasyBI)
- Internal platforms (Smart SDK, Smart Ops)

### Organizational Risks & Challenges
- Identified risks (Toxic AI, System Interdependencies)
- Constraints (Capacity Disconnect, Documentation Debt)

### Communities & Collaboration
- Communities of Practice (Agile, Engineering, QA, AI, Product, Data)

### Acronyms & Abbreviations
- Alphabetical table with expansions and definitions

### Locations & Offices
- Office locations and their associated teams

---

## Version History Management

### When to Update Version

Update version number and history when:
- Adding 3+ new terms from an interview
- Promoting multiple terms from [TO BE VALIDATED] to [VALIDATED]
- Restructuring sections or categories
- Updating validation process or guidelines

### Version Format

```markdown
- **v1.X (YYYY-MM-DD)**: Brief summary of changes - Key additions: [Term 1, Term 2, Term 3]; Major updates: [Area updated]; Process changes: [What changed]
```

### Update "Last Updated" Date

Update the date at the top of the document whenever any change is made, even minor ones.

---

## Quality Checks

### Before Adding a New Term

- [ ] Term doesn't already exist in glossary (search for variations)
- [ ] Definition is clear and specific to Edenred context
- [ ] Appropriate validation tag applied based on criteria above
- [ ] Source properly attributed with date
- [ ] Placed in correct category section
- [ ] Cross-references added to related terms if applicable

### Monthly Glossary Review

Conduct monthly review to:
- [ ] Identify **[PENDING CONTEXT]** terms > 2 weeks old → schedule clarification
- [ ] Identify **[TO BE VALIDATED]** terms > 4 weeks old → escalate to STEERCO agenda
- [ ] Check for orphaned terms (mentioned in CRs but not in glossary)
- [ ] Verify all recent interview terms have been added
- [ ] Update "Terms Requiring Immediate Validation" section

---

## Integration with Other Documents

### Glossary Links in Meeting Reports (CRs)

When writing CRs, link to glossary terms using:
```markdown
See [glossary](../../../00-context/glossary.md#term-name) for definition.
```

### Terminology Consistency

All documents must use terms **exactly as defined** in the glossary. If a stakeholder uses different terminology:
1. Note the variation in the glossary entry
2. Use the glossary standard term in deliverables
3. Include stakeholder's term as "Also known as: [alternative term]"

### Stakeholder Map Alignment

When adding new people to glossary:
- Update [stakeholder map](../00-context/stakeholder-map.md) simultaneously
- Ensure role titles match between documents

---

## Escalation Path

### When to Escalate

Escalate to Thibault Celier (Assessment Lead) when:
- Conflicting information cannot be reconciled
- Strategic term validation is blocking deliverable completion
- Multiple sources provide contradictory definitions
- New term has significant implications for assessment scope

### STEERCO Agenda Items

Add glossary validation to STEERCO agenda when:
- 5+ strategic terms pending validation
- Critical path term needs executive confirmation
- Organizational structure changes require validation

---

## Examples

### Example 1: Adding Term from Interview

**Scenario:** During interview, Amel mentions "Exploration Box" as pre-PI Planning process.

**Action:**
1. Add to "Governance & Ceremonies" section
2. Mark as **[VALIDATED]** (operational process confirmed by Agile Lead)
3. Format:
```markdown
**Exploration Box** [VALIDATED]
- **Definition:** Pre-PI initiative refinement mechanism where Product Owners and Business Analysts shape initiatives before PI Planning
- **Activities:** User research, technical feasibility assessment, effort estimation, prioritization
- **Purpose:** Reduce "surprises" during PI Planning by preparing initiatives upstream
- **Tools:** Product Board for backlog management
- **Source:** Amel Limam Interview (2026-01-22)
```

### Example 2: Strategic Term Pending Validation

**Scenario:** Frédéric mentions "GCC formation" with organizational implications.

**Action:**
1. Add to "Organizational Structure & Roles" section
2. Mark as **[TO BE VALIDATED]** (strategic organizational change)
3. Add to STEERCO agenda for next meeting
4. Format:
```markdown
**Global Capability Center (GCC)** [TO BE VALIDATED]
- **Definition:** Centralized capability center consolidating tech resources across Smarter, Explorer, and Reward Gateway platforms
- **Context:** Organizational initiative to standardize practices and share resources across platforms
- **Impact:** May affect team structures, reporting lines, and governance
- **Source:** Frédéric Nguyen Interview (2026-01-22)
- **Note:** Pending confirmation of scope and timeline in STEERCO
```

### Example 3: Term Needing Clarification

**Scenario:** "Navigator" mentioned without clear context.

**Action:**
1. Add to appropriate section (best guess)
2. Mark as **[PENDING CONTEXT]**
3. Add to follow-up questions for next relevant interview
4. Format:
```markdown
**Navigator** [PENDING CONTEXT]
- **Definition:** Role or tool for managing merchant network [requires clarification]
- **Context:** Mentioned in context of Merchant squad capabilities
- **Source:** Amel Limam Interview (2026-01-22)
- **Follow-up:** Clarify with Guillaume Masson (Merchant Tech Lead) - is this a role, tool, or process?
```

---

## Don't

❌ **Don't speculate** on definitions - if unclear, mark **[PENDING CONTEXT]** and schedule clarification
❌ **Don't skip source attribution** - always cite where information came from
❌ **Don't use abbreviations** without defining them first in the Acronyms section
❌ **Don't leave terms unvalidated** - apply appropriate tag immediately
❌ **Don't wait for STEERCO** to validate operational/factual terms - trust domain experts
❌ **Don't create duplicate entries** - search first, enhance existing entries
❌ **Don't forget cross-references** - link related terms for navigation

## Do

✅ **Do trust domain experts** for operational terms in their area
✅ **Do update promptly** after each interview (within 24 hours)
✅ **Do provide context** specific to Edenred's situation
✅ **Do cite multiple sources** when available for richer context
✅ **Do maintain consistent formatting** across all entries
✅ **Do version the glossary** when significant updates are made
✅ **Do review monthly** to catch stale pending validations

---

**Owner:** Thibault Celier (Assessment Lead)  
**Reviewers:** Sami Henchiri (Engagement Lead), Gil Cruveiller (Sponsor)  
**Last Updated:** January 28, 2026
