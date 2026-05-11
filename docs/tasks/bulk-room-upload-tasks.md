# Task: Bulk Room Upload

## Status: IN_PROGRESS

## Priority: HIGH

## Assigned To: Antigravity

---

## 1. Implementation Overview

This feature implements a bulk room upload capability. It allows administrators to generate multiple rooms for an institution by inheriting naming conventions and specifying a range of numbers.

### Viable Options (1-3-1 Rule)

1.  **Option 1: Backend Generation (API-Centric)**
    - User inputs range and type. Backend fetches convention and generates records.
    - _Cons:_ No preview before commit.

2.  **Option 2: Frontend Generation (UX-Centric) - [SELECTED]**
    - Frontend fetches naming convention, generates rooms for preview, then sends a batch request to API.
    - _Pros:_ High visibility, immediate feedback, reuses generic bulk create API.

3.  **Option 3: Spreadsheet Import**
    - User uploads CSV.
    - _Cons:_ Overkill for simple sequence generation.

---

## 2. Phased Tasks

### Phase 1: API & Data Layer (Backend)

Objective: Enable bulk room creation at the service and data levels.

- [x] **1.1. Define Bulk Create Schema**
    - Update `room.dto.ts` with `bulkCreateRoomsSchema`.
- [x] **1.2. Implement Bulk Create Service**
    - Add `bulkCreateRooms` to `RoomService`.
- [x] **1.3. Create Bulk API Endpoint**
    - Implement `bulk-create-rooms.controller.ts` and update `room.routes.ts`.
- [x] **1.4. Backend Integration Tests**
    - Write tests for bulk creation logic and transactions.

### Phase 2: Room Generation Logic (Shared)

Objective: Standardize how room names are generated across the platform.

- [x] **2.1. Generation Utility**
    - Implement `generateRoomNames` in `packages/shared`.
- [x] **2.2. Utility Unit Tests**
    - Test edge cases (padding, prefixes, large ranges).

### Phase 3: UI Implementation (Frontend)

Objective: Create the management interface for bulk uploads.

- [x] **3.1. Bulk Upload Dialog**
    - Create `BulkRoomUploadDialog.tsx`.
- [x] **3.2. Real-time Preview**
    - Implement the preview list in the dialog.
- [x] **3.3. Add Trigger Button**
    - Integrate the "Bulk Upload" button into the Rooms List header.

### Phase 4: Security & Validation

Objective: Secure the feature and ensure data integrity.

- [x] **4.1. Permission Guarding**
    - Ensure `rooms:create` permission is correctly enforced for bulk operations.
- [x] **4.2. Error Handling & Feedback**
    - Implement user feedback for partial successes or conflicts.

---

## 3. Implementation Log

| Date       | Task ID | Description                 | Result  |
| ---------- | ------- | --------------------------- | ------- |
| 2026-05-11 | 0.0     | Created Implementation Plan | SUCCESS |
| 2026-05-11 | 1.0     | Backend API & Data Layer    | SUCCESS |
| 2026-05-11 | 2.0     | Shared Generation Logic     | SUCCESS |
| 2026-05-11 | 3.0     | Frontend UI & Integration   | SUCCESS |
| 2026-05-11 | 4.0     | Security & Validation       | SUCCESS |
