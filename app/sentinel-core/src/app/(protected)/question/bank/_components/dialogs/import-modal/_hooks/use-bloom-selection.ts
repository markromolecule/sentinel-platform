'use client';

import { useState } from 'react';
import type { BloomCognitiveLevel } from '@sentinel/shared';

export function useBloomSelection() {
    const [selectedBloomLevels, setSelectedBloomLevels] = useState<BloomCognitiveLevel[]>([
        'REMEMBERING',
        'UNDERSTANDING',
        'APPLYING',
        'ANALYZING',
        'EVALUATING',
        'CREATING',
    ]);

    const handleToggleBloomLevel = (level: BloomCognitiveLevel) => {
        setSelectedBloomLevels((current) => {
            if (current.includes(level)) {
                // Keep at least one category selected to prevent generating empty config
                if (current.length === 1) {
                    return current;
                }
                return current.filter((l) => l !== level);
            }
            return [...current, level];
        });
    };

    return {
        selectedBloomLevels,
        handleToggleBloomLevel,
    };
}
