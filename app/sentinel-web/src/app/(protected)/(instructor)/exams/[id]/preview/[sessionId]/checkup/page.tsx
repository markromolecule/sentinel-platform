'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@sentinel/ui';
import { ArrowRight, Camera, CheckCircle2, Info, Mic, Monitor } from 'lucide-react';
import { PreviewHeader } from '../_components/common/preview-header';
import { PreviewLoadingState } from '../_components/preview-loading-state';
import { usePreviewExamData } from '../_hooks/use-preview-exam-data';
import { buildPreviewHref } from '../_components/preview-page-shell';

type PermissionState = 'idle' | 'granted' | 'blocked';

export default function ExamPreviewCheckupPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const { examId, sessionId, exam, configuration, isLoading } = usePreviewExamData();
    const [cameraState, setCameraState] = useState<PermissionState>('idle');
    const [micState, setMicState] = useState<PermissionState>('idle');
    const [isRequesting, setIsRequesting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const requestDeviceAccess = async () => {
        setIsRequesting(true);
        setErrorMessage(null);

        try {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setCameraState(stream.getVideoTracks().length > 0 ? 'granted' : 'blocked');
            setMicState(stream.getAudioTracks().length > 0 ? 'granted' : 'blocked');
        } catch {
            setCameraState(configuration.cameraRequired ? 'blocked' : 'idle');
            setMicState(configuration.micRequired ? 'blocked' : 'idle');
            setErrorMessage(
                'Camera or microphone access was blocked. Allow both permissions in your browser and try again.',
            );
        } finally {
            setIsRequesting(false);
        }
    };

    if (isLoading) {
        return <PreviewLoadingState />;
    }

    const checks = [
        {
            label: 'Camera',
            description: configuration.cameraRequired
                ? 'Required for face visibility during the exam.'
                : 'Not required for this preview.',
            state: configuration.cameraRequired ? cameraState : 'granted',
            icon: Camera,
        },
        {
            label: 'Microphone',
            description: configuration.micRequired
                ? 'Required for room audio monitoring.'
                : 'Not required for this preview.',
            state: configuration.micRequired ? micState : 'granted',
            icon: Mic,
        },
        {
            label: 'Fullscreen',
            description: configuration.webSecurity.full_screen_required
                ? 'Students will be asked to stay in fullscreen mode.'
                : 'Fullscreen is not required for this exam.',
            state: configuration.webSecurity.full_screen_required ? 'idle' : 'granted',
            icon: Monitor,
        },
    ] as const;

    const isCheckupReady =
        (!configuration.cameraRequired || cameraState === 'granted') &&
        (!configuration.micRequired || micState === 'granted');

    return (
        <div className="bg-muted/20 selection:bg-primary/10 min-h-screen font-sans">
            <PreviewHeader examId={examId} badgeLabel="System Checkup" />

            <main className="mx-auto w-full max-w-4xl px-5 pb-8 sm:px-8 sm:pb-10 lg:max-w-6xl lg:px-10 xl:px-12">
                <section className="space-y-5 border-b pb-8">
                    <div className="space-y-3">
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-[30px] lg:text-[34px]">
                            System Checkup
                        </h1>
                        <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-[15px]">
                            Allow the required device permissions and confirm the setup before
                            continuing to the lobby.
                        </p>
                    </div>

                    <div className="grid gap-x-8 gap-y-4 pt-2 sm:grid-cols-3 xl:grid-cols-4">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                                Camera
                            </p>
                            <p className="text-sm leading-5 font-semibold">
                                {configuration.cameraRequired ? 'Required' : 'Optional'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                                Microphone
                            </p>
                            <p className="text-sm leading-5 font-semibold">
                                {configuration.micRequired ? 'Required' : 'Optional'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                                Exam
                            </p>
                            <p className="text-sm leading-5 font-semibold">
                                {exam?.title ?? 'Preview session'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                                Browser
                            </p>
                            <p className="text-sm leading-5 font-semibold">Permission check</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] lg:gap-14 xl:gap-16">
                    <div className="space-y-6 lg:pr-2">
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold sm:text-lg">Device access</h2>
                            <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-[15px]">
                                Use the button below to open the browser prompt for camera and
                                microphone access.
                            </p>
                        </div>

                        <div className="border-border/60 relative aspect-[16/9] overflow-hidden border bg-slate-950 shadow-sm">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                            />

                            {!streamRef.current ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 p-6 text-center text-white">
                                    <div>
                                        <p className="text-base font-medium">
                                            Camera preview will appear here
                                        </p>
                                        <p className="mt-2 text-sm text-white/75 sm:text-[15px]">
                                            Allow camera and microphone access to continue.
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                onClick={requestDeviceAccess}
                                disabled={isRequesting}
                                className="h-10 w-full justify-center rounded-lg px-4 text-sm font-medium shadow-none sm:w-auto"
                            >
                                {isRequesting
                                    ? 'Requesting permissions...'
                                    : streamRef.current
                                      ? 'Retry permissions'
                                      : 'Allow Camera and Microphone'}
                            </Button>

                            <p className="text-muted-foreground text-sm leading-6">
                                Grant access once, then continue when the required checks show
                                ready.
                            </p>
                        </div>

                        {errorMessage ? (
                            <p className="text-destructive text-sm leading-6">{errorMessage}</p>
                        ) : null}

                        <div className="flex items-start gap-3 pt-1 text-sm leading-6 text-blue-900 dark:text-blue-200">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />
                            <p className="text-blue-800/80 dark:text-blue-200/80">
                                This preview requests real browser permissions so you can verify the
                                device flow before moving forward.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 lg:border-l lg:pl-8 xl:pl-10">
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold sm:text-lg">Check status</h2>

                            <div className="space-y-4">
                                {checks.map((item) => (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="text-primary h-4 w-4" />
                                            <p className="text-sm font-semibold">{item.label}</p>
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                                            {item.description}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {item.state === 'granted'
                                                ? 'Ready'
                                                : item.state === 'blocked'
                                                  ? 'Blocked'
                                                  : 'Pending'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <ul className="space-y-3">
                                {[
                                    'Keep your face centered in the camera view.',
                                    'Use a quiet space before entering the lobby.',
                                    'Allow required permissions before proceeding.',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="text-muted-foreground flex items-start gap-3 text-sm leading-6"
                                    >
                                        <CheckCircle2 className="text-primary mt-1 h-4 w-4 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-muted-foreground w-full justify-center sm:w-auto sm:justify-start"
                    >
                        <Link href={buildPreviewHref(examId, sessionId, 'privacy')}>
                            Previous Step
                        </Link>
                    </Button>

                    <Button
                        type="button"
                        disabled={!isCheckupReady}
                        onClick={() => router.push(buildPreviewHref(examId, sessionId, 'lobby'))}
                        className="h-10 w-full justify-center rounded-lg px-4 text-sm font-medium shadow-none sm:w-auto"
                    >
                        Continue to Lobby
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </section>
            </main>
        </div>
    );
}
