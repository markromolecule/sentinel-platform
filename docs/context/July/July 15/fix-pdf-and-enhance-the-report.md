# PDF Report Generation and Template Management

## Purpose

Prepare a reliable, institution-scoped PDF generation capability for Sentinel before writing an
implementation plan. The immediate defect is on the Sentinel Support **Reports & Analytics >
Reports** page: selecting **Generate New Report** creates a row marked `READY`, but the row shows
**No file available** and no PDF can be downloaded.

The broader product request is to make the appearance of two PDF document families configurable:

1. analytics reports covering incidents, exam activity, and overall integrity; and
2. examination exports, whose exact content still needs a product decision.

This document separates the confirmed defect from the template-management enhancement so that the
implementation plan can phase the work without hiding the production fix inside a larger feature.

## Verified Current State

### Confirmed failure path

1. `app/sentinel-support/src/app/(protected)/analytics/reports/page.tsx` posts a fixed request with:
    - an automatically generated title;
    - `type: 'incident'`; and
    - `format: 'pdf'`.
2. `packages/hooks/src/query/analytics/use-generate-analytics-report-mutation.ts` calls the shared
   analytics service and refreshes the report list after success.
3. `app/sentinel-api/src/modules/general/analytics/analytics.service.ts` calls
   `createAnalyticsReportData` with `status: 'READY'`.
4. `app/sentinel-api/src/modules/general/analytics/data/create-analytics-report.ts` inserts the row
   with `file_url = null` unless a URL is explicitly supplied.
5. No renderer, PDF library, background job, file upload, or download endpoint is invoked.
6. `app/sentinel-support/src/app/(protected)/analytics/_components/analytics-reports-list.tsx`
   correctly disables download for a `READY` row whose `fileUrl` is empty and displays
   **No file available**.

The immediate root cause is therefore in report generation, not in the report table or download
button. The API records completion without creating or storing an artifact.

### Existing reusable data

The analytics backend already exposes data that can supply a combined report:

- high-level KPIs, including the integrity index;
- exam completion counts;
- incident trends;
- incident severity distribution;
- incident type distribution; and
- department integrity metrics.

The examination reporting module already supplies structured exam-level and attempt-level report
contracts under `app/sentinel-api/src/modules/examination/reporting`. These contracts can be reused
if the chosen examination export is a results/report document. They do not by themselves define a
printable blank examination paper.

### Current gaps and constraints

- The accepted analytics report types are `completion`, `incident`, and `performance`, while the
  requested document sections are incidents, exams, and integrity. The meanings need to be aligned.
- The Support UI currently generates only `incident`; there is no report configuration dialog or
  date-range input.
- `analytics_reports` has no explicit `institution_id`. Listing infers the institution by joining
  `analytics_reports.created_by` to the creator's current `user_profiles.institution_id`.
- The create-report endpoint does not accept a target institution. This is unsafe for a support or
  superadmin user who can act across institutions or has no institution profile.
- A report row has no failure reason, generation start/completion timestamps, storage object key,
  template/version reference, input snapshot, or retry metadata.
- The repository has a Supabase Storage upload example for passage images, but no storage flow for
  generated reports and no established PDF-generation dependency in `sentinel-api`.
- `institutions` currently has no institution-branding or logo field. The similarly named
  `oauth_clients.logo_uri` is unrelated and must not be reused.
- The Support analytics area already uses the requested persistent, responsive sidebar shell. Its
  current navigation has Overview, Incidents, Exams, Integrity, and Reports, but no Templates page.
- The instructor attempt-report UI has no PDF export action. No blank-examination PDF export path
  was found in `sentinel-web` or `sentinel-core`.

## Required Product Outcome

### 1. Repair analytics PDF generation

When an authorized user requests a PDF report for a specific institution, Sentinel must produce a
real PDF artifact, persist its ownership and generation state, and offer a working authorized
download. A report must never be marked `READY` until the file exists and is retrievable.

