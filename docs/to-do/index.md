# Sentinel Documentation Directory

Welcome to the internal documentation repository for the **Sentinel** ecosystem. These records provide extensive insights spanning across architectural standards, infrastructural deployment designs, and rigorous conventional practices ensuring maintainability.

## Table of Contents

### Featured Refactor Plans
- **[Configuration-Driven Telemetry Refactor To-Do](configuration-driven-telemetry-refactor-todo.md)**
  Detailed phased plan for aligning telemetry ingestion, storage, review flows, Redis aggregation, and client payloads with the current web/mobile exam configuration model and shared package contracts.

### 1. Architecture
- **[Monorepo Structure](architecture/monorepo-structure.md)**
  An overview explaining the Turborepo setup encapsulating the `sentinel-web` Next.js client, `sentinel-mobile` React Native Expo app, `sentinel-api` Hono API, and unified `@packages/shared` packages.
- **[System Overview](architecture/system-overview.md)**
  Discusses interactions between the core logic boundaries spanning the client rendering, RESTful controllers, Kysely data access layers, and resilient Supabase architectures.

### 2. Infrastructure
- **[Deployment Strategy](infrastructure/deployment.md)**
  Highlights standard continuous deployment workflows and deployment environments (Vercel, Expo EAS, Edge execution, and Prisma migration workflows).

### 3. Standards
- **[Git Workflow](standard/git-workflow.md)**
  Codifies strict repository collaboration patterns mandating *Conventional Commits* requirements regarding phrasing (`feat`, `fix`), branching behaviors, and automated dependencies (`Dependabot`).
- **[Naming Convention](standard/naming-convention.md)**
  Establishes overarching structural syntax rules regarding explicit `kebab-case` file namings and casing principles handling interfaces, constants (`UPPER_SNAKE_CASE`), endpoints, and global function patterns.

### 4. Development Progress
- **[To-Do](todo.md)**
  Living document tracking daily progress, completed tasks, and prioritized next steps across all layers of the Sentinel stack.
