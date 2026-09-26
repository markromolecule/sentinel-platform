# Railway Redis Provisioning and Migration Runbook

This operational runbook provides step-by-step instructions for provisioning and configuring a dedicated Railway Redis database, linking it to `sentinel-api` and background queue workers (`sentinel-ai-worker`, `sentinel-telemetry-worker`), verifying zero-downtime cutover, and monitoring circuit breaker resilience.

---

## 1. Background & Architecture

### The Problem with Request-Metered Redis (Upstash)
- **Metering Quotas:** Serverless Redis providers such as Upstash meter total command executions (typically 500,000 requests/month on pay-as-you-go).
- **Background Worker Polling:** BullMQ workers continuously poll Redis (`bzpopmin`, stalled job sweep queries). Two idle workers issue ~18,000–24,000 commands/day, exhausting the 500k monthly quota in ~25 days even with zero user workloads.
- **Runaway Error Spin:** When request limits are hit, commands immediately fail with `ERR max requests limit exceeded`. Unthrottled worker loops fail in ~2ms and retry instantly, burning 100% CPU.

### Target Topology (Railway Redis)
- **Unmetered & Low Cost:** A dedicated Railway Redis plugin provides persistent in-memory Redis over private network (`.railway.internal`) with no command-count limitations, costing ~$0.50–$1.00/month.
- **Producer / Consumer Separation:**
  - `sentinel-api`: Producer only. Accepts client requests (`POST /ai/generate-preview/jobs`), creates job records, and enqueues tasks into BullMQ. Embedded worker is disabled (`ENABLE_EMBEDDED_AI_WORKER=false`).
  - `sentinel-ai-worker`: Dedicated worker container. Runs `pnpm --dir app/sentinel-api start:ai-worker` to pull jobs, process documents via Gemini, and update progress.

---

## 2. Provisioning Railway Redis

