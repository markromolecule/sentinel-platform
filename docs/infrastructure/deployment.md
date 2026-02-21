# Deployment Strategy

The Sentinel architecture consists of decoupled frontend applications, backend services, and a unified database structure allowing for flexible deployment environments. 

## Infrastructure Components

### Web Client (`sentinel-web`)
The Next.js front-end application is best deployed on static hosting platforms optimized for SSR (Server-Side Rendering) and edge network delivery, such as **Vercel**. Vercel natively understands Next.js build steps, handling Turborepo pipelines correctly. Vercel automatically creates preview environments upon Pull Requests.

### Mobile Client (`sentinel-mobile`)
The React Native mobile deployment is managed through **EAS (Expo Application Services)**. 
- **Development/Testing**: Builds can be dispatched using `eas build` to test on Expo Go or dedicated internal environments. 
- **Production**: Updates can be sent Over-The-Air (OTA) utilizing EAS Update, while native binary updates get directed to the Apple App Store and Google Play Store directly.

### Backend API (`sentinel-api`)
The Hono-based backend takes advantage of Edge computing capabilities. The runtime can be hosted seamlessly as a container or deployed as serverless functions (e.g., Cloudflare Workers, Vercel Edge Functions, or AWS Lambda), guaranteeing instant horizontal scalability depending on API load conditions. 

### Database (Supabase)
The database operates on **Supabase**. Connecting the staging and production API involves applying Prisma migrations iteratively.
- For local operations, developers utilize Supabase's local CLI for seamless spin-ups without interacting with remote stages.
- When pushing configuration, `prisma migrate deploy` translates the SQL steps onto the targeted Supabase endpoints.

## CI/CD Workflow
- Continuous Integration relies heavily on internal `test` and `lint` pipeline scripts governed by Turborepo. Checks via **GitHub Actions** prevent broken code from integrating into main branches.
- Deployments generally hook onto `main` branch merges which activate environment variable triggers for subsequent production deployments.
- **Dependabot** provides scheduled updates ensuring vulnerable packages are bumped regularly across the monorepo architecture.
