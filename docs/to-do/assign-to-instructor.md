# Overview

This document outlines four major feature additions:

1. **Exam Assignment** – Assign exams to other instructors (with proctor designation)
2. **Classroom Assignment** – Assign classrooms to other instructors
3. **Grading Update** – Handle grading across multiple assigned instructors and sections
4. **Notification System** – Institution-scoped notifications for all CRUD actions

---

# Feature: Exam Assignment

## Goal

Allow an instructor to assign an exam to another instructor. The assignee becomes the **Proctor** of that examination, gaining access to the **Monitor** and **Lobby** pages. The original creator retains proctor-level access as well.

## Flow

1. **Instructor A** creates an exam and assigns it to **Instructor B**.
2. **Instructor B** receives a notification informing them of the assignment and can either **Accept** or **Reject** it.
3. If **Instructor B** accepts:
    - Instructor B becomes the designated **Proctor** for that exam.
    - Instructor A is also treated as a Proctor (retains access).
4. Both the **assignee (Proctor)** and the **original creator** must have full access to the **Monitor** and **Lobby** pages.

## Implementation Notes

- Create a dedicated module at:
  `@app/sentinel-api/src/modules/examination/assign`

- Break services into **separate, focused service files** inside:
  `@app/sentinel-api/src/modules/examination/assign/services/`
  _(Avoid crowding everything into a single `assign.service.ts`)_

- Create the necessary **routes** and **DTOs** for the assign module.

- Follow the existing code structure used in the Exams module:
  `@app/sentinel-api/src/modules/examination/exams`
  _(Use `DbClient` import pattern: `import { type DbClient } from '@sentinel/db'`)_

---

# Feature: Classroom Assignment

## Goal

Allow an instructor to assign a classroom to one or more other instructors, enabling flexible subject management across sections.

## Flow

- **Instructor A** creates a classroom.
- Instructor A can add additional instructors to manage that classroom.
- Instructor A acts as the **head** of the subject and has the flexibility to:
    - Create multiple classrooms linked to different subjects and sections.
    - Assign those classrooms to other instructors to handle independently.

> **Use case:** Before an examination, a responsible instructor can manage multiple subjects by creating classrooms per subject/section and delegating them to the appropriate instructors.

## Module Location

`@app/sentinel-api/src/modules/core/classroom`

---

# Feature: Grading Update

## Goal

Update the Grading module to handle exams that have been assigned to other instructors, and to categorize students **per section** within a single exam's grading view.

## Requirements

- Grading must account for exams assigned across multiple instructors.
- Students who take an exam should be grouped and displayed **by section** in the grading interface.
- Streamline grading so that all sections tied to an exam are visible in one cohesive view.

## Module Location

`@app/sentinel-api/src/modules/examination/grading`

---

# Feature: Notification System

## Goal

Build a notification system that triggers on all CRUD actions and key workflow events (Approve, Request, Decline) across the platform.

## Scope

- Notifications are **scoped to the institution** — users only see notifications relevant to their **parent institution** or **branch**.
- Notifications appear in the **header** next to the profile button, visible to:
    - Support
    - Superadmin
    - Admin
    - Instructor

## Trigger Events

Notifications are sent when any user performs:

- **Create / Update / Delete** on any resource
- **Approve / Request / Decline** on any workflow action

## Implementation Notes

- Follow the same structure used in all other modules:
  `services | controller | data | routes | dto`
- Only the **services layer** will differ based on the notification logic.

## Module Location

`@app/sentinel-api/src/modules/general/notification`
