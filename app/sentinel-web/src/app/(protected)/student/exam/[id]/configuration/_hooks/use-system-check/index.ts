import { useEffect, useState, RefObject } from 'react';
import { toast } from 'sonner';
import { MOBILE_USER_AGENT_REGEX } from '@sentinel/shared/constants';
import { ExamConfig, UseSystemCheckReturn } from '@sentinel/shared/types';

export function useSystemCheck(
    videoRef: RefObject<HTMLVideoElement | null>,
    configuration?: ExamConfig,
): UseSystemCheckReturn {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const requiresCamera = configuration?.cameraRequired ?? true;
    const requiresMicrophone = configuration?.micRequired ?? true;

    useEffect(() => {
        // Detect Mobile
        const checkMobile = () => {
            const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
            const mobile = MOBILE_USER_AGENT_REGEX.test(userAgent);
            setIsMobile(mobile);
            console.log('[SystemCheck] Platform checked:', mobile ? 'Mobile' : 'Desktop');
        };
        checkMobile();

        // Request Permissions
        const getPermissions = async () => {
            console.log('[SystemCheck] Requesting permissions...');
            if (!requiresCamera && !requiresMicrophone) {
                setHasCameraPermission(true);
                setHasMicPermission(true);
                return;
            }

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: requiresCamera,
                    audio: requiresMicrophone,
                });
                console.log(
                    '[SystemCheck] Permissions granted. Tracks count:',
                    mediaStream.getTracks().length,
                );

                // Ensure all tracks are enabled
                mediaStream.getTracks().forEach((track) => {
                    track.enabled = true;
                    console.log(`[SystemCheck] Track [${track.kind}] enabled: ${track.label}`);
                });

                setStream(mediaStream);
                setHasCameraPermission(
                    requiresCamera ? mediaStream.getVideoTracks().length > 0 : true,
                );
                setHasMicPermission(
                    requiresMicrophone ? mediaStream.getAudioTracks().length > 0 : true,
                );
            } catch (err) {
                console.error('[SystemCheck] Error accessing media devices:', err);
                toast.error('Failed to access required exam permissions.');
                setHasCameraPermission(requiresCamera ? false : true);
                setHasMicPermission(requiresMicrophone ? false : true);
            }
        };

        getPermissions();

        // Cleanup
        return () => {
            console.log('[SystemCheck] Cleaning up initial effect');
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [requiresCamera, requiresMicrophone]);

    // Robust video attachment effect
    useEffect(() => {
        if (hasCameraPermission && stream && videoRef.current) {
            console.log('[SystemCheck] Attaching stream to video element');
            const videoElement = videoRef.current;

            // Assign stream
            if (videoElement.srcObject !== stream) {
                videoElement.srcObject = stream;
            }

            // Attempt playback
            const playVideo = async () => {
                try {
                    await videoElement.play();
                    console.log('[SystemCheck] Video playback started successfully');
                } catch (playError) {
                    console.error('[SystemCheck] Error playing video:', playError);
                    // If it's an AbortError, it might be due to rapid mounting/unmounting,
                    // which is usually fine if subsequent attempts succeed.
                }
            };

            playVideo();
        } else if (hasCameraPermission && stream && !videoRef.current) {
            console.log(
                '[SystemCheck] Stream ready but videoRef is still null - waiting for mount...',
            );
        }
    }, [hasCameraPermission, stream, videoRef.current]);

    // Handle stream cleanup when the component unmounts
    useEffect(() => {
        return () => {
            if (stream) {
                console.log('[SystemCheck] Stopping all tracks on unmount');
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    const allChecksPassed = !!(hasCameraPermission && hasMicPermission);

    return {
        hasCameraPermission,
        hasMicPermission,
        requiresCamera,
        requiresMicrophone,
        isMobile,
        stream,
        allChecksPassed,
    };
}
