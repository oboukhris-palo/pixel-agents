## Commit Message Guide (User Story)

Use this format for commits related to a story:

- Feature: `feat({STORY_REF}): <short description>`
- Fix: `fix({STORY_REF}): <short description>`
- Test: `test({STORY_REF}): <short description>`
- Refactor: `refactor({STORY_REF}): <short description>`

Examples:
- `feat(US-001): add registration endpoint`
- `test(US-001): add password hashing test`
- `refactor(US-001): extract PasswordHasher`

Rules:
- Reference exactly one `{STORY_REF}` (US-XXX) per commit.
- Keep subject under 72 chars; body explains why, not what.
- Include co-authors and issue/PR refs when applicable.
