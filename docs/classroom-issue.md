# Issue

- Invalid `prisma.$queryRawUnsafe()` invocation: Raw query failed. Code: `42883`. Message: `function max(uuid) does not exist`

sentinel-api:dev: prisma:error
sentinel-api:dev: Invalid `prisma.$queryRawUnsafe()` invocation:
sentinel-api:dev:
sentinel-api:dev:
sentinel-api:dev: Raw query failed. Code: `42883`. Message: `function max(uuid) does not exist`
sentinel-api:dev: Get classroom instructors error: PrismaClientKnownRequestError:
sentinel-api:dev: Invalid `prisma.$queryRawUnsafe()` invocation:
sentinel-api:dev:
sentinel-api:dev:
sentinel-api:dev: Raw query failed. Code: `42883`. Message: `function max(uuid) does not exist`
sentinel-api:dev: at Gr.handleRequestError (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:69:8286)
sentinel-api:dev: at Gr.handleAndLogRequestError (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:69:7581)
sentinel-api:dev: at Gr.request (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:69:7288)
sentinel-api:dev: at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
sentinel-api:dev: at async a (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:79:6730)
sentinel-api:dev: From prisma-extension-kysely:
sentinel-api:dev: Error
sentinel-api:dev: at /Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/kysely@0.28.14/node_modules/kysely/dist/cjs/query-executor/query-executor-base.js:37:45
sentinel-api:dev: at DefaultConnectionProvider.provideConnection (/Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/kysely@0.28.14/node_modules/kysely/dist/cjs/driver/default-connection-provider.js:12:26)
sentinel-api:dev: at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
sentinel-api:dev: at async DefaultQueryExecutor.executeQuery (/Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/kysely@0.28.14/node_modules/kysely/dist/cjs/query-executor/query-executor-base.js:36:16)
sentinel-api:dev: at async SelectQueryBuilderImpl.execute (/Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/kysely@0.28.14/node_modules/kysely/dist/cjs/query-builder/select-query-builder.js:319:24)
sentinel-api:dev: at async listClassroomInstructors (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-instructor-management.service.ts:126:25)
sentinel-api:dev: at async ClassroomService.getClassroomInstructors (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/classroom.service.ts:195:16)
sentinel-api:dev: at async getClassroomInstructorsRouteHandler (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/controllers/get-classroom-instructors.controller.ts:52:29)
sentinel-api:dev: at async dispatch (/Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/hono@4.12.9/node_modules/hono/dist/cjs/compose.js:43:17)
sentinel-api:dev: at async /Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/hono@4.12.9/node_modules/hono/dist/cjs/validator/validator.js:102:12 {
sentinel-api:dev: code: 'P2010',
sentinel-api:dev: meta: {
sentinel-api:dev: driverAdapterError: DriverAdapterError: function max(uuid) does not exist
sentinel-api:dev: at PrismaPgAdapter.onError (/Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/@prisma+adapter-pg@7.5.0/node_modules/@prisma/adapter-pg/dist/index.js:687:11)
sentinel-api:dev: at PrismaPgAdapter.performIO (/Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/@prisma+adapter-pg@7.5.0/node_modules/@prisma/adapter-pg/dist/index.js:682:12)
sentinel-api:dev: at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
sentinel-api:dev: at async PrismaPgAdapter.queryRaw (/Applications/XAMPP/xamppfiles/htdocs/sentinel/node_modules/.pnpm/@prisma+adapter-pg@7.5.0/node_modules/@prisma/adapter-pg/dist/index.js:602:30)
sentinel-api:dev: at async e.interpretNode (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:15:44573)
sentinel-api:dev: at async e.run (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:15:43287)
sentinel-api:dev: at async e.execute (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:61:815)
sentinel-api:dev: at async jt.request (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:62:2327)
sentinel-api:dev: at async Object.singleLoader (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:69:6569)
sentinel-api:dev: at async Gr.request (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:69:7175) {
sentinel-api:dev: cause: [Object]
sentinel-api:dev: }
sentinel-api:dev: },
sentinel-api:dev: clientVersion: '7.5.0'

---

# Enhancement

- Make the classroom row to be clickable to enter the classroom instead of relying on the action button - open
- Can you make the assigned instructors components to become a button in that way the table only showing on the classroom/id page, you can add the button next to the add students
