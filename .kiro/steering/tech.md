# Technology Stack

## Frontend (Angular SPA)

- **Framework**: Angular 18.2.x
- **UI Library**: Angular Material 18.2.x with rose-red theme
- **Styling**: SCSS with component-scoped styles
- **State Management**: RxJS for reactive programming
- **Testing**: Jasmine + Karma for unit tests
- **Build Tool**: Angular CLI with Webpack

## Backend Integration

- **API Communication**: RESTful APIs with JWT authentication
- **Proxy Configuration**: Development proxy setup in `proxy.conf.json`
- **Authentication**: JWT tokens with 2FA/OTP flow

## Development Tools

- **Package Manager**: npm
- **TypeScript**: 5.5.x for type safety
- **Linting**: Angular ESLint configuration
- **IDE**: Support for Angular Language Service

## Prerequisites

- **Node.js**: 20.x LTS
- **Package install**: `npm ci` for reproducible installs (CI and local)

## Common Commands

### Development
```bash
# Start development server
cd afs-spa
npx ng serve

# Build for production
npx ng build

# Run tests
npx ng test

# Build with watch mode
npx ng watch
```

### Styling
```bash
# Compile SCSS if styles.css is missing
cd afs-spa/src
npx sass styles.scss styles.css
```

### Project Generation
```bash
# Generate new component
npx ng generate component component-name

# Generate new service
npx ng generate service service-name

# Generate new module
npx ng generate module module-name
```

## Build Configuration

- **Output**: `dist/afs-spa/`
- **Bundle Budgets**: 500kB warning, 1MB error for initial bundle
- **Style Budget**: 2kB warning, 4kB error per component
- **Source Maps**: Enabled in development mode