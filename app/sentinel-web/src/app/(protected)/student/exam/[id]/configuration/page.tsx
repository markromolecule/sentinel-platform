'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi, useExamConfigurationQuery, useExamQuery } from '@sentinel/hooks';
import { startExamSession } from '@sentinel/services';
import { Button, Card } from '@sentinel/ui';
import { Camera, ChevronLeft, Mic, Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

// Relative Imports
import { CameraPreview, MonitoringInfo, SystemCheckItem } from './_components';
import { useSystemCheck } from './_hooks/use-system-check';
import { writeStoredExamSession } from '../monitoring/_lib/exam-session-storage';

export default function ExamConfigurationPage() {
    const router = useRouter();
    const params = useParams();
    const apiClient = useApi();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isStartingSession, setIsStartingSession] = useState(false);
    const examId = params.id as string;
    const { data: exam } = useExamQuery(examId);
    const { data: configurationState } = useExamConfigurationQuery(examId);
    const configuration = configurationState?.configuration;

    const {
        hasCameraPermission,
        hasMicPermission,
        requiresCamera,
        requiresMicrophone,
        isMobile,
        allChecksPassed,
    } = useSystemCheck(videoRef, configuration);

    const handleEnterExam = async () => {
        setIsStartingSession(true);

        try {
            const session = await startExamSession(apiClient, { examId });
            const storedSession = writeStoredExamSession(examId, session);

            if (!storedSession) {
                toast.error('Exam session could not be initialized.');
                return;
            }

            if (configuration?.webSecurity.full_screen_required && !isMobile) {
                const fullscreenRequest = document.documentElement.requestFullscreen?.();
                await fullscreenRequest?.catch(() => null);
            }

            router.push(`/student/exam/${params.id}/monitoring`);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to start the exam session.',
            );
        } finally {
            setIsStartingSession(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-2 px-4 py-4 sm:gap-3 sm:px-6 lg:px-8">
            {/* Navigation Header - Positioned at top-left */}
            <div className="absolute top-3 left-4 sm:top-4 sm:left-6 lg:top-6 lg:left-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-muted-foreground hover:text-foreground gap-1 pl-0 text-xs hover:bg-transparent sm:text-sm"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Details</span>
                    <span className="sm:hidden">Back</span>
                </Button>
            </div>

            <div className="mt-10 grid w-full max-w-5xl gap-2 sm:mt-0 sm:gap-3 lg:h-[500px] lg:grid-cols-12">
                {/* Left Column: Camera Preview */}
                <div className="order-1 flex min-h-[220px] flex-col sm:min-h-[280px] lg:order-1 lg:col-span-7 lg:h-full lg:min-h-0">
                    <CameraPreview hasCameraPermission={hasCameraPermission} videoRef={videoRef} />
                </div>

                {/* Right Column: Controls & Status */}
                <div className="order-2 flex flex-col gap-2 sm:gap-3 lg:order-2 lg:col-span-5">
                    {/* Title */}
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold tracking-tight sm:text-lg">
                            System Check
                        </h1>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">
                            {exam
                                ? `Verify your setup for ${exam.title}.`
                                : 'Verify your identity and environment.'}
                        </p>
                    </div>

                    {/* Modular Status Card */}
                    <Card className="border-border/50 bg-card/50 ring-border/50 flex flex-1 flex-col overflow-hidden shadow-sm ring-1">
                        <div className="flex-1 overflow-y-auto">
                            <div className="divide-border/50 divide-y">
                                <SystemCheckItem
                                    icon={<Camera className="h-3.5 w-3.5" />}
                                    title="Camera Access"
                                    description={
                                        requiresCamera
                                            ? hasCameraPermission
                                                ? 'Camera active'
                                                : 'Camera permission required'
                                            : 'Camera not required for this exam'
                                    }
                                    status={
                                        requiresCamera
                                            ? hasCameraPermission
                                                ? 'success'
                                                : 'pending'
                                            : 'info'
                                    }
                                />
                                <SystemCheckItem
                                    icon={<Mic className="h-3.5 w-3.5" />}
                                    title="Audio Input"
                                    description={
                                        requiresMicrophone
                                            ? hasMicPermission
                                                ? 'Microphone active'
                                                : 'Microphone permission required'
                                            : 'Microphone not required for this exam'
                                    }
                                    status={
                                        requiresMicrophone
                                            ? hasMicPermission
                                                ? 'success'
                                                : 'pending'
                                            : 'info'
                                    }
                                />
                                <SystemCheckItem
                                    icon={
                                        isMobile ? (
                                            <Smartphone className="h-3.5 w-3.5" />
                                        ) : (
                                            <Monitor className="h-3.5 w-3.5" />
                                        )
                                    }
                                    title="Platform"
                                    description={isMobile ? 'Mobile device' : 'Desktop computer'}
                                    status="info"
                                />
                                <MonitoringInfo isMobile={isMobile} configuration={configuration} />
                            </div>
                        </div>
                    </Card>

                    {/* Enter Button */}
                    <Button
                        size="lg"
                        variant="premium-3d"
                        onClick={handleEnterExam}
                        disabled={!allChecksPassed || isStartingSession}
                        className="h-10 w-full text-xs font-semibold shadow-md sm:h-11 sm:text-sm"
                    >
                        {isStartingSession
                            ? 'Preparing Exam Room...'
                            : allChecksPassed
                              ? 'Enter Exam Room'
                              : 'Verifying System...'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