The default analytics PDF should be a combined institutional report with these sections:

1. **Cover and identity**
    - Sentinel branding;
    - institution name and institution logo when configured;
    - report title;
    - selected reporting period; and
    - generation timestamp.
2. **Executive summary**
    - total exams and attempts;
    - completed and dropped attempts;
    - active exams;
    - total incidents and flagged attempts; and
    - overall integrity index.
3. **Exam activity**
    - completion metrics and relevant breakdowns available for the selected scope.
4. **Incident analysis**
    - incident trend;
    - incident type distribution; and
    - incident severity distribution.
5. **Integrity overview**
    - overall integrity index; and
    - department-level completed, flagged, and dropped metrics.
6. **Document footer**
    - configurable footer content;
    - page number; and
    - generation/reference identifier.

The PDF content must come from one consistent institution and reporting-period snapshot. Empty
datasets must render a clear **No data for this period** state rather than failing generation or
silently omitting context.

### 2. Make generation state truthful and recoverable

Use an explicit lifecycle such as:

`PENDING -> GENERATING -> READY | FAILED`

Required behavior:

- create the report record for the explicitly selected institution;
- capture the requested report scope, reporting period, format, template version, and requester;
- render the artifact;
- upload it to the configured report storage location;
- set `READY` only after upload succeeds;
- record a safe failure code/message when generation or upload fails;
- allow an authorized user to retry a failed generation without creating ambiguous duplicates; and
- prevent a user from downloading a report owned by an institution outside their authorized scope.

Synchronous generation may be acceptable for a small first release only if request timeouts and
report size are bounded. Otherwise, the implementation plan should use a worker/queue and polling
or refetching. The lifecycle and storage contract should not depend on that execution choice.

### 3. Add PDF template management to Sentinel Support

Add a **PDF Templates** workspace to `sentinel-support` using the same responsive sidebar-layout
pattern as Subject Management and the existing Analytics workspace. It should separate the two
document families:

- **Analytics Report Template**
- **Examination Export Template**

For each template family, authorized support users should be able to:

- view the active template and its last editor/update time;
- edit supported header, body-layout, and footer settings;
- upload or select allowed branding assets;
- preview the template with deterministic sample data;
- save a draft;
- publish/activate a validated version;
- restore the system default; and
- see validation errors before publication.

The first release should use structured configuration rather than arbitrary HTML, JavaScript, or
CSS. A bounded schema is safer to validate, version, preview, and render consistently. Suggested
fields include:

- page size and orientation;
- margins;
- Sentinel logo visibility;
- institution logo visibility, placement, and maximum dimensions;
- document title/subtitle visibility;
- header alignment and divider;
- permitted section ordering and visibility;
- accent and text colors with accessible defaults;
- footer text;
- page-number visibility and format; and
- optional confidentiality label.

Templates must be versioned or snapshotted. Regenerating or downloading an old report must not
silently change its appearance because the active template was edited later.

### 4. Support institution branding without losing Sentinel identity

The system default must always be capable of rendering a Sentinel header. If institution branding
is enabled, the institution logo augments the Sentinel identity unless product explicitly approves
an institution-only mode.

Logo uploads require:

- an explicit institution owner;
- allowed raster/vector MIME types decided during planning;
- file-size and image-dimension limits;
- safe server-side validation rather than trusting file extensions;
- an accessible text fallback using the institution name;
- replace/remove behavior; and
- cleanup rules for superseded assets.

The implementation plan must choose who is allowed to upload institution logos. The current request
mentions both support-managed templates and institution uploads, but `sentinel-support` is not an
institution self-service portal by itself.

### 5. Define the examination export before implementing it

“Export the examination to PDF” is currently ambiguous. It could mean one or more of:

- a blank question paper for distribution;
- a question paper with a separate answer key;
- an individual student's submitted answers and scores;
- an instructor attempt report, including grading and incidents; or
- an exam-level results summary covering all students.

