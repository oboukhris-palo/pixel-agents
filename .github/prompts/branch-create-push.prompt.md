## Objective
Create a new Git branch with user-provided name and push it to GitHub remote repository, establishing tracking between local and remote branches for collaborative development.

## Context
You are working with a Git repository connected to GitHub remote. The user needs to create a new branch for feature development, bug fixes, or experimentation and wants to immediately establish the branch on GitHub for collaboration and backup purposes.

## Requirements

### Prerequisites Verification
- Git repository must be initialized with remote named 'origin'
- User must have push permissions to GitHub repository
- Working directory should be clean (no uncommitted changes recommended)
- Current branch status should be checked before proceeding

### Branch Creation Process
1. **Branch Name Acceptance**: Receive branch name from user (examples: "feature/new-dashboard", "bugfix/login-issue", "experiment/ai-integration")
2. **Local Branch Creation**: Create and switch to new branch using `git checkout -b <branch-name>`
3. **Remote Push Setup**: Push branch to GitHub and establish tracking with `git push -u origin <branch-name>`
4. **Confirmation**: Verify successful creation and tracking setup

### Command Execution
Execute combined command for efficiency:
```bash
git checkout -b <branch-name> && git push -u origin <branch-name>
```

Command breakdown:
- `git checkout -b <branch-name>`: Creates new branch and switches to it
- `&&`: Ensures push only executes if branch creation succeeds
- `git push -u origin <branch-name>`: Pushes branch and sets upstream tracking
- `-u` flag: Establishes tracking relationship for future push/pull operations

## Deliverables

### 1. Local Branch Creation
- New branch created from current HEAD
- Automatic switch to newly created branch
- Branch ready for development work

### 2. Remote Branch Establishment
- Branch pushed to GitHub origin remote
- Upstream tracking configured for seamless future operations
- Branch visible in GitHub interface for collaboration

### 3. Success Confirmation
Provide clear confirmation including:
- Name of created branch
- Confirmation of GitHub push success
- Current working branch status
- GitHub URL reference for pull request creation (when ready)

## Quality Standards

- ✅ Branch name follows project naming conventions
- ✅ Local branch successfully created and checked out
- ✅ Remote branch successfully pushed to GitHub
- ✅ Upstream tracking properly configured
- ✅ Working directory status clean after operations
- ✅ User receives clear confirmation of all operations
- ✅ Branch ready for collaborative development

## File Management

### Git Operations
- Verify git repository status before branch creation
- Ensure no uncommitted changes that might complicate branch creation
- Check existing branch names to avoid conflicts
- Validate remote connection before attempting push

### Post-Creation Status
- Confirm current branch is the newly created one
- Verify upstream tracking is properly configured
- Provide guidance on next steps for development work

### Validation Criteria
- ✅ Branch name follows project naming conventions (if applicable)
- ✅ Branch is successfully created locally
- ✅ Branch is successfully pushed to GitHub remote
- ✅ Tracking relationship is established between local and remote branch
- ✅ User receives clear confirmation of success

### Error Handling
Handle common scenarios:
- Branch name already exists locally
- Network connectivity issues
- Permission denied errors
- Invalid branch name characters

### Best Practices
- Verify current git status before creating branch
- Ensure working directory is clean or changes are committed/stashed
- Use descriptive branch names that indicate purpose
- Follow team branching conventions (e.g., feature/, bugfix/, hotfix/ prefixes)

## File Management
- No files are created or modified by this operation
- Git metadata is updated in `.git/` directory
- Remote tracking information is stored in Git configuration