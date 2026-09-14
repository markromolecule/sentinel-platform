import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type {
    BridgeInboundMessage,
    BridgeOutboundMessage,
    MobileAudioBridgeProps,
} from './mobile-audio-bridge.types';
import { buildMobileAudioBridgeHtml } from './mobile-audio-bridge-html';

export type { MobileAudioBridgeProps } from './mobile-audio-bridge.types';

/**
 * MobileAudioBridge provides an isolated, on-device audio classification bridge
 * using YAMNet executed inside a hidden React Native WebView.
 *
 * It streams microphone input within the WebView, executes the local model,
 * evaluates anomaly thresholds and cooldowns, and communicates ONLY qualified
 * anomaly labels/scores back to React Native. Raw audio PCM buffers are never
 * returned to React Native or transmitted across the network.
 */
export function MobileAudioBridge({
    enabled,
    config,
    modelUrl,
    onAnomalyDetected,
    onStatusChange,
    onError,
}: MobileAudioBridgeProps) {
    const webViewRef = useRef<WebView>(null);
    const isBridgeReadyRef = useRef(false);

    const htmlContent = useMemo(() => {
        return buildMobileAudioBridgeHtml({
            modelUrl,
            initialConfig: config,
        });
    }, [modelUrl, config]);

    const webViewSource = useMemo(
        () => ({
            html: htmlContent,
            baseUrl: 'https://app.sentinelph.tech',
        }),
        [htmlContent],
    );

    const postToWebView = useCallback((message: BridgeOutboundMessage) => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify(message));
        }
    }, []);

    // Sync enabled state with WebView audio capture
    useEffect(() => {
        if (!isBridgeReadyRef.current) return;

        if (enabled) {
            postToWebView({ type: 'start' });
        } else {
            postToWebView({ type: 'stop' });
        }
    }, [enabled, postToWebView]);

    // Sync configuration updates
    useEffect(() => {
        if (config && isBridgeReadyRef.current) {
            postToWebView({ type: 'update_config', config });
        }
    }, [config, postToWebView]);

    const handleMessage = useCallback(
        (event: any) => {
            try {
                const message: BridgeInboundMessage = JSON.parse(event.nativeEvent.data);
                switch (message.type) {
                    case 'status':
                        if (message.status === 'ready') {
                            isBridgeReadyRef.current = true;
                            if (enabled) {
                                postToWebView({ type: 'start' });
                            }
                        } else if (message.status === 'stopped' || message.status === 'error') {
                            if (message.status === 'stopped') {
                                isBridgeReadyRef.current = true;
                            }
                        }
                        onStatusChange?.(message.status);
                        break;
                    case 'anomaly':
                        onAnomalyDetected({
                            anomalyType: message.anomalyType,
                            confidenceScore: message.confidenceScore,
                            detectedAt: message.detectedAt,
                        });
                        break;
                    case 'error':
                        onError?.(message.error);
                        break;
                }
            } catch (err) {
                console.error('[MobileAudioBridge] Failed to parse WebView inbound message:', err);
            }
        },
        [enabled, onAnomalyDetected, onError, onStatusChange, postToWebView],
    );

    return (
        <View style={styles.container} testID="mobile-audio-bridge-container">
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
                    },
                } as any)}
                onMessage={handleMessage}
            />
        </View>
    );
}

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
    webview: {
        flex: 1,
    },
});
