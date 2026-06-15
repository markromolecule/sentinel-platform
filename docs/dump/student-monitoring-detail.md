# Student Monitoring Detail Page To-Do Plan

## 1-3-1 Rule Analysis: Student Monitoring Detail View

**The Problem**: The user needs a more detailed view for individual student monitoring, specifically highlighting flagging events, accessible from the main monitoring list.

**Option 1: Full Route Page (`/exams/[id]/monitoring/[studentId]`) [RECOMMENDED]**
Create a new dedicated Next.js route and page.

- **Pros**: Cleanest separation, most space for a "premium" timeline UI, shareable URLs, fulfills the "open a new page" request.
- **Cons**: Minor navigation overhead.

**Option 2: Deep-Link Modal Overlay**
Use a full-screen modal triggered by the student card.

- **Pros**: Fast interaction, no full page transition.
- **Cons**: Can feel "heavy" if the UI is complex; harder to manage deep-linking/refreshing state.

**Option 3: Expandable Side Panel (Maximized)**
Enhance the existing `MonitoringDetailPanel` to support a "Maximized" state.

- **Pros**: Maintains list context.
- **Cons**: Limited layout flexibility compared to a dedicated page.

**Recommendation**: **Option 1**. It aligns best with the user's explicit request and provides the best foundation for a high-quality, focused monitoring experience.

---

## Comprehensive To-Do Plan

### Phase 1: Research & Setup

- [ ] **1. Define Route**: Confirm placement at `app/(protected)/(proctor)/exams/[id]/monitoring/[studentId]/page.tsx`.
- [ ] **2. Inspect Types**: Check `@sentinel/shared/types` for `StudentSession` and `FlagEvent` definitions.

### Phase 2: Feature Components (sentinel-web)

- [ ] **1. Create `FlaggingTimeline`**: Implement a rich, vertical timeline component in `features/exams/monitoring/_components/flagging-timeline.tsx`.
- [ ] **2. Create `StudentMonitoringDetail`**: Implement the main orchestration component in `features/exams/monitoring/_components/student-monitoring-detail.tsx`.
    - Include Header with back button.
    - Student summary card.
    - Live preview placeholder.
    - Integrated FlaggingTimeline.

### Phase 3: Page Routing & Navigation

- [ ] **1. Create Page Route**: Implement the Next.js page at `app/sentinel-web/src/app/(protected)/(proctor)/exams/[id]/monitoring/[studentId]/page.tsx`.
- [ ] **2. Link Main List**: Update `StudentCard` or `StudentList` to handle navigation to the new page.
- [ ] **3. Update Detail Panel**: Add a "View Full Report" button in `MonitoringDetailPanel` that links to the new page.

### Phase 4: Verification

- [ ] **1. Visual Check**: Ensure gradients, typography, and spacing feel premium.
- [ ] **2. Flow Check**: Ensure smooth navigation back and forth.
- [ ] **3. Data Check**: Ensure correct student data is displayed based on the ID.

> **Note**: I have NOT started coding yet. Please review this plan and explicitly tell me to proceed with Phase 1.
