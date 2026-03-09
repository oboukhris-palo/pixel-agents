## Plan User Story Prompt

Parameters:
- STORY_REF: e.g., US-001
- EPIC: e.g., E001 Authentication
- LAYER: database|backend|config|frontend (current focus)

Prompt:

"Plan implementation for {STORY_REF} under {EPIC}.

Deliver:
- Update or create `/docs/user-stories/{STORY_REF}/implementation-plan.md` with the standard structure (four layers, files to create, BDD coverage, TDD approach, constraints).
- Ensure `/docs/user-stories/{STORY_REF}/{STORY_REF}-HANDOFF.md` exists and summarizes next steps for TDD.
- Include links to BDD scenarios under `/docs/user-stories/{STORY_REF}/bdd-scenarios/`.
- Keep plan concise and test-driven.
"
