# Project Structure

## Root Directory

```
├── afs-spa/                 # Angular SPA application
├── docs/                    # Project documentation
├── project_docs/            # Requirements and analysis
├── .kiro/                   # Kiro AI assistant configuration
├── package.json             # Root package configuration
└── README.md               # Project setup instructions
```

## Angular Application Structure (`afs-spa/`)

```
afs-spa/
├── src/
│   ├── app/
│   │   ├── core/           # Core services, guards, interceptors
│   │   ├── shared/         # Shared components, pipes, directives
│   │   ├── pages/          # Feature pages/components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── app.component.* # Root application component
│   │   ├── app.config.ts   # Application configuration
│   │   └── app.routes.ts   # Application routing
│   ├── environments/       # Environment configurations
│   ├── styles.scss         # Global styles
│   └── main.ts            # Application bootstrap
├── public/                 # Static assets
├── proxy.conf.json        # Development proxy configuration
└── angular.json           # Angular CLI configuration
```

## Architecture Patterns

### Feature Organization
- **Pages**: Top-level feature components in `src/app/pages/`
- **Core**: Singleton services, guards, and app-wide utilities
- **Shared**: Reusable components, pipes, and directives

### Component Structure
- Each component follows Angular conventions:
  - `component.ts` - Component logic
  - `component.html` - Template
  - `component.scss` - Component-scoped styles
  - `component.spec.ts` - Unit tests

### Service Organization
- **Core Services**: Authentication, HTTP interceptors, guards (providedIn: 'root' singletons)
- **Feature Services**: Business logic for specific features
- **Shared Services**: Utilities used across features
- **Models**: Domain contracts in `src/app/core/models/`; UI-only view models in `src/app/shared/models/` (re-export via `shared/models/index.ts`)

## Naming Conventions

- **Components**: PascalCase (e.g., `FilesComponent`)
- **Services**: PascalCase with Service suffix (e.g., `FileOperationService`)
- **Files**: kebab-case (e.g., `file-operation.service.ts`)
- **Selectors**: app prefix (e.g., `app-files`)

## Documentation Structure

- `docs/` - Development guides and setup instructions
- `project_docs/` - Requirements, analysis, and sprint planning
- `project_docs/sprints/` - Sprint-specific documentation
- `.kiro/specs/` - AI assistant specifications and tasks