1. Open your project in the [Railway Dashboard](https://railway.app/).
2. Click **Create** or **+ New** in the project canvas.
3. Select **Database** -> **Add Redis**.
4. Railway will spin up a dedicated Redis container within your project network.
5. In the Redis service settings:
   - Check the **Variables** tab.
   - Locate `REDIS_URL` or `REDIS_PRIVATE_URL`.
   - The private connection string typically looks like:
     ```
     redis://default:<password>@redis.railway.internal:6379
     ```
   - Using Railway's private networking variable reference `${{Redis.REDIS_URL}}` ensures encrypted, internal-only communication with no public egress fees.

---

## 3. Configuring Services in Railway

### 3.1. `sentinel-api` (API Web Service)

In Railway under `sentinel-api` > **Variables**:

| Environment Variable | Recommended Value | Description |
|---|---|---|
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Connects API to the shared Railway Redis instance |
| `ENABLE_EMBEDDED_AI_WORKER` | `false` | Ensures the API server acts only as a producer, not a poller |
| `ENABLE_EMBEDDED_PDF_WORKER` | `false` | Ensures the API server does not poll PDF generation jobs |

Deploy `sentinel-api` to apply the updated environment variables.

---

### 3.2. `sentinel-ai-worker` (Dedicated AI Worker Service)

If not already created as a separate Railway service:
1. In the Railway project, add a new service from the same GitHub repository: **New Service** -> **GitHub Repo** -> select `sentinel`.
2. Name the service `sentinel-ai-worker`.
3. In **Settings** > **Deploy**:
   - **Custom Build Command:** (leave default monorepo build or `pnpm --dir app/sentinel-api build`)
   - **Custom Start Command:**
     ```bash
     pnpm --dir app/sentinel-api start:ai-worker
     ```
4. In **Variables**:

| Environment Variable | Recommended Value | Description |
|---|---|---|
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Connection string to Railway Redis |
| `NODE_ENV` | `production` | Enables production mode |
| `AI_GENERATION_QUEUE_NAME` | `ai-generation` | Queue name (default) |
| `AI_GENERATION_WORKER_CONCURRENCY` | `2` | Number of simultaneous AI generation jobs |
| `AI_GENERATION_WORKER_DRAIN_DELAY_SECONDS` | `30` | Idle poll interval (reduces command consumption) |
| `AI_GENERATION_WORKER_STALLED_INTERVAL_MS` | `120000` | Stalled check interval (2 minutes) |
| `GEMINI_API_KEY` | `${{GEMINI_API_KEY}}` | API key for Gemini / Vertex AI |
| `SUPABASE_URL` | `${{SUPABASE_URL}}` | Supabase API endpoint for manifest downloads |
| `SUPABASE_SERVICE_ROLE_KEY` | `${{SUPABASE_SERVICE_ROLE_KEY}}` | Supabase storage access |
| `DATABASE_URL` | `${{DATABASE_URL}}` | Database connection string for job repository |

---

### 3.3. `sentinel-telemetry-worker` (Telemetry Worker Service)

Ensure `REDIS_URL` in `sentinel-telemetry-worker` is also updated to:
```
REDIS_URL=${{Redis.REDIS_URL}}
```

---

## 4. Verification & Cutover Checks

### Step 1: Verify AI Worker Clean Startup
Inspect the deployment logs of `sentinel-ai-worker`. You should observe:
```text
[AiWorker] Operational mode is "redis". Initializing Redis connection...
[AiWorker] Starting BullMQ AI Worker on queue "ai-generation" (concurrency: 2, drainDelay: 30s, stalledInterval: 120000ms)...
[AiWorker] AI Generation Worker initialized successfully on queue "ai-generation".
```

### Step 2: Verify API Producer Startup
Inspect the logs of `sentinel-api`. You should observe:
```text
[startup] Starting API server on port 3000...
```
*(Notice that `[AiWorker]` startup is **not** present in `sentinel-api` logs because `ENABLE_EMBEDDED_AI_WORKER=false`)*.

### Step 3: Test End-to-End AI Generation
1. In the Sentinel web app, navigate to an assessment creation view.
2. Upload lecture/curriculum documents and request AI question generation.
3. Observe the network tab:
   - `POST /ai/generate-preview/jobs` returns `202 Accepted` with a `jobId`.
4. Observe `sentinel-ai-worker` logs:
   ```text
   [AiWorker] [job-xxx] Starting generation (attempt 1/3)
   [AiWorker] [job-xxx] Retrieving stored input manifest...
   [AiWorker] [job-xxx] Generating preview questions via Gemini...
   [AiWorker] [job-xxx] Job completed successfully.
   ```
5. Confirm client receives question previews without HTTP 503 errors.

---

## 5. Circuit Breaker & Error Handling Observability

The AI worker includes an automated circuit breaker to prevent runaway CPU loops during unexpected Redis degradation:

1. **Trip Condition:** If a Redis connection or command error occurs on the worker connection, `handleWorkerError` catches the error.
2. **Backoff Pausing:**
   - Worker execution is paused immediately: `await targetWorker.pause(true)`.
   - Delay increases exponentially: $5\text{s} \to 10\text{s} \to 20\text{s} \to 30\text{s}$ (max).
   - Log throttling ensures only 1 error line is emitted every 10 seconds.
3. **Resumption:**
   - Once the backoff window elapses, the worker checks `!targetWorker.closing` and resumes consumption (`await targetWorker.resume()`).
   - When the worker processes a job successfully, consecutive error counts reset to 0.

---

## 6. Troubleshooting & Rollback

### Worker Stays in Paused / Backoff State
- **Symptom:** Logs show `[AiWorker] Circuit breaker tripped. Pausing worker for 30s...` repeatedly.
- **Cause:** Redis server is unreachable, credentials expired, or network route is down.
- **Remediation:**
  1. Check Railway Redis metrics (CPU, Memory, Connection count).
  2. Verify that `REDIS_URL` matches the Railway Redis private connection string.
  3. Ping Redis using Railway CLI: `railway run --service sentinel-ai-worker redis-cli -u $REDIS_URL ping`.

### Jobs Stalled or Not Picked Up
- **Symptom:** Jobs stay in `pending` status indefinitely.
- **Remediation:**
  1. Check that `sentinel-ai-worker` is in the `RUNNING` state in Railway.
  2. Confirm both `sentinel-api` and `sentinel-ai-worker` use the exact same `AI_GENERATION_QUEUE_NAME` (default: `ai-generation`).
