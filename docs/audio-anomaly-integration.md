# Goal

- To integrate the audio anomaly detection system with Sentinel, allowing for real-time monitoring of audio anomalies and trigger alerts to relevant personnel.

1. Ensure that the audio anomaly detection system is able to send alert during the examination.
2. During examination it should send the alert to the monitoring page of the instructor
3. Calibrate the audio anomaly threshold, where it can be tuned by the support. In that way the other will just use the settings that are already calibrated.
4. Adjust the sensitivity of the audio anomaly detection system
5. It should live on background during the examination similar to the mediapipe
6. Create the backend for the audio anomaly detection
   @app/sentinel-api/src/modules/infrastructure/audio - if applicable since we want to calibrate it so I think creating a backend for the audio is necessary
   @app/sentinel-api/src/modules/infrastructure/audio/audio.service.ts
   @app/sentinel-api/src/modules/infrastructure/audio/services
7. Ensure to update the DTOs and Schema for the Audio Anomaly Detection

- It should be measured and calibrated correctly to prevent the false positives and false negatives
- Take to consider the ambient noise of the environment, low-end devices, mobile phones such as android that may have different peak of audio depends on the microphone.
- The audio anomaly detection should be able to detect the following:
    - Typing sound
    - Tapping sound
    - Cheating sound
    - Mouth breathing
    - Coughing sound
    - Loud noise
    - Background noise
    - Talking sound
