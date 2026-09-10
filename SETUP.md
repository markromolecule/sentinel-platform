# Sentinel Project Setup Guide

This guide details the procedure to clone, configure, and run the Sentinel project locally.

## Prerequisites

- **Node.js**: Version 22.x or later.
- **Git**: For version control.
- **pnpm**: Recommended package manager.

## 1. Clone the Repository

```bash
git clone <repository_url>
cd sentinel
```

## 2. Automated Setup (Recommended)

We have provided a script to automate the installation and initial configuration.

```bash
./scripts/setup.sh
```

This script will:

1.  Check for `pnpm` (and install it via `npm` if missing).
2.  Install all project dependencies.
3.  Create `.env` and `.env.local` files from example templates if they don't exist.
4.  Generate the Prisma client.

## 3. Manual Configuration

If you prefer to set up manually:

### 3.1 Install Dependencies

```bash
pnpm install
```

### 3.2 Configure Environment Variables

You need to set up environment variables for both the API and Web applications.

**For `app/sentinel-api`:**
Copy `app/sentinel-api/.env.example` to `app/sentinel-api/.env` and fill in your Supabase/PostgreSQL credentials.

```bash
cp app/sentinel-api/.env.example app/sentinel-api/.env
```

Required variables:

- `DATABASE_URL`: Connection string to your database (Transaction mode usually).
- `DIRECT_URL`: Direct connection string (Session mode) for migrations.
- `SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key.

**For `app/sentinel-web`:**
Copy `app/sentinel-web/.env.example` to `app/sentinel-web/.env.local`.

```bash
cp app/sentinel-web/.env.example app/sentinel-web/.env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `NEXT_PUBLIC_API_URL`: URL of the backend API (default: `http://localhost:3001`).

### 3.3 Configure AI Question Generation (Vertex AI & Google AI Studio)

Sentinel supports dual-mode AI question generation. Vertex AI is recommended to consume active Google Cloud promotional and developer benefits credits (e.g. $40 monthly Google Developer Program credits).

#### Option A: Google Cloud Vertex AI (Recommended)

1. **Obtain Service Account Key:**
   - In Google Cloud Console, navigate to **IAM & Admin** > **Service Accounts**.
   - Create or select a Service Account with the **Vertex AI User** role (`roles/aiplatform.user`).
   - Navigate to the **Keys** tab, click **Add Key** > **Create new key** (JSON format), and download it.

2. **Local Development Setup:**
   - Rename/copy the downloaded key file to `app/sentinel-api/gcp-key.json` (or `./gcp-key.json`). Both locations are protected by `.gitignore`.
   - In `app/sentinel-api/.env`, configure:
     ```env
     GOOGLE_GENAI_USE_VERTEXAI="true"
     GOOGLE_APPLICATION_CREDENTIALS="./gcp-key.json"
     GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
     GOOGLE_CLOUD_LOCATION="us-central1"
     ```

3. **Production / Container Deployments (Railway, Docker, Kubernetes):**
   - For ephemeral containers where mounting key files is impractical, pass the service account key directly as an environment variable:
     ```env
     GOOGLE_GENAI_USE_VERTEXAI="true"
     GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
     GOOGLE_CLOUD_LOCATION="us-central1"
     GCP_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'
     ```
   - Alternatively, pass a base64-encoded key string via `GCP_SA_KEY_BASE64`.

4. **Verifying Credit Drawdown:**
   - Go to Google Cloud Console > **Billing** > **Reports**.
   - Group by **Service** or filter by **Vertex AI**.
   - Check the **Credits** section to confirm charges are drawn down against your active promotional credit balance (`CREDIT_TYPE_MONTHLY`).

#### Option B: Google AI Studio Fallback

To bypass Vertex AI and use Google AI Studio directly (e.g. in offline or local tests without GCP credentials):
- Leave `GOOGLE_GENAI_USE_VERTEXAI="false"` or unset.
- Provide a valid `GEMINI_API_KEY` in `app/sentinel-api/.env`.

### 3.4 Database Setup

The project uses Prisma. Ensure your database is accessible.

To push the schema to your database (if starting fresh):

```bash
cd app/sentinel-api
npx prisma db push
cd ../..
```

To generate the client (if not done by install):

```bash
cd app/sentinel-api
npx prisma generate
cd ../..
```

## 4. Running the Project

To start the development server for all apps (API and Web):

```bash
pnpm dev
```

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)

## Troubleshooting

- **Prisma Client issues**: Run `pnpm turbo run build` or `cd app/sentinel-api && npx prisma generate`.
- **Connection errors**: Double-check your `DATABASE_URL` in `app/sentinel-api/.env`.