The implementation plan must not assume these are the same document. Each has different source
data, authorization, privacy, pagination, and answer-visibility rules. Once the intended variants
are selected, the examination template must define at least:

- exam/institution/subject metadata;
- question numbering and section grouping;
- rendering rules for every supported question type;
- passage and image behavior;
- answer-space behavior for blank papers;
- whether correct answers, scores, student answers, grading feedback, and incidents are included;
- page-break/orphan rules; and
- separate answer-key handling, if applicable.

Correct answers and confidential attempt data must never be included merely because a template
field is enabled; the export variant and the caller's permission must also allow them.

## Data Ownership and Configuration Precedence

The data model should represent report ownership directly rather than deriving it from the report
creator. At minimum, every generated report needs an immutable `institution_id`, even when the
requester is support or superadmin.

Template precedence should be decided explicitly. A reasonable default is:

1. institution-specific published template, when institution overrides are supported;
2. globally published Support template; then
3. built-in Sentinel default.

The system must record which resolved template/version was used for each artifact. If only global
templates are in the first release, institution overrides should be declared out of scope rather
than implied by the logo requirement.

## API and Module Boundaries

Backend work should follow the repository's DTO/controller/service/data-or-query/route separation.
The plan should cover contracts for:

- generating an institution-scoped report with report period and template resolution;
- listing generation records within an authorized institution scope;
- reading generation status and safe failure information;
- downloading through an authorization-checked endpoint or short-lived signed URL;
- retrying failed generation;
- reading, validating, previewing, saving, publishing, and restoring templates; and
- uploading/removing institution branding assets.

Shared API clients belong in `packages/services`, and React Query hooks/mutations and cache-key
invalidation belong in `packages/hooks`. Do not put API calls directly in Support page components.

The create request must not trust a client-supplied institution ID without verifying that the
authenticated user may act on that institution. Listing and downloading must apply the same scope
rule.

## Security, Privacy, and Operational Requirements

- Prefer private report storage and short-lived, authorization-checked downloads because reports
  may contain student and incident data.
- Do not persist an unrestricted public URL for a confidential report.
- Sanitize all configurable text and reject executable markup.
- Fetch template assets only from controlled storage; do not allow arbitrary renderer URLs that
  could enable server-side request forgery.
- Record generation, template publication, branding update, download, retry, and failure events in
  the existing audit/logging system where appropriate.
- Define retention and deletion behavior for generated PDFs and replaced assets.
- Ensure repeated requests, retries, and worker restarts cannot incorrectly mark a missing artifact
  as ready.
- Keep secrets and storage credentials server-side.

## UX Requirements

### Report generation

- Replace the fixed one-click action with a dialog if the user must choose institution, reporting
  period, title, or report variant.
- Show pending/generating progress, ready download, failure details, and retry states.
- Disable duplicate submission while a request is being accepted.
- Refresh or poll while generation is active.
- Preserve server pagination and avoid inserting records into the wrong scoped list.

### Template workspace

- Use persistent desktop sidebar navigation and a compact mobile navigation equivalent.
- Keep Analytics Report and Examination Export as separate destinations or clearly separated tabs.
- Provide live or explicitly refreshed preview using representative sample fixtures.
- Warn about unsaved changes.
- Distinguish draft edits from the published template used by generation.
- Explain whether the preview uses the system default, global template, or institution override.

## Acceptance Criteria

### Immediate report fix

- Generating a report creates a valid PDF whose first bytes and content type identify it as a PDF.
- The artifact contains Sentinel branding and the required incidents, exams, and integrity sections.
- A report is not `READY` while its artifact or authorized download is unavailable.
- A ready row downloads/opens the expected non-empty PDF.
- A generation or upload failure produces `FAILED`, a safe user-visible message, and a retry action.
- The report and every metric inside it belong to the explicitly selected institution and period.
- Users cannot list or download another institution's report without cross-institution authority.
- No-data periods still produce a valid, understandable report.

