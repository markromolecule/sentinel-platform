import { getRuntimePassageDetails } from '../../utils';

export const runtimePassageFixtureQuestion = {
    id: 'runtime-passage-question',
    content: {
        prompt: 'Read the passage.',
        options: [],
    },
} as const;

export const noPassageRuntimeFixture = getRuntimePassageDetails({
    questionPassageContent: null,
    questionPassageType: null,
});

export const plainTextRuntimeFixture = getRuntimePassageDetails({
    questionPassageContent: 'Line 1\nLine 2',
    questionPassageType: 'plain',
});

export const richTextRuntimeFixture = getRuntimePassageDetails({
    questionPassageContent:
        '<p><strong>Important</strong> supporting text.</p><ul><li>Detail A</li><li>Detail B</li></ul>',
    questionPassageType: 'html',
});

export const imageRuntimeFixture = getRuntimePassageDetails({
    questionPassageContent:
        '<p>Inspect the diagram.</p><img src="/fixtures/passage-diagram.png" alt="Diagram" />',
    questionPassageType: 'html',
});

export const longRuntimeFixture = getRuntimePassageDetails({
    questionPassageContent: Array.from(
        { length: 30 },
        (_, index) => `Paragraph ${index + 1}: extended passage content for scrolling coverage.`,
    ).join('\n'),
    questionPassageType: 'plain',
});

export const malformedRuntimeFixture = getRuntimePassageDetails({
    questionPassageContent:
        '<script>alert("xss")</script><p>Safe paragraph.</p><img src="javascript:alert(1)" alt="Unsafe diagram" /><a href="javascript:alert(2)">Bad link</a>',
    questionPassageType: 'html',
});
