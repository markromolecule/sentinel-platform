import { ConfigToggleRow } from './config-toggle-row';

export function DeviceHardwareSection() {
    return (
        <div className="space-y-3">
            <ConfigToggleRow
                name="configuration.cameraRequired"
                label="Camera required"
                description="Require camera permission and a visible live video feed before the exam can start."
            />
            <ConfigToggleRow
                name="configuration.micRequired"
                label="Microphone required"
                description="Require microphone access so the session can analyze suspicious background audio."
            />
            <ConfigToggleRow
                name="configuration.strictMode"
                label="Strict mode"
                description="Apply the full monitoring policy without relaxed fallbacks when checks fail."
            />
            <ConfigToggleRow
                name="configuration.screenLock"
                label="Screen lock"
                description="Keep the exam constrained to the approved exam surface instead of allowing free navigation."
            />
        </div>
    );
}