### Templates and branding

- Authorized support users can edit and preview both template families independently.
- Invalid colors, dimensions, asset types, or unsupported layout values cannot be published.
- Publishing a new template affects only future generations unless regeneration is explicitly
  requested.
- The generated output records the template version/snapshot it used.
- Institution branding resolves according to the approved precedence and falls back cleanly when no
  institution logo exists.
- Unauthorized users cannot modify global templates or another institution's branding.
- Preview and generated output use the same rendering rules and representative content fixtures.

### Examination export

- Acceptance criteria for exam export must be added after the export variants and answer-visibility
  rules are approved.
- Every supported question type, passage, image, long-content case, and page-break case has a
  rendering fixture.

## Testing Expectations

The implementation plan should include:

- unit tests for template validation, configuration precedence, report-state transitions, and PDF
  view-model mapping;
- service/data tests proving explicit institution ownership and failure-state persistence;
- controller tests for validation, permissions, cross-institution access, and download behavior;
- hook/service tests for payloads, status polling/refetching, retry, and cache invalidation;
- Support UI tests for dialog state, generation states, template draft/publish flow, and navigation;
- integration tests that create, store, authorize, and retrieve a non-empty PDF; and
- visual/golden fixtures for headers, footers, tables/charts, long text, empty data, and all approved
  examination export variants.

PDF assertions should validate both the artifact contract and selected extracted content. Snapshot
tests alone are not sufficient for authorization, ownership, or storage behavior.

## Recommended Delivery Boundaries

This is context for a later implementation plan, but the plan should preserve these separable
outcomes:

1. **Foundation and defect repair**: explicit institution ownership, truthful lifecycle, combined
   analytics PDF rendering, secure storage/download, failure/retry behavior, and the built-in
   Sentinel template.
2. **Template administration**: structured global templates, preview, draft/publish/version flow,
   Support workspace, and institution branding.
3. **Examination export**: only after the intended document variants and confidentiality rules are
   approved.

The first outcome must remain independently releasable. Template-management scope should not delay
repairing the existing broken Generate New Report flow.

## Decisions Required Before the Implementation Plan Is Finalized

1. Which examination export variants are required: blank paper, answer key, student submission,
   attempt report, exam-level results, or a defined subset?
2. Is the analytics PDF always a combined incidents/exams/integrity report, or must users also
   generate section-specific reports? What should happen to the existing `completion`, `incident`,
   and `performance` type values?
3. Which date presets and maximum custom reporting period are required, and which timezone defines
   period boundaries?
4. Who chooses the target institution and who may generate reports across institutions?
5. Are templates global-only at first, or may institutions override them?
6. Where do institution users upload their logo: an existing institution settings surface, a new
   self-service surface, or through authorized Support staff?
7. Must the Sentinel logo always remain visible, or may an institution publish institution-only
   branding?
8. Which header/body/footer fields are configurable in the first release, and is section reordering
   required?
9. Should generation be asynchronous from the first release, and what are the report size, timeout,
   retry, and concurrency limits?
10. What storage bucket, retention period, deletion policy, and signed-download lifetime are
    required?
11. Which roles/permissions can manage global templates, institution overrides, branding, report
    generation, and downloads?
12. Must `csv` and `xlsx` remain supported? The API accepts them today, but no artifact generator is
    implemented for any format.

## Planning Readiness Gate

An implementation plan is ready to be written when:

- the examination export variants are named;
- analytics report type and date-range semantics are approved;
- global versus institution template ownership is decided;
- logo ownership/upload responsibility is decided;
- authorization rules are mapped to roles/permissions;
- the PDF renderer and secure storage/download approach are selected;
- synchronous versus queued execution is decided with operational limits; and
- retention, versioning, and audit requirements are approved.
