/**
 * A simple seeded random number generator (Linear Congruential Generator).
 * This is deterministic given the same seed.
 */
class SeededRandom {
    private state: number;

    constructor(seed: string) {
        // Hash the number
        let h = 0;
        for (let i = 0; i < seed.length; i++) {
            h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
        }
        this.state = h;
    }

    // Returns a random float between 0 and 1
    next(): number {
        this.state = (Math.imul(16807, this.state) % 2147483647) | 0;
        if (this.state < 0) this.state += 2147483647;
        return (this.state - 1) / 2147483646;
    }
}

// Shuffles an array deterministically using a seed string
// Uses the Fisher-Yates shuffle algorithm
export function deterministicShuffle<T>(array: T[], seed: string): T[] {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...array];
    const random = new SeededRandom(seed);

    // Loop backwards through the array
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i (inclusive)
        const j = Math.floor(random.next() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}
