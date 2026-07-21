# PDF Generation Operations

This runbook covers the Support PDF worker, private storage behavior, retention, and recovery for:

- overall analytics report PDFs
- examination answer key PDFs
- published template assets
- institution branding logos

## Trigger-only production mode

For low-volume production deployments using a command-limited Redis plan, generate PDFs only
when an export is requested:

```env
PDF_GENERATION_MODE=sync
ENABLE_EMBEDDED_PDF_WORKER=false
```

Do not run `pnpm --dir app/sentinel-api start:pdf-worker` in this mode. The API invokes the PDF
processor directly only after an export request, so PDF generation creates no idle Redis traffic.

Direct processing is fire-and-forget inside the API process. An API restart during rendering can
interrupt a job, so operators must monitor exports stuck in `PENDING` and allow users to retry.

## Redis worker topology

API requests queue jobs when `PDF_GENERATION_MODE=redis`. Redis mode is opt-in and is appropriate
when durable BullMQ retries are more important than eliminating idle Redis commands.

Worker ownership rules:

- **API Processes:** `ENABLE_EMBEDDED_PDF_WORKER` defaults to `false` (opt-in only). API replicas will NOT start embedded PDF workers unless `ENABLE_EMBEDDED_PDF_WORKER=true` is explicitly configured.
- **Dedicated Worker:** Production environments should run exactly **one** dedicated worker process via `pnpm --dir app/sentinel-api start:pdf-worker` with `PDF_GENERATION_MODE=redis`. API replicas should keep `ENABLE_EMBEDDED_PDF_WORKER=false`.
- **Single-Process Deployments:** Set `ENABLE_EMBEDDED_PDF_WORKER=true` on the API container and do not launch a separate dedicated worker process.

When Redis mode is selected, do not fall back silently to direct processing. If Redis or the
worker is down, job submission should fail clearly and be treated as an operator-visible incident.

## Required environment & worker tuning

Required values for both modes:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PDF_ARTIFACTS_BUCKET`
- `PDF_ASSETS_BUCKET`

Required only for Redis worker mode:

- `REDIS_URL`
- `PDF_GENERATION_QUEUE_NAME` (default: `pdf-generation`)
- `PDF_WORKER_CONCURRENCY` (default: `2`)
- `PDF_WORKER_DRAIN_DELAY_SECONDS` (default: `120` seconds)
- `PDF_WORKER_STALLED_INTERVAL_MS` (default: `300000` ms / 5 minutes)
- `PDF_GLOBAL_CONCURRENCY`
- `PDF_JOB_ATTEMPTS`
- `PDF_JOB_BACKOFF_MS`
- `PDF_JOB_TIMEOUT_MS`
- `PDF_SIGNED_URL_TTL_SECONDS`
- `ANALYTICS_REPORT_RETENTION_DAYS`
- `PDF_MAX_REPORT_RANGE_DAYS`
- `PDF_MAX_ARTIFACT_BYTES`

Safe defaults for local development are documented in [app/sentinel-api/.env.example](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/.env.example).

## Redis command budget & polling trade-offs

To prevent idle BullMQ workers from consuming Redis command allowances (e.g. Upstash limits):

- **Drain Delay (`PDF_WORKER_DRAIN_DELAY_SECONDS`):** Set to `120` seconds. On an empty queue, BullMQ long-polls Redis up to 120 seconds per blocking loop. When a new job arrives, Redis marker pops wake the worker immediately without latency penalty.
- **Stalled Interval (`PDF_WORKER_STALLED_INTERVAL_MS`):** Set to `300000` ms (5 minutes). This reduces background `moveToActive` / `stalled` Lua script invocations to 12 per hour while preserving lock renewal for active jobs.
- **Idle Budget:** A single worker with these parameters executes ~233,000 commands per 30 days while idle, leaving sufficient allowance for actual PDF generation workloads on a 500k monthly plan.
- **Trade-off:** Increasing the stalled check interval means that if a worker process crashes abruptly during job execution, BullMQ will wait up to 5 minutes before re-assigning the stalled job to another worker. Lock renewal remains enabled to ensure active jobs are not misidentified as stalled.

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
