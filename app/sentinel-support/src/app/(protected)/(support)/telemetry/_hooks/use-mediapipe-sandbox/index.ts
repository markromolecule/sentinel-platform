'use client';

import { useSandboxEngine } from './use-sandbox-engine';
import type { UseMediaPipeSandboxArgs } from '../../_types';

/**
 * Hook for managing the MediaPipe sandbox runtime.
 * Orchestrates camera stream, model loading, and frame analysis loop.
 */
export function useMediaPipeSandbox({ settings }: UseMediaPipeSandboxArgs) {
    return useSandboxEngine(settings);
}
