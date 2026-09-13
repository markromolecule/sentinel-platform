export interface MediaPipeBridgeHtmlOptions {
  frameIntervalMs?: number;
  facing?: 'front' | 'back';
  showPreview?: boolean;
}

/**
 * Builds the standalone HTML page containing the MediaPipe vision bundle,
 * WebRTC webcam capture loop, GPU/CPU delegate fallback, LiveKit publisher,
 * and snapshot capture logic running inside the mobile WebView.
 */
export function buildMediaPipeBridgeHtml({
  frameIntervalMs = 500,
  facing = 'front',
  showPreview: _showPreview = false,
}: MediaPipeBridgeHtmlOptions = {}): string {
  const facingMode = facing === 'front' ? 'user' : 'environment';
  const mirrorStyle = facing === 'front' ? 'transform: scaleX(-1);' : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>MediaPipe Bridge</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      ${mirrorStyle}
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/livekit-client@2.6.2/dist/livekit-client.umd.min.js"></script>
</head>
<body>
  <video id="webcam" autoplay playsinline muted></video>
  <script type="module">
    import { FilesetResolver, FaceLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs';

    const video = document.getElementById('webcam');
    let faceLandmarker;
    let running = true;
    let frameIntervalMs = ${frameIntervalMs};
    let facingMode = "${facingMode}";
    let lastProcessedTime = 0;
    let localStream = null;
    let liveKitRoom = null;

    let isPredictLoopRunning = false;

    function sendToRN(data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    async function initMediaPipe() {
      try {
        sendToRN({ type: 'status', status: 'initializing' });
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
        );
        const baseOptions = {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
        };
        const commonConfig = {
          runningMode: "VIDEO",
          numFaces: 2,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          minFaceDetectionConfidence: 0.4,
          minFacePresenceConfidence: 0.4,
          minTrackingConfidence: 0.4
        };

        try {
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            ...commonConfig,
            baseOptions: { ...baseOptions, delegate: "GPU" }
          });
        } catch (gpuErr) {
          console.warn("GPU delegate failed, falling back to CPU:", gpuErr);
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            ...commonConfig,
            baseOptions: { ...baseOptions, delegate: "CPU" }
          });
        }

        sendToRN({ type: 'status', status: 'ready' });
        await startCamera();
      } catch (err) {
        sendToRN({ type: 'error', error: 'Failed to initialize FaceLandmarker: ' + err.message });
      }
    }

    function ensurePredictLoopRunning() {
      if (!isPredictLoopRunning && running) {
        isPredictLoopRunning = true;
        requestAnimationFrame(predictLoop);
      }
    }

    async function startCamera() {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('navigator.mediaDevices.getUserMedia is not supported on this device/webview');
        }
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        video.srcObject = localStream;
        
        video.addEventListener('loadeddata', ensurePredictLoopRunning, { once: true });
        video.addEventListener('playing', ensurePredictLoopRunning, { once: true });

        await video.play().catch(e => console.error("Error playing video:", e));

        if (video.readyState >= 2) {
          ensurePredictLoopRunning();
        }
      } catch (err) {
        sendToRN({ type: 'error', error: 'Camera access failed: ' + err.message });
      }
    }

    async function connectAndPublishLiveKit(liveKitUrl, token) {
      try {
        if (liveKitRoom) {
          await liveKitRoom.disconnect();
          liveKitRoom = null;
        }

        const Livekit = window.LivekitClient;
        if (!Livekit) {
          throw new Error('LiveKit client library not available');
        }

        const room = new Livekit.Room({
          adaptiveStream: true,
          dynacast: true,
        });

        await room.connect(liveKitUrl, token);

        if (localStream && localStream.getVideoTracks().length > 0) {
          const videoTrack = localStream.getVideoTracks()[0];
          await room.localParticipant.publishTrack(videoTrack, {
            name: 'camera',
            source: Livekit.Track.Source.Camera,
          });
        }

        liveKitRoom = room;
        sendToRN({ type: 'inspection_status', status: 'connected' });
      } catch (err) {
        sendToRN({ type: 'inspection_status', status: 'error', error: err.message });
      }
    }

    async function disconnectLiveKit() {
      if (liveKitRoom) {
        try {
          await liveKitRoom.disconnect();
        } catch (e) {}
        liveKitRoom = null;
      }
      sendToRN({ type: 'inspection_status', status: 'disconnected' });
    }

    function predictLoop() {
      if (!running) {
        isPredictLoopRunning = false;
        return;
      }

      const now = performance.now();
      const isVideoReady = video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;

      if (now - lastProcessedTime >= frameIntervalMs && isVideoReady && faceLandmarker) {
        const timestamp = Math.max(now, lastProcessedTime + 1);
        lastProcessedTime = timestamp;
        try {
          const result = faceLandmarker.detectForVideo(video, timestamp);
          if (result && result.faceLandmarks) {
            sendToRN({
              type: 'landmarks',
              landmarks: result.faceLandmarks,
              confidenceScore: 0.95
            });
          }
        } catch (err) {
          sendToRN({ type: 'error', error: 'Detection failed: ' + err.message });
        }
      }
      requestAnimationFrame(predictLoop);
    }

    window.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'configure') {
          if (msg.frameIntervalMs !== undefined) {
            frameIntervalMs = msg.frameIntervalMs;
          }
          if (msg.facingMode !== undefined && msg.facingMode !== facingMode) {
            facingMode = msg.facingMode;
            startCamera();
          }
        }
        if (msg.type === 'start_inspection') {
          connectAndPublishLiveKit(msg.liveKitUrl, msg.token);
        }
        if (msg.type === 'stop_inspection') {
          disconnectLiveKit();
        }
        if (msg.type === 'capture') {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', msg.quality || 0.5);
            const base64 = dataUrl.split(',')[1] || '';
            sendToRN({
              type: 'capture_result',
              base64Image: base64,
              requestId: msg.requestId
            });
          } catch (e) {
            sendToRN({ type: 'capture_error', error: e.message, requestId: msg.requestId });
          }
        }
      } catch (e) {}
    });

    window.addEventListener('beforeunload', () => {
      running = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    });

    initMediaPipe();
  </script>
</body>
</html>`;
}
