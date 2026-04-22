# Documentation Synthesis Template

> **Template ID:** documentation-synthesis-tmpl  
> **Purpose:** Convert raw client documentation (PDFs, Confluence exports, wikis) into structured markdown  
> **Used By:** BA agent, Architect agent (during Phase 0 assessment)  
> **Output Location:** `/docs/00-assessment/converted/`

---

## Documentation Synthesis Report

### Document Metadata

| Field | Value |
|-------|-------|
| **Synthesis ID** | `DOC-{NNN}` |
| **Source Document** | `{Original filename/title}` |
| **Source Type** | `PDF / Confluence / Wiki / SharePoint / ADR / Runbook / Other` |
| **Source Location** | `raw/{path/to/file}` |
| **Conversion Date** | `YYYY-MM-DD` |
| **Converted By** | `{Agent name}` |
| **Document Date** | `{Original document date or "Unknown"}` |
| **Staleness Risk** | `LOW (< 6 months) / MEDIUM (6-18 months) / HIGH (> 18 months) / UNKNOWN` |
| **Confidence Level** | `HIGH / MEDIUM / LOW` |

---

### Executive Summary

{2-3 sentence summary of what this document covers and its relevance to the project}

---

### Key Content Extracted

#### Architecture & Technical Details
- {Technical finding 1}
- {Technical finding 2}

#### Business Rules & Logic
- {Business rule 1}
- {Business rule 2}

#### Requirements & Specifications
- {Requirement or spec 1}
- {Requirement or spec 2}

#### Integration Points
- {External system or API 1}
- {Data flow or dependency 1}

---

### Data & Schema Information

| Entity/Table | Description | Key Fields | Relationships |
|-------------|-------------|------------|---------------|
| `{entity}` | {purpose} | {key fields} | {relationships} |

---

### Diagrams & Visual Content

{Description of any diagrams, screenshots, or visual content in the source document}

- **Diagram 1:** {Description, location in source, key takeaway}
- **Diagram 2:** {Description}

---

### Gaps & Ambiguities

| Gap ID | Area | Description | Impact | Recommended Action |
|--------|------|-------------|--------|-------------------|
| `GAP-{NNN}` | {Area} | {What's missing or unclear} | HIGH/MED/LOW | {Interview / Research / Assumption} |

---

### Cross-References

- **Related Documents:** `{DOC-NNN}` (complementary information)
- **Related Interviews:** `{INT-NNN}` (validates/clarifies)
- **Contradictions Found:** {Any conflicts with other sources}

---

### Conversion Notes

- **Source Quality:** {Assessment of original document quality}
- **Completeness:** {Percentage of source content that was extractable}
- **Assumptions Made:** {Any interpretive decisions during conversion}
- **Recommended Follow-Up:** {Specific questions or areas needing validation}
