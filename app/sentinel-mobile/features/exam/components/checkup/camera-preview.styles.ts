import { StyleSheet } from 'react-native';

export interface CameraStatusConfigParams {
  hasPermission: boolean;
  cameraError?: string | null;
  bridgeStatus?: 'initializing' | 'ready' | 'error';
  cameraReady: boolean;
}

export interface CameraStatusConfig {
  color: string;
  label: string;
}

export function getCameraStatusConfig({
  hasPermission,
  cameraError,
  bridgeStatus,
  cameraReady,
}: CameraStatusConfigParams): CameraStatusConfig {
  if (!hasPermission) {
    return {
      color: '#ef4444',
      label: 'Permission Required',
    };
  }

  if (cameraError || bridgeStatus === 'error') {
    return {
      color: '#ef4444',
      label: 'Camera / Model Error',
    };
  }

  if (cameraReady && bridgeStatus === 'ready') {
    return {
      color: '#10b981',
      label: 'Camera Ready',
    };
  }

  return {
    color: '#f59e0b',
    label: 'Initializing…',
  };
}

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  feedContainer: {
    height: 300,
    position: 'relative',
  },
  flipButton: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Permission states
  permissionLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionLoadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  permissionPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  permissionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  // Calibration guide
  guideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  guideStatusWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guideStatusBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  guideStatusText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressBarTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%',
  },
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
});
