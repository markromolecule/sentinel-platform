# Issue:

@app/sentinel-web/src/app/(protected)/(instructor)/exams/page.tsx

- Error: {
  sentinel-api:dev: name: 'Error',
  sentinel-api:dev: message: 'Exam settings and configuration are locked once the exam is published.',
  sentinel-api:dev: stack: 'Error: Exam settings and configuration are locked once the exam is published.\n' +
  sentinel-api:dev: ' at assertExamConfigurationMutable (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/services/assert-exam-configuration-mutable.ts:9:15)\n' +
  sentinel-api:dev: ' at <anonymous> (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/update-exam.ts:138:13)\n' +
  sentinel-api:dev: ' at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n' +
  sentinel-api:dev: ' at async <anonymous> (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/src/create-db-client.ts:16:16)\n' +
  sentinel-api:dev: ' at async Proxy.\_transactionWithCallback (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/generated/client/runtime/client.js:79:4668)\n' +
  sentinel-api:dev: ' at async executeTransaction (/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/src/create-db-client.ts:13:12)\n' +
  sentinel-api:dev: ' at async executeExamTransaction (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/execute-exam-transaction.ts:4:12)\n' +
  sentinel-api:dev: ' at async updateExam (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/update-exam.ts:122:5)\n' +
  sentinel-api:dev: ' at async ExamService.updateExam (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/exam.service.ts:35:16)\n' +
  sentinel-api:dev: ' at async updateExamRouteHandler (/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/controllers/update-exam.controller.ts:52:18)',
  sentinel-api:dev: path: '/exams/62a4c028-2d07-411e-aab0-907e3b1f55a5',
  sentinel-api:dev: method: 'PUT'
  sentinel-api:dev: }

---

# Goal:

- Analyze the issue
- Provide a to-do-workflow and follow 1-3-1 rule to patch it
- Implement on the support @app/sentinel-support/src/app/(protected)/(support)/access-control/roles/page.tsx that will enable the instructor to republished the exam that's already on archive
- Ensure to update both backend and frontend and all the mutation needed to allow this changes
