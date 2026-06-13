# Feature Goals: TOS Management & Question Generation

---

## 1. Bloom's Taxonomy Category Selection

Users can now select specific Bloom's Taxonomy categories when configuring a Table of Specifications (TOS):

- Remembering, Understanding, Applying, Analyzing, Evaluating, Creating

### Backend

- Update the orchestrator to accept and process per-category TOS configurations.
- Update the question generation pipeline to strictly align generated questions with the selected category requirements (verb alignment, cognitive level, etc.).
- Optimize the request/response flow to reduce latency in question generation.

### Frontend

- Add a multi-select UI for Bloom's Taxonomy categories in the TOS configuration step.

---

## 2. TOS Matrix Page Layout Redesign

### Remove

- The "Bloom's Taxonomy Distribution" component.

### Reposition

- Move the summary stat cards (Total Active, Total Retired, Topics Tagged, Total Matrix count) above the TOS matrix table.

### Add

- A dedicated view for **Retired** questions. This can be a separate page or a filtered view — the implementation approach is open, but it must be clearly accessible from the TOS matrix page.
