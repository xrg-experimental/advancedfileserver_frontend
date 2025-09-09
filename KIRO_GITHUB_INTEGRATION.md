# Kiro to GitHub Integration

This repository has been set up with automated workflows to convert Kiro planning documents into GitHub issues, pull requests, and project management.

## Quick Start

1. **Initial Setup**: Run the integration workflow
   ```bash
   ./scripts/setup-kiro-feature.sh
   ```

2. **Create Task Branch**: 
   ```bash
   ./scripts/create-task-branch.sh <task_number>
   ```

3. **Auto PR Creation**: When you push a task branch, a PR is automatically created

## Workflow Overview

### Files Structure
- `.kiro/specs/file-action-bar/requirements.md` - Kiro requirements document
- `.kiro/specs/file-action-bar/design.md` - Kiro design document  
- `.kiro/specs/file-action-bar/tasks.md` - Kiro implementation tasks
- `.github/workflows/` - Automated workflows
- `scripts/` - Helper scripts

### Automated Workflows

#### 1. Kiro Integration Workflow
**Trigger**: Manual workflow dispatch
**Purpose**: Creates issues and milestones from Kiro documents

Features:
- Creates epic issue from requirements/design
- Creates individual task issues
- Sets up milestone tracking
- Links all issues together

#### 2. Auto PR Creation
**Trigger**: Push to `feature/task-*` or `task/*` branches  
**Purpose**: Automatically creates PRs for task branches

Features:
- Links PR to related issue
- Generates PR description from commits
- Adds appropriate labels
- Sets up review checklist

### Branch Naming Convention

Use these branch naming patterns for automatic PR creation:
- `feature/task-01` - Feature branch for task 1
- `task/05` - Task branch for task 5  
- `feat/task-12` - Alternative feature branch

### Issue Management

Issues are automatically created with:
- Task number and title from Kiro tasks
- Requirements coverage information
- Definition of done checklist
- Links to epic and related documents
- Appropriate labels and milestones

### Usage Tips

1. **Start with Planning**: Ensure your Kiro files are complete in `.kiro/specs/file-action-bar/`
2. **Run Integration**: Use the setup script to create all GitHub issues
3. **Work on Tasks**: Create branches using the helper script
4. **Auto PRs**: Push branches to automatically create pull requests
5. **Track Progress**: Use GitHub Projects or milestone views to track progress

### Customization

You can customize the integration by:
- Modifying workflow files in `.github/workflows/`
- Updating templates in `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE/`
- Adjusting helper scripts in `scripts/`

### Requirements

- GitHub CLI (`gh`) installed and authenticated
- Python 3.x
- Proper repository permissions (issues, PRs, workflows)

## Troubleshooting

### Common Issues

1. **Workflow fails**: Check that all Kiro files exist and are properly formatted
2. **Issues not created**: Verify GitHub token permissions include issues and milestones
3. **Auto PR fails**: Ensure branch naming follows the convention

### Getting Help

Check the workflow logs in the Actions tab for detailed error information.
