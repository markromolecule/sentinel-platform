# Exams, Question Bank, and Question Backend To-Do

## Goal
Create a backend for:

1. `exam`
2. `question bank`
3. `question`

The backend should be:

- scalable
- maintainable
- clean
- modular
- clear

## Three Viable Options

### Option 1: Fast Monolithic Module Build
- Add all Prisma models at once.
- Implement one DTO file, one service file, and one route file per module.
- Keep most logic inside each module service.

Pros:
- Fastest to ship initially.
- Lower file count.

Cons:
- Will become harder to maintain once exam publishing, assignments, imports, and analytics grow.
- Makes controller/service files large quickly.
- Encourages mixing validation, orchestration, and persistence logic.

### Option 2: Modular Service + Controller + Data Slice Per Domain
- Add normalized database tables for exams, exam sections, exam questions, question bank collections, and collection-question links.
- Keep each module as a domain entry point:
  - DTOs for request/response contracts
  - Routes for registration
  - Controllers for HTTP concerns
  - Services for orchestration/business rules
  - Data helpers for DB access
- Reuse shared schemas where practical and keep JSON question content typed consistently.

Pros:
- Best balance between delivery speed and long-term maintainability.
- Matches the existing backend direction in stronger modules.
- Makes future changes like publish workflow, imports, exam assignment, and collection sharing easier.

Cons:
- More setup than a monolithic implementation.
- Requires careful naming and folder structure discipline.

### Option 3: Full Generic Content Platform
- Build a generic “assessment content” system first, then layer exams and question bank on top of it.
- Abstract questions, collections, templates, and exam composition into a reusable content engine.

Pros:
- Very flexible for future product expansion.
- Could support many advanced features later.

Cons:
- Over-engineered for the current repo state.
- Higher schema and API complexity.
- Slower to deliver and riskier without stronger existing backend coverage for exams.

## Best Option

### Recommended: Option 2

Why:
- It aligns best with the current system needs.
- It keeps the implementation modular without scattering responsibility randomly.
- It gives us clean seams between:
  - exam management
  - reusable question management
  - question bank collection management
- It fits the current API architecture much better than a fully generic platform.

## Implementation Plan

### Phase 1: Database Design
- Review current Prisma schema and existing academic/user relations.
- Add tables for:
  - exams
  - exam_sections
  - exam_questions
  - question_bank_questions
  - question_bank_collections
  - question_bank_collection_questions
- Store question content in JSON with stable metadata fields around it.
- Link exams to institution/instructor/subject/section where appropriate.
- Add status, ordering, timestamps, and audit fields.

### Phase 2: Exam Module
- Implement exam DTOs.
- Implement exam data helpers for:
  - list exams
  - get exam by id
  - create draft exam
  - update exam
  - publish/archive exam
  - save sections/questions
- Implement exam service orchestration.
- Implement exam controllers and routes.

### Phase 3: Question Module
- Implement reusable question DTOs.
- Implement question data helpers for:
  - list questions
  - get question by id
  - create question
  - update question
  - delete question
- Keep question type/content validation consistent with shared schemas.

### Phase 4: Question Bank Module
- Implement collection DTOs.
- Implement collection data helpers for:
  - list collections
  - get collection with questions
  - create collection
  - update collection
  - delete collection
  - add/remove questions in collection
- Keep this module focused on collection behavior, not generic question CRUD.

### Phase 5: App Integration
- Register the new routes in `app/sentinel-api/src/app.ts`.
- Keep auth middleware aligned with instructor/admin flows.
- Verify route prefixes and response formats.

### Phase 6: Validation and Verification
- Run lint.
- Run TypeScript checks.
- If Prisma schema changes are introduced:
  - generate migration
  - regenerate db client/types
  - verify API compiles against new types

## Working Notes

### Key Design Direction
- Questions should be reusable across the question bank.
- Exams should snapshot their own question instances so exam editing stays stable even if bank questions change later.
- Collections should reference bank questions through a join table.

### Keep in Mind
- Prefer small, focused files over large service/controller files.
- Keep naming explicit.
- Avoid coupling question bank collection APIs with exam composition APIs.
- Preserve room for future assignment/proctoring integration.

## Progress Log

### Current Status
- [x] Read workflow/rule files
- [x] Inspect API architecture
- [x] Inspect existing exam/question/question-bank module stubs
- [x] Inspect shared exam/question schemas
- [x] Design schema changes
- [x] Implement backend modules
- [x] Register routes
- [x] Run verification
