# Analytics redesign

## Context

You are redesigning the analytics section of a dashboard application.
The analytics module has four tabs: Overview, Incidents, Exams, and Integrity.
Each tab displays data and metrics relevant to its domain.

## Design constraints

- Use shadcn/ui components exclusively (Card, Badge, Table, Chart, Separator, etc.)
- Follow the existing system design — spacing, typography, color tokens, and border radii
- Minimalist and clean: no decorative elements, no redundant labels
- Every metric shown must answer a specific user question
- Prefer data density over visual noise — use tables and inline stats where appropriate

## Task

For each of the four analytics tabs below, provide:

1. Content improvements
    - What metrics or data points are missing or underutilized
    - What to remove or consolidate (noise reduction)
    - Suggested data hierarchy (primary KPI → supporting metrics → detail table)

2. Engagement improvements
    - How to make the data actionable (e.g. thresholds, alerts, quick-action buttons)
    - Contextual comparisons (vs. last period, vs. target, vs. average)
    - Progressive disclosure: summary first, drill-down on demand

3. Component recommendations
    - Which shadcn components to use for each section
    - Layout structure (grid columns, card groupings, responsive behavior)

## Tabs to improve

### Overview

High-level summary of all activity. Should answer: "What is the current state of the system?"

### Incidents

Tracks issues, flags, and anomalies. Should answer: "What went wrong and when?"

### Exams

Assessment activity and outcomes. Should answer: "How are exams performing and who needs attention?"

### Integrity

Behavioral and compliance signals. Should answer: "Are there integrity risks I should act on?"

## Output format

For each tab, structure your response as:

- Summary: one-sentence purpose of this tab
- Current gaps: what's missing or unclear
- Proposed layout: describe the component structure
- Key metrics: list the most important data points to surface
- Shadcn components: list specific components and their role
