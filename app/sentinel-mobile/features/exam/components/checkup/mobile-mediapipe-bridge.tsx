import React, { useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  type MobileMediaPipeBridgeProps,
  type MobileMediaPipeBridgeRef,
  type BridgeInboundMessage,
  type BridgeOutboundMessage,
} from './mobile-mediapipe-bridge.types';
import { buildMediaPipeBridgeHtml } from './mobile-mediapipe-bridge-html';

export type { MobileMediaPipeBridgeProps, MobileMediaPipeBridgeRef } from './mobile-mediapipe-bridge.types';

export const MobileMediaPipeBridge = forwardRef<MobileMediaPipeBridgeRef, MobileMediaPipeBridgeProps>(
  (
    {
      onLandmarksDetected,
      onStatusChange,
      onError,
      onInspectionStatusChange,
      frameIntervalMs = 500,
      facing = 'front',
      showPreview = false,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);
    const pendingCaptures = useRef<
      Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>
    >(new Map());

    useImperativeHandle(ref, () => ({
      takePictureAsync: async (options = { quality: 0.5 }) => {
        return new Promise((resolve, reject) => {
          const requestId = Math.random().toString(36).substring(7);
          pendingCaptures.current.set(requestId, { resolve, reject });
          if (webViewRef.current) {
            const message: BridgeOutboundMessage = {
              type: 'capture',
              requestId,
              quality: options.quality ?? 0.5,
            };
            webViewRef.current.postMessage(JSON.stringify(message));
          } else {
            reject(new Error('WebView not ready'));
          }
        });
      },
      startLiveInspection: async ({ liveKitUrl, token }: { liveKitUrl: string; token: string }) => {
        if (webViewRef.current) {
          const message: BridgeOutboundMessage = {
            type: 'start_inspection',
            liveKitUrl,
            token,
          };
          webViewRef.current.postMessage(JSON.stringify(message));
        }
      },
      stopLiveInspection: async () => {
        if (webViewRef.current) {
          const message: BridgeOutboundMessage = {
            type: 'stop_inspection',
          };
          webViewRef.current.postMessage(JSON.stringify(message));
        }
      },
    }));

    // Update configuration in WebView when props change
    useEffect(() => {
      if (webViewRef.current) {
        const message: BridgeOutboundMessage = {
          type: 'configure',
          frameIntervalMs,
          facingMode: facing === 'front' ? 'user' : 'environment',
        };
        webViewRef.current.postMessage(JSON.stringify(message));
      }
    }, [frameIntervalMs, facing]);

    const htmlContent = useMemo(() => {
      return buildMediaPipeBridgeHtml({
        frameIntervalMs,
        facing,
        showPreview,
      });
    }, [frameIntervalMs, facing, showPreview]);

    const webViewSource = useMemo(() => ({
      html: htmlContent,
      baseUrl: 'https://app.sentinelph.tech'
    }), [htmlContent]);

    return (
      <View style={showPreview ? styles.previewContainer : styles.container}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={webViewSource}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          mediaCapturePermissionGrantType="grant"
          {...({
            onPermissionRequest: (event: any) => {
              event.grant(event.resources);
            }
          } as any)}
          onMessage={(event) => {
            try {
              const message: BridgeInboundMessage = JSON.parse(event.nativeEvent.data);
              switch (message.type) {
                case 'landmarks':
                  onLandmarksDetected(message.landmarks, message.confidenceScore);
                  break;
                case 'status':
                  onStatusChange?.(message.status);
                  break;
                case 'error':
                  onError?.(message.error);
                  break;
                case 'inspection_status':
                  onInspectionStatusChange?.(message.status, message.error);
                  break;
                case 'capture_result': {
                  const pending = pendingCaptures.current.get(message.requestId);
                  if (pending) {
                    pending.resolve({
                      uri: `data:image/jpeg;base64,${message.base64Image}`,
                      base64: message.base64Image,
                    });
                    pendingCaptures.current.delete(message.requestId);
                  }
                  break;
                }
                case 'capture_error': {
                  const pending = pendingCaptures.current.get(message.requestId);
                  if (pending) {
                    pending.reject(new Error(message.error));
                    pendingCaptures.current.delete(message.requestId);
                  }
                  break;
                }
              }
            } catch (err) {
              console.error('Failed to parse WebView message:', err);
            }
          }}
        />
      </View>
    );
  }
);

MobileMediaPipeBridge.displayName = 'MobileMediaPipeBridge';

const styles = StyleSheet.create({
  container: {
    width: 1,
    height: 1,
    opacity: 0.01,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
  },
});
