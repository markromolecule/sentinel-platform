import { useState, useEffect, useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { type CameraFacing } from '@/types/exam';

export interface UseCheckupCameraOptions {
    requiresCamera?: boolean;
}

export interface UseCheckupCameraReturn {
    cameraFacing: CameraFacing;
    cameraReady: boolean;
    hasCameraPermission: boolean;
    isPermissionLoading: boolean;
    cameraError: string | null;
    requestCameraPermission: () => Promise<any>;
    onCameraReady: () => void;
    onCameraMountError: (error: any) => void;
    flipCamera: () => void;
}

export function useCheckupCamera(options: UseCheckupCameraOptions = {}): UseCheckupCameraReturn {
    const { requiresCamera = true } = options;
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraFacing, setCameraFacing] = useState<CameraFacing>('front');
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const hasCameraPermission = permission?.granted ?? false;
    const isPermissionLoading = permission === null;

    // Camera Permissions auto-request
    useEffect(() => {
        if (requiresCamera && permission && !permission.granted && permission.canAskAgain) {
            void requestPermission();
        }
    }, [permission, requestPermission, requiresCamera]);

    // Safety fallback timer: Ensure cameraReady resolves if permission is granted but native event is delayed/missed
    useEffect(() => {
        if (!requiresCamera || !hasCameraPermission || cameraReady) return;
        const timer = setTimeout(() => {
            setCameraReady(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, [requiresCamera, hasCameraPermission, cameraReady]);

    const onCameraReady = useCallback(() => {
        setCameraError(null);
        setCameraReady(true);
    }, []);

    const onCameraMountError = useCallback((error: any) => {
        const errorMsg = typeof error === 'string' ? error : error?.message ?? 'Failed to initialize camera';
        console.warn('Camera failed to mount:', errorMsg);
        setCameraError(errorMsg);
        setCameraReady(true);
    }, []);

    const flipCamera = useCallback(() => {
        setCameraReady(false);
        setCameraError(null);
        setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'));
    }, []);

    return {
        cameraFacing,
        cameraReady,
        hasCameraPermission,
        isPermissionLoading,
        cameraError,
        requestCameraPermission: requestPermission,
        onCameraReady,
        onCameraMountError,
        flipCamera,
    };
}
