'use client';

import { Camera, Flag, Mic, Monitor, Smartphone } from 'lucide-react';

import type { HardwareReadinessItem } from '../types';

type BuildHardwareReadinessItemsArgs = {
    cameraRequired: boolean;
    micRequired: boolean;
    cameraReady: boolean;
    micReady: boolean;
    fullscreenRequired: boolean;
    platform: 'desktop' | 'mobile';
};

export function buildHardwareReadinessItems(
    args: BuildHardwareReadinessItemsArgs,
): HardwareReadinessItem[] {
    const platformLabel = args.platform === 'mobile' ? 'Mobile device' : 'Desktop browser';

    return [
        {
            key: 'camera',
            title: 'Camera access',
            description: args.cameraRequired
                ? args.cameraReady
                    ? 'Preview camera check is marked ready.'
                    : 'Camera is required before the student can continue.'
                : 'Camera is optional for this configuration.',
            icon: <Camera className="h-4 w-4" />,
            status: args.cameraRequired ? (args.cameraReady ? 'success' : 'pending') : 'optional',
        },
        {
            key: 'microphone',
            title: 'Microphone access',
            description: args.micRequired
                ? args.micReady
                    ? 'Preview microphone check is marked ready.'
                    : 'Microphone is required before the student can continue.'
                : 'Microphone is optional for this configuration.',
            icon: <Mic className="h-4 w-4" />,
            status: args.micRequired ? (args.micReady ? 'success' : 'pending') : 'optional',
        },
        {
            key: 'platform',
            title: 'Platform profile',
            description: `${platformLabel} rules are active in this preview state.`,
            icon:
                args.platform === 'mobile' ? (
                    <Smartphone className="h-4 w-4" />
                ) : (
                    <Monitor className="h-4 w-4" />
                ),
            status: 'success',
        },
        {
            key: 'fullscreen',
            title: 'Fullscreen policy',
            description: args.fullscreenRequired
                ? 'Fullscreen entry will be requested before the live attempt.'
                : 'Fullscreen entry is not required for this preview configuration.',
            icon: <Flag className="h-4 w-4" />,
            status: args.fullscreenRequired ? 'pending' : 'optional',
        },
    ];
}
