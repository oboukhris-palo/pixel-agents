# Interview Synthesis Template

> **Template ID:** interview-synthesis-tmpl  
> **Purpose:** Convert raw stakeholder interview transcripts into structured, reusable markdown  
> **Used By:** BA agent, PO agent (during Phase 0 assessment or Route C interviews)  
> **Output Location:** `/docs/00-assessment/converted/`

---

## Interview Synthesis Report

### Interview Metadata

| Field | Value |
|-------|-------|
| **Interview ID** | `INT-{NNN}` |
| **Date** | `YYYY-MM-DD` |
| **Duration** | `{duration} minutes` |
| **Stakeholder** | `{Name}, {Title}` |
| **Stakeholder Type** | `Executive / Technical / Domain Expert / End User` |
| **Interviewer(s)** | `{Agent(s) or human names}` |
| **Source File** | `raw/{filename}` |
| **Conversion Date** | `YYYY-MM-DD` |
| **Confidence Level** | `HIGH / MEDIUM / LOW` |

---

### Executive Summary

{2-3 sentence summary of the most important takeaways from this interview}

---

### Key Insights

#### Business Context
- {Insight 1: business objectives, market position, competitive landscape}
- {Insight 2}

#### Pain Points & Challenges
- {Pain point 1: specific problem with impact}
- {Pain point 2}

#### Success Criteria & KPIs
- {Metric 1: measurable outcome the stakeholder expects}
- {Metric 2}

#### Technical Context
- {Technical insight 1: current stack, constraints, preferences}
- {Technical insight 2}

---

### Requirements Extracted

| Req ID | Category | Description | Priority | Confidence |
|--------|----------|-------------|----------|------------|
| `REQ-{NNN}` | Functional / Non-Functional / Business | {Description} | HIGH/MED/LOW | HIGH/MED/LOW |

---

### Quotes & Evidence

> "{Direct quote from stakeholder}" — {Context}

> "{Another significant quote}" — {Context}

---

### Follow-Up Actions

- [ ] {Action item 1} — Owner: {agent/person} — Due: {date}
- [ ] {Action item 2}

---

### Cross-References

- **Related Interviews:** `{INT-NNN}` (same topic area)
- **Related Requirements:** `{REQ-NNN}` (validates/contradicts)
- **Related Personas:** `{persona name}` (aligns with goals/pain points)

---

### Conversion Notes

- **Source Quality:** {Assessment of raw transcript quality}
- **Gaps Identified:** {Information that was unclear or missing}
- **Assumptions Made:** {Any interpretive assumptions during conversion}
