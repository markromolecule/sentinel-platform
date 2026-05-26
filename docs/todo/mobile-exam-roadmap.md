# Mobile Exam Flow Alignment Roadmap

This roadmap outlines the plan to align the `sentinel-mobile` exam flow with the `sentinel-web` experience, as specified in [mobile-exam.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/mobile-exam.md).

## Viable Options

### Option 1: Full Route Restructuring (Recommended)

Mirror the web application's route structure exactly within the mobile app's file-based routing.

- **Pros**: Parity with web flow, intuitive navigation mapping, follows [mobile-exam.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/mobile-exam.md) requirements.
- **Cons**: Requires moving existing files and updating navigation links.

### Option 2: Incremental Flow Updates

Keep the existing `details` folder structure but add the missing steps (`lobby`, `result`) as sub-routes or modal screens.

- **Pros**: Minimal disruption to existing file structure.
- **Cons**: Inconsistent with web routing, potentially confusing architecture.

### Option 3: Unified Wizard Component

Implement all pre-exam steps within a single screen using a state-driven wizard.

- **Pros**: Potentially smoother UI transitions between steps.
- **Cons**: Breaks deep linking to specific steps, less modular.

---

## Best Option: Option 1

**Why**: This approach directly addresses the user's requirement to have a similar flow to the web app. It ensures architectural consistency across platforms, making it easier for developers to maintain and for students to transition between web and mobile versions of the exam.

---

## Phased Breakdown

### Phase 1: Route Reorganization & Refactoring

Restructure the `app/(tabs)/exam/[id]` directory to match web routes.

- [ ] Move `details/index.tsx` to `instruction/index.tsx`.
- [ ] Move `details/consent.tsx` to `privacy/index.tsx`.
- [ ] Move `details/checkup.tsx` to `checkup/index.tsx`.
- [ ] Remove the `details` directory.
- [ ] Update `index.tsx` to redirect to `instruction`.
- [ ] Update navigation logic in `use-exam-details`, `use-exam-consent`, and `use-exam-checkup`.

### Phase 2: Missing Screens Implementation

Implement the `lobby` and `result` screens.

- [ ] Create `lobby/index.tsx` mirroring the web's waiting area.
- [ ] Create `result/index.tsx` to display the post-exam summary and "Turn In" action.
- [ ] Implement `use-exam-lobby` hook if necessary (or update existing hooks).
- [ ] Implement `use-exam-result` hook to handle scoring and submission summary.

### Phase 3: UI/UX Refinement & Aesthetic Alignment

Apply "Grab-style" premium design to all exam screens.

- [ ] Update `instruction` screen with hero-led layout and quick info bar.
- [ ] Update `privacy` screen with disclosure lists and consent checkboxes.
- [ ] Update `checkup` screen with better camera/mic feedback and calibration simulation.
- [ ] Update `session` (attempt) screen to align closer with web's question layout.

### Phase 4: Integration & Data Flow

Ensure smooth data transitions between steps.

- [ ] Implement session state management (using Zustand or similar if needed) to track progress through the flow.
- [ ] Connect the "Submit" action in the session to the `result` screen.
- [ ] Connect the "Turn In" action in the `result` screen to the final submission API.

---

## Data Layer Evaluation

- No Prisma schema changes are anticipated as the underlying API contracts should remain the same.
- We will rely on existing `mockExams` and `mockQuestions` data for development, ensuring compatibility with the current data structures.

---

## Testing Strategy

### Automated Tests

- [ ] Add unit tests for `use-exam-lobby` and `use-exam-result` hooks.
- [ ] Add component tests for new screens using `@testing-library/react-native`.

### Manual Verification

- [ ] Verify the full flow: Instruction -> Privacy -> Checkup -> Lobby -> Session -> Result -> History.
- [ ] Test gesture handling (e.g., ensuring swipe-back is disabled during active exam sessions).
- [ ] Verify UI responsiveness on different device sizes.
- [ ] Check dark mode consistency across all new and updated screens.
