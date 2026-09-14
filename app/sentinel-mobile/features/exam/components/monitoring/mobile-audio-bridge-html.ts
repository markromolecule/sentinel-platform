import type { AudioAnomalyConfig } from '@sentinel/shared';
import {
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    YAMNET_CLASS_IDS_BY_ANOMALY_TYPE,
} from '@sentinel/shared';

export interface MobileAudioBridgeHtmlOptions {
    modelUrl?: string;
    initialConfig?: AudioAnomalyConfig;
}

export const DEFAULT_YAMNET_MODEL_URL =
    'https://storage.googleapis.com/tfjs-models/savedmodel/yamnet/model.json';

/**
 * Builds the standalone HTML page containing the TensorFlow.js YAMNet classifier,
 * Web Audio capture loop, 16 kHz resampling, anomaly streak/cooldown evaluation,
 * and postMessage bridge running inside the mobile WebView.
 */
export function buildMobileAudioBridgeHtml({
    modelUrl = DEFAULT_YAMNET_MODEL_URL,
    initialConfig = DEFAULT_AUDIO_ANOMALY_CONFIG,
}: MobileAudioBridgeHtmlOptions = {}): string {
    const serializedConfig = JSON.stringify(initialConfig);
    const serializedClassIds = JSON.stringify(YAMNET_CLASS_IDS_BY_ANOMALY_TYPE);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sentinel Mobile Audio Bridge</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"></script>
</head>
<body>
  <script>
    (function() {
      var model = null;
      var audioContext = null;
      var mediaStream = null;
      var scriptProcessor = null;
      var isRunning = false;
      var isModelLoading = false;

      var modelUrl = "${modelUrl}";
      var config = ${serializedConfig};
      var classIdsByType = ${serializedClassIds};

      var TARGET_SAMPLE_RATE = 16000;
      var EXPECTED_SAMPLES = 15600; // 0.975s @ 16kHz
      var sampleBuffer = new Float32Array(EXPECTED_SAMPLES);
      var bufferIndex = 0;

      var consecutiveFrames = {};
      var lastTriggeredAtMs = {};

      function sendToRN(message) {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      }

      function clampThreshold(val) {
        return Math.min(1, Math.max(0, val));
      }

      function getEffectiveThreshold(anomalyType) {
        var base = (config.thresholds && typeof config.thresholds[anomalyType] === 'number')
          ? config.thresholds[anomalyType]
          : 0.5;
        var mult = (config.sensitivityMultiplier && config.sensitivityMultiplier > 0)
          ? config.sensitivityMultiplier
          : 1;
        return clampThreshold(base / mult);
      }

      function getHighestScore(scores, ids) {
        var highest = 0;
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          if (id >= 0 && id < scores.length) {
            if (scores[id] > highest) {
              highest = scores[id];
            }
          }
        }
        return highest;
      }

      function resampleTo16k(samples, sourceRate) {
        if (!sourceRate || sourceRate <= 0 || sourceRate === TARGET_SAMPLE_RATE) {
          return samples;
        }
        var targetLen = Math.max(1, Math.round((samples.length * TARGET_SAMPLE_RATE) / sourceRate));
        var resampled = new Float32Array(targetLen);
        var ratio = sourceRate / TARGET_SAMPLE_RATE;
        for (var i = 0; i < targetLen; i++) {
          var srcIdx = i * ratio;
          var lower = Math.floor(srcIdx);
          var upper = Math.min(lower + 1, samples.length - 1);
          var frac = srcIdx - lower;
          var vLower = samples[lower] || 0;
          var vUpper = samples[upper] || vLower;
          resampled[i] = vLower + (vUpper - vLower) * frac;
        }
        return resampled;
      }

      function evaluateTrigger(anomalyType, confidence, nowMs) {
        var threshold = getEffectiveThreshold(anomalyType);
        if (confidence === null || confidence < threshold) {
          consecutiveFrames[anomalyType] = 0;
          return false;
        }

        var frames = (consecutiveFrames[anomalyType] || 0) + 1;
        consecutiveFrames[anomalyType] = frames;

        var reqFrames = config.consecutiveFrameThreshold || 2;
        var cooldown = config.cooldownMs || 10000;
        var lastAt = lastTriggeredAtMs[anomalyType] || 0;
        var inCooldown = (nowMs - lastAt) <= cooldown;

        if (frames < reqFrames || inCooldown) {
          return false;
        }

        consecutiveFrames[anomalyType] = 0;
        lastTriggeredAtMs[anomalyType] = nowMs;
        return true;
      }

      function processBuffer() {
        if (!model || !isRunning) return;

        try {
          var tensor = tf.tensor1d(sampleBuffer);
          var prediction = model.predict(tensor);
          var scoresTensor = Array.isArray(prediction) ? prediction[0] : prediction;
          var scoresData = scoresTensor.dataSync();

          tensor.dispose();
          scoresTensor.dispose();

          var now = Date.now();
          var enabled = config.enabledAnomalyTypes || ['TALKING', 'BACKGROUND_NOISE'];

          for (var i = 0; i < enabled.length; i++) {
            var type = enabled[i];
            var ids = classIdsByType[type] || [];
            if (ids.length === 0) continue;

            var score = getHighestScore(scoresData, ids);
            var triggered = evaluateTrigger(type, score, now);

            if (triggered) {
              sendToRN({
                type: 'anomaly',
                anomalyType: type,
                confidenceScore: Math.round(score * 1000) / 1000,
                detectedAt: new Date(now).toISOString(),
              });
            }
          }
        } catch (inferenceErr) {
          console.error('[MobileAudioBridge] Inference error:', inferenceErr);
        }
      }

      async function initModel() {
        if (model || isModelLoading) return;
        isModelLoading = true;
        sendToRN({ type: 'status', status: 'initializing' });

        try {
          if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js library not loaded');
          }
          await tf.setBackend('cpu');
          await tf.ready();
          model = await tf.loadGraphModel(modelUrl);
          isModelLoading = false;
          sendToRN({ type: 'status', status: 'ready' });
        } catch (err) {
          isModelLoading = false;
          sendToRN({
            type: 'error',
            error: {
              code: 'model_load_failed',
              message: 'Failed to load YAMNet audio model: ' + err.message,
            },
          });
          sendToRN({ type: 'status', status: 'error' });
        }
      }

      async function startAudio() {
        if (isRunning) return;

        if (!model) {
          await initModel();
          if (!model) return;
        }

        try {
          var AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) {
            throw new Error('Web Audio API not supported in this environment');
          }
          audioContext = new AudioCtx();

          mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });

          var source = audioContext.createMediaStreamSource(mediaStream);
          // 4096 buffer size is universally supported in mobile WebViews
          scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

          scriptProcessor.onaudioprocess = function(event) {
            if (!isRunning) return;
            var inputData = event.inputBuffer.getChannelData(0);
            var resampled = resampleTo16k(inputData, audioContext.sampleRate);

            var offset = 0;
            while (offset < resampled.length) {
              var space = EXPECTED_SAMPLES - bufferIndex;
              var toCopy = Math.min(space, resampled.length - offset);
              sampleBuffer.set(resampled.subarray(offset, offset + toCopy), bufferIndex);
              bufferIndex += toCopy;
              offset += toCopy;

              if (bufferIndex >= EXPECTED_SAMPLES) {
                processBuffer();
                bufferIndex = 0;
              }
            }
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContext.destination);

          isRunning = true;
          sendToRN({ type: 'status', status: 'running' });
        } catch (err) {
          var isPermDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message.indexOf('denied') !== -1;
          sendToRN({
            type: 'error',
            error: {
              code: isPermDenied ? 'permission_denied' : 'audio_context_failed',
              message: err.message || 'Microphone capture failed',
            },
          });
          sendToRN({ type: 'status', status: 'error' });
        }
      }

      function stopAudio() {
        isRunning = false;
        bufferIndex = 0;
        consecutiveFrames = {};

        if (scriptProcessor) {
          try { scriptProcessor.disconnect(); } catch (_) {}
          scriptProcessor = null;
        }
        if (mediaStream) {
          try {
            mediaStream.getTracks().forEach(function(t) { t.stop(); });
          } catch (_) {}
          mediaStream = null;
        }
        if (audioContext && audioContext.state !== 'closed') {
          try { audioContext.close(); } catch (_) {}
          audioContext = null;
        }

        sendToRN({ type: 'status', status: 'stopped' });
      }

      function handleInboundMessage(rawMessage) {
        try {
          var data = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
          if (!data || !data.type) return;

          switch (data.type) {
            case 'start':
              startAudio();
              break;
            case 'stop':
              stopAudio();
              break;
            case 'update_config':
              if (data.config) {
                config = data.config;
              }
              break;
          }
        } catch (parseErr) {
          console.error('[MobileAudioBridge] Inbound message parse error:', parseErr);
        }
      }

      window.addEventListener('message', function(event) {
        handleInboundMessage(event.data);
      });
      document.addEventListener('message', function(event) {
        handleInboundMessage(event.data);
      });

      // Begin loading model immediately on page load
      initModel();
    })();
  </script>
</body>
</html>`;
}
