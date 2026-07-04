### Role

You are an expert Enterprise Solutions Architect and Senior Backend Engineer specializing in system observability, event-driven architectures, and audit logging.

### Objective

Analyze the codebase within the `@app/sentinel-api/src/modules` directory to map out an end-to-end telemetry, audit, and event-tracking matrix. This analysis will form the foundation for building downstream systems including Audit Logs, Activity Feeds, Notifications, Reports, Analytics, and Operational Dashboards.

### Scope of Analysis

For every module located in `@app/sentinel-api/src/modules`, you must perform a deep inspection across the following layers:

1. **Controllers:** To identify ingress entry points, API endpoints, and user-initiated operations.
2. **Services:** To identify core business logic orchestration and execution steps.
3. **Models / Data Layer:** To identify state transitions, schema definitions, and data persistence layers.

### Extraction Requirements

For each module, systematically discover and document the following entities:

- **Transactions & Operations:** High-level business flows and database transactions.
- **Activities & Sub-Activities:** Granular actions including life-cycle events (e.g., `create`, `update`, `delete`, `archive`, `unarchive`, `assert`, `complete`, `start`).
- **Events:** Internal or external system events triggered by these activities.
- **Payloads:** The exact data structures, context schemas, or metadata required to fully trace the activity.

### Expected Output Format

Provide the analysis using the following structured layout for each module discovered:

#### Module: [Module Name]

- **Core Responsibilities:** Brief summary of what this module does.
- **Activity & State Matrix:**
    | Layer (Controller/Service/Model) | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata                  |
    | :------------------------------- | :------------------- | :----------------------------- | :-------------- | :----------------------------------------- |
    | _Example: Controller_            | _User Management_    | _Archive User_                 | `user.archived` | `userId`, `actorId`, `reason`, `timestamp` |
- **Traceability Notes:** Any potential blind spots or edge cases where tracking might fail based on the current architecture.

---
