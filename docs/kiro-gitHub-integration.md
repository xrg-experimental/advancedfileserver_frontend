# Kiro GitHub Integration

A comprehensive GitHub workflow system for integrating your Kiro 
planning documents with GitHub. Here's what the solution provides:

## 🎯 **Complete Workflow Solution**

### **1. Main Integration Workflow** (`kiro-integration.yml`)
- **Converts your Kiro documents into GitHub issues automatically**
- Creates an epic issue from requirements/design docs
- Creates individual task issues from your tasks.md checklist
- Sets up milestones for tracking
- Links everything together properly

### **2. Auto PR Creation** (`auto-pr-creation.yml`)
- **Automatically creates PRs when you push task branches**
- Detects task numbers from branch names like `feature/task-04`
- Links PRs to the corresponding GitHub issues
- Generates comprehensive PR descriptions with checklists

**Branch Detection Configuration:**
```yaml
on:
  push:
    branches:
      - 'feature/task-*'   # or 'feature/task-[0-9][0-9]'
      - 'task/*'
      - 'feat/task-*'
permissions:
  contents: write
  pull-requests: write
  issues: write
```

### **3. Helper Scripts**
- `create-task-branch.sh` - Creates properly named branches for tasks
- `setup-kiro-feature.sh` - One-command setup for new features
- Complete setup script that installs everything

### **4. GitHub Templates**
- Issue templates for consistent task creation
- PR templates with comprehensive review checklists
- All templates include references to your Kiro planning

## 🔄 **Recommended Workflow**

Based on your File Action Bar example, here's how you'd use it:

1. **Initial Setup** (one time):
   ```bash
   # Run the setup script
   chmod +x kiro-github-setup.sh
   ./kiro-github-setup.sh
   ```

2. **Create GitHub Issues** from your Kiro docs:
   ```bash
   # This reads your requirements.md, design.md, tasks.md
   ./scripts/setup-kiro-feature.sh
   ```

3. **Work on Individual Tasks**:
   ```bash
   # Creates feature/task-04 branch for task 4
   ./scripts/create-task-branch.sh 04
   
   # Do your development work...
   git add .
   git commit -m "Implement FileActionBarComponent layout"
   git push -u origin feature/task-04
   ```

4. **Automatic PR Creation**: The moment you push, a PR is auto-created with:
    - Link to the corresponding issue
    - Generated description from your commits
    - Review the checklist based on your requirements
    - Proper labels and milestone assignment

5. **Review & Merge**: Use the comprehensive review checklist that maps back 
   to your original Kiro requirements

## 🎨 **Key Benefits**

- **Zero Manual Issue Creation**: Your 12 tasks become 12 GitHub issues automatically
- **Traceability**: Every PR links back to requirements and design decisions
- **Consistent Process**: Templates ensure nothing is missed in reviews
- **Progress Tracking**: Milestones and project boards show real progress
- **Team Collaboration**: Reviewers get comprehensive checklists

The system is designed to work with your existing Kiro output format and 
requires minimal configuration.

## 🎯 **What the Setup Script Does**

### **1. Validation**
- Checks you're in a git repository
- Verifies all Kiro files exist (requirements.md, design.md, tasks.md)
- Uses colored output for clear status messages

### **2. Creates Complete GitHub Structure**
```
.github/
├── workflows/
│   ├── kiro-integration.yml      # Main workflow
│   └── auto-pr-creation.yml      # Auto PR creation
├── ISSUE_TEMPLATE/
│   └── kiro-task.md             # Issue template
└── pull_request_template.md     # PR template
```

### **3. Helper Scripts**
```
scripts/
├── create-task-branch.sh        # Creates feature/task-XX branches
└── setup-kiro-feature.sh       # One-command project setup
```

### **4. Documentation**
- `KIRO_GITHUB_INTEGRATION.md` - Complete usage guide
- Inline documentation in all files

## 🚀 **How to Use It**

1. **Save as `kiro-github-setup.sh`** in your project root (alongside your Kiro files)

2. **Make executable and run**:
   ```bash
   chmod +x kiro-github-setup.sh
   ./kiro-github-setup.sh
   ```

3. **Follow the next steps** printed by the script:
   ```bash
   ./scripts/setup-kiro-feature.sh  # Creates all GitHub issues
   ./scripts/create-task-branch.sh 04  # Start working on task 4
   ```

## ✨ **Key Features**

- **Smart validation**: Checks for all prerequisites
- **Color-coded output**: Easy to see what's happening
- **Complete automation**: Creates everything you need in one run
- **Error handling**: Clear messages if something goes wrong
- **GitHub CLI integration**: Uses `gh` for authenticated API calls

The script is designed to work specifically with your File Action Bar 
example - it will parse the 12 tasks and create corresponding GitHub 
issues automatically!
