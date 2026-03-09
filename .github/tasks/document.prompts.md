## Document Generation Launcher

Use `.github/prompts/documentation.prompts.md` with parameters:

- DOCUMENT_NAME: <title>
- DOC_TYPE: technical|functional
- SCOPE: application|feature|user-story|installation-guide|developer-guide
- AUDIENCE: developer|architect|end-user|devops|business-stakeholder
- PROJECT_CONTEXT: <brief>
- REQUIREMENTS_REFERENCE: /docs/prd/requirements.md#section
- EXISTING_DOCUMENTATION: comma-separated related docs

Then copy the prompt block and execute with the chosen agent.
