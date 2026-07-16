# PDF Generation Operations

This runbook covers the Support PDF worker, private storage behavior, retention, and recovery for:

- overall analytics report PDFs
- examination answer key PDFs
- published template assets
- institution branding logos

## Worker startup

API requests only queue jobs. Rendering must happen in the dedicated worker process.

- Development:
  - `pnpm --dir app/sentinel-api dev`
  - `pnpm --dir app/sentinel-api dev:pdf-worker`
- Production:
  - start the API service
  - start `pnpm --dir app/sentinel-api start:pdf-worker`

Do not rely on synchronous fallback when Redis is unavailable. If Redis or the worker is down, job submission should fail clearly and be treated as an operator-visible incident.

## Required environment

Required production values:

- `REDIS_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PDF_ARTIFACTS_BUCKET`
- `PDF_ASSETS_BUCKET`
- `PDF_GENERATION_QUEUE_NAME`
- `PDF_WORKER_CONCURRENCY`
- `PDF_GLOBAL_CONCURRENCY`
- `PDF_JOB_ATTEMPTS`
- `PDF_JOB_BACKOFF_MS`
- `PDF_JOB_TIMEOUT_MS`
- `PDF_SIGNED_URL_TTL_SECONDS`
- `ANALYTICS_REPORT_RETENTION_DAYS`
- `PDF_MAX_REPORT_RANGE_DAYS`
- `PDF_MAX_ARTIFACT_BYTES`

Safe defaults for local development are documented in [app/sentinel-api/.env.example](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/.env.example).

## Buckets and privacy

Use private Supabase buckets only:

- `sentinel-pdf-artifacts`
- `sentinel-pdf-assets`

Rules:

- never make report or answer-key buckets public
- issue signed URLs on demand only
- keep signed URL lifetime short; current default is 5 minutes
- never log signed URLs, service keys, PDF body text, answer keys, or raw logo bytes

## Queue metrics to watch

At minimum, monitor:

- queued jobs
- active jobs
- failed jobs
- retry count distribution
- queue latency from `PENDING` to worker start
- render duration per document kind
- worker memory during report and answer-key generation

Recommended alert cases:

- queue backlog grows while worker throughput is flat
- repeated failures for one institution or one exam
- memory spikes during 366-day analytics renders
- jobs stuck in `PENDING` without a matching BullMQ job

## Failed-job investigation

When a job fails:

1. inspect the export row status, failure code, and failure message
2. inspect worker logs for the matching export ID
3. confirm Redis connectivity and worker health
4. confirm the template snapshot, storage bucket, and institution scope are valid
5. confirm Supabase private storage operations are succeeding

Common classes:

- `TRANSIENT_ERROR`: retry is usually safe
- `UNRECOVERABLE_ERROR`: fix the source data or configuration first

## Safe retry procedure

Retry only exports in `FAILED`.

- analytics reports: use the retry endpoint or Support UI
- answer keys: use the retry endpoint or Support UI

Before retrying at scale:

- verify the root cause is resolved
- verify storage credentials are valid
- verify the selected template is still usable
- avoid bulk retries during a queue backlog unless capacity is known

## Retention policy

Analytics reports:

- private PDF object retained for 7 days after successful generation
- metadata row remains for audit/history
- cleanup moves the row to `EXPIRED`
- expired analytics artifacts must no longer produce a signed download URL

Answer keys:

- no automatic time-based expiry in this release
- remain private until explicitly deleted or their parent exam is permanently deleted

Templates and branding:

- no automatic time-based expiry

## Seven-day cleanup

Run cleanup on a schedule at least daily.

Cleanup behavior:

- deletes expired analytics PDF objects from private storage
- marks the matching `analytics_reports` row as `EXPIRED`
- clears persisted storage coordinates for the expired artifact
- does not delete answer keys, templates, or branding

If cleanup partially fails:

- leave the row visible for audit
- re-run cleanup after storage or database issues are resolved

## Orphan-object reconciliation

If storage deletion fails or records are manually changed, reconcile by comparing:

- `analytics_reports.storage_bucket` + `storage_path`
- `exam_answer_key_exports.storage_bucket` + `storage_path`
- `institution_pdf_branding.logo_storage_bucket` + `logo_storage_path`

Safe reconciliation rules:

- never delete a storage object unless the owning record is confirmed missing or expired by policy
- never purge answer-key objects through analytics retention cleanup
- record any manual reconciliation in operations notes

## Accessibility verification checklist

Before release, verify generated PDFs have:

- meaningful text content, not screenshot-only content
- readable contrast
- predictable heading order
- repeated page numbers where enabled
- visible Sentinel branding on analytics reports
- no clipped header, footer, or body text

## Load-testing checklist

Measure at minimum:

- representative 30-day analytics report
- maximum 366-day analytics report
- large mixed-question answer key

Record:

- render duration
- queue wait time
- PDF byte size
- page count
- peak worker memory
- whether concurrency `2` remains safe

Use those results before increasing worker concurrency or artifact size limits.
