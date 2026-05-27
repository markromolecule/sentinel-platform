# Implement

- In exam page [sentinel-mobile] when the exam are are. [past due / turned in] the exam should be not [open exam] instead it will be [view] in that way it will show the details of the exam
  @app/sentinel-web/src/app/(protected)/student/history/details/page.tsx

- When I click the [open exam] it always returns no exam first before loading to the instruction page can you double check it

- When I approve the students the [wating for approval] is not being updated to continue

- When I commit an event during examination, the monitoring page in [sentinel-web] is not being updated.

    INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_BACKGROUNDING", "hasApiBaseUrl": true, "hasStudentId": false}
    INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_PINNING_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}
    INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "NOTIFICATION_BLOCK_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}
    INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_BACKGROUNDING", "hasApiBaseUrl": true, "hasStudentId": false}
    INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_PINNING_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}
    INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "NOTIFICATION_BLOCK_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}

- It does not return also the event for [SCREENSHOT] it only returns say this:
  INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_BACKGROUNDING", "hasApiBaseUrl": true, "hasStudentId": false}
  INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_PINNING_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}
  INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "NOTIFICATION_BLOCK_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}
  INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_BACKGROUNDING", "hasApiBaseUrl": true, "hasStudentId": false}
  INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "APP_PINNING_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}
  INFO Skipping mobile telemetry delivery because the mobile API identity is not configured. {"eventType": "NOTIFICATION_BLOCK_VIOLATION", "hasApiBaseUrl": true, "hasStudentId": false}
