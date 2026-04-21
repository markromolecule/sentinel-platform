I am thinking of creating a telemetry settings on: @app/sentinel-support/src/app/(protected)/(support)

This will be the page where the support team can manage the telemetry settings for the system. This includes:
1. Enabling or disabling telemetry data collection
2. Setting the frequency of data collection
3. Managing the types of data collected (based on the cheating logs commited by the student)

Since the focus of the telemetry is on the logs of the cheating commited and handling the flush, batch, and ingest

With that I need also a sub-item for it which is the 
1. settings for overriding the exam events / connfiguration

export const TelemetryEventTypeSchema = telemetryEventTypeSchema;
export const TelemetryPlatformSchema = telemetryPlatformSchema;
export const TelemetrySourceSchema = telemetrySourceSchema;
export const TelemetryRuleKeySchema = telemetryRuleKeySchema;

and also
2. Sandbox (MediaPipe) here we can configure the mediapipe gaze tracking. In that way we can use that later to integrate on the [checkup] page on the student and let the instructor now get the [event] related to gaze

This will enhance the flexibility and control to those settings where in its not just running on the code but we have the capability to control it

You can recommend or enhance this plan more. In addition, you must create a d etailed to-do-workflow and ensure you apply 1-3-1 rule in decision