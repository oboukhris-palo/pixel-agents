## Write Tests Launcher (RED Phase)

Use with the TDD RED agent to create one failing test mapped to BDD:

Parameters:
- STORY_REF: US-XXX
- LAYER: database|backend|config|frontend
- BDD_FILE: path to feature file line (e.g., features/auth/register.feature:12)

Prompt:
"Write one failing test for {STORY_REF} ({LAYER}). Map to {BDD_FILE}. Ensure AAA structure and verify it fails for the right reason. Update `/docs/tdd.execution.md` and the handoff file `/docs/user-stories/{STORY_REF}/{STORY_REF}-HANDOFF.md`."
