#!/usr/bin/env node

/**
 * PR Template Generator for Kiro Integration
 * Generates PR templates and review checklists from Kiro planning documents
 */

const fs = require('fs');
const path = require('path');

class KiroPRGenerator {
    constructor(requirementsFile, designFile, tasksFile) {
        this.requirements = fs.readFileSync(requirementsFile, 'utf8');
        this.design = fs.readFileSync(designFile, 'utf8');
        this.tasks = fs.readFileSync(tasksFile, 'utf8');
    }

    // Extract acceptance criteria from requirements
    extractAcceptanceCriteria() {
        const criteriaRegex = /#### Acceptance Criteria\n\n(.*?)(?=\n### |\n## |$)/gs;
        const matches = [...this.requirements.matchAll(criteriaRegex)];

        return matches.map(match => {
            const criteria = match[1].trim();
            return criteria.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || line.trim().startsWith('4.') || line.trim().startsWith('5.') || line.trim().startsWith('6.'));
        }).flat();
    }

    // Extract testing requirements
    extractTestingRequirements() {
        const testingSection = this.design.match(/## Testing Strategy[\s\S]*?(?=\n## |\n# |$)/);
        if (!testingSection) return [];

        const unitTestsMatch = testingSection[0].match(/### Unit Tests[\s\S]*?(?=\n### |\n## |$)/);
        const integrationTestsMatch = testingSection[0].match(/### Integration Tests[\s\S]*?(?=\n### |\n## |$)/);
        const e2eTestsMatch = testingSection[0].match(/### E2E Tests[\s\S]*?(?=\n### |\n## |$)/);

        const tests = [];
        if (unitTestsMatch) tests.push('Unit Tests Required');
        if (integrationTestsMatch) tests.push('Integration Tests Required');
        if (e2eTestsMatch) tests.push('E2E Tests Required');

        return tests;
    }

    // Generate PR template
    generatePRTemplate(taskNumber, taskTitle) {
        const acceptanceCriteria = this.extractAcceptanceCriteria();
        const testingRequirements = this.extractTestingRequirements();

        return `## Pull Request: Task ${taskNumber} - ${taskTitle}

### Description
Brief description of the changes implemented in this PR.

### Related Issues
- Resolves #[ISSUE_NUMBER]
- Related to Epic #[EPIC_NUMBER]

### Changes Made
- [ ] Component implementation
- [ ] Service implementation
- [ ] Template updates
- [ ] Styling updates
- [ ] API integration
- [ ] Tests added

### Acceptance Criteria Validation
${acceptanceCriteria.map(criteria => `- [ ] ${criteria.replace(/^\d+\.\s*/, '')}`).join('\n')}

### Testing Requirements
${testingRequirements.map(test => `- [ ] ${test}`).join('\n')}

### Code Quality Checklist
- [ ] Code follows project standards
- [ ] No console.log statements left in code
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Accessibility considerations addressed
- [ ] TypeScript types properly defined
- [ ] Comments added where necessary

### Testing Completed
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)
- [ ] Mobile responsive testing (if applicable)

### Performance Considerations
- [ ] No performance regressions identified
- [ ] Large file handling considered
- [ ] Memory leaks checked

### Security Considerations
- [ ] Input validation implemented
- [ ] XSS prevention measures
- [ ] File upload security (if applicable)
- [ ] Permission checks implemented

### Screenshots/Demo
<!-- Add screenshots or GIF demos of the functionality -->

### Deployment Notes
<!-- Any special deployment considerations -->

### Review Request
- [ ] Code review requested
- [ ] Design review requested (if applicable)
- [ ] Security review requested (if applicable)
`;
    }

    // Generate review checklist
    generateReviewChecklist() {
        return `# Code Review Checklist for Kiro Implementation

## Functionality Review
- [ ] All acceptance criteria from requirements document are met
- [ ] Feature works as designed in the design document
- [ ] Edge cases are handled appropriately
- [ ] Error scenarios are handled gracefully

## Code Quality Review
- [ ] Code is readable and well-structured
- [ ] Functions and variables have meaningful names
- [ ] No code duplication (DRY principle)
- [ ] Proper separation of concerns
- [ ] TypeScript types are properly defined
- [ ] Interfaces match the design document specifications

## Angular Best Practices
- [ ] Components follow Angular style guide
- [ ] Services are properly injected and used
- [ ] Observables are properly subscribed and unsubscribed
- [ ] Change detection is optimized
- [ ] Proper use of OnPush change detection where applicable

## Testing Review
- [ ] Unit tests cover the main functionality
- [ ] Tests are meaningful and not just for coverage
- [ ] Integration tests verify component interactions
- [ ] Mocks are used appropriately
- [ ] Test cases cover error scenarios

## Security Review
- [ ] Input validation is implemented
- [ ] File upload restrictions are in place
- [ ] XSS vulnerabilities are prevented
- [ ] Permission checks are enforced
- [ ] API endpoints are secured

## Performance Review
- [ ] No unnecessary API calls
- [ ] Proper loading states
- [ ] File operations don't block the UI
- [ ] Memory management is proper
- [ ] Large file handling is optimized

## UX Review
- [ ] User feedback is provided for all actions
- [ ] Loading states are shown during operations
- [ ] Error messages are user-friendly
- [ ] Success messages are clear
- [ ] Accessibility requirements are met

## Architecture Review
- [ ] Component structure matches design document
- [ ] Services follow the defined interfaces
- [ ] State management is appropriate
- [ ] API integration follows established patterns

## Documentation Review
- [ ] Code is properly commented
- [ ] Complex logic is explained
- [ ] API changes are documented
- [ ] README is updated if necessary
`;
    }

    // Parse tasks and generate files
    generateAllFiles() {
        const taskRegex = /- \[([ x])\] (\d+)\. (.*?)(?=\n  - |_Requirements:|$)/gs;
        const matches = [...this.tasks.matchAll(taskRegex)];

        // Create .github directory structure
        const githubDir = '.github';
        const templatesDir = path.join(githubDir, 'PULL_REQUEST_TEMPLATE');

        if (!fs.existsSync(githubDir)) {
            fs.mkdirSync(githubDir);
        }
        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir);
        }

        // Generate PR templates for each task
        matches.forEach(match => {
            const [, completed, taskNumber, taskContent] = match;
            const title = taskContent.trim().split('\n')[0];

            const prTemplate = this.generatePRTemplate(taskNumber, title);
            const filename = `task_${taskNumber.padStart(2, '0')}_pr_template.md`;

            fs.writeFileSync(path.join(templatesDir, filename), prTemplate);
            console.log(`Generated PR template: ${filename}`);
        });

        // Generate general review checklist
        const reviewChecklist = this.generateReviewChecklist();
        fs.writeFileSync(path.join(githubDir, 'review_checklist.md'), reviewChecklist);
        console.log('Generated review checklist: review_checklist.md');

        // Generate main PR template
        const mainPRTemplate = this.generatePRTemplate('X', 'Feature Implementation');
        fs.writeFileSync(path.join(githubDir, 'pull_request_template.md'), mainPRTemplate);
        console.log('Generated main PR template: pull_request_template.md');
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('Usage: node pr-generator.js <requirements.md> <design.md> <tasks.md>');
        process.exit(1);
    }

    const [requirementsFile, designFile, tasksFile] = args;

    try {
        const generator = new KiroPRGenerator(requirementsFile, designFile, tasksFile);
        generator.generateAllFiles();
        console.log('\n✅ All GitHub templates generated successfully!');
    } catch (error) {
        console.error('❌ Error generating templates:', error.message);
        process.exit(1);
    }
}

module.exports = KiroPRGenerator;