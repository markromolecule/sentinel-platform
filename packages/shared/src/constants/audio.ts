export const AUDIO_QUERY_KEYS = {
    all: ['audio'] as const,
    settings: () => [...AUDIO_QUERY_KEYS.all, 'settings'] as const,
} as const;
