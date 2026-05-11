# Issue

- When the student is on the lobby and click the button to access the attempt page it does redirect there but it push me back to the lobby this is because the system thinks its a "reload"

- In lobby page, ensure that the hooks that handles the lobby count and the reconnect is accurate for case-to-case basis.

- Ensure that the [silence_detected] is not now causing trouble wherein it causes the monitorig page to get messy because it detects silence and it treats as a high type of event.
  @packages/shared/src/audio/audio-anomaly.ts

Ensure that the audio is well calibrated based on the model and scenario inserted on the
@packages/shared/src/audio/audio-anomaly.ts

Ensurely tweak their threshold
