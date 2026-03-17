import type { Exam, ExamQuestion } from "../types";

export const mockQuestions: ExamQuestion[] = [
    {
        id: "q-1",
        type: "multiple_choice",
        prompt: "What is the primary purpose of a 'volatile' keyword in Java?",
        points: 5,
        options: [
            "To prevent thread caching of variables",
            "To make a variable immutable",
            "To allow multiple inheritance",
            "To optimize loop performance"
        ],
        correctOption: 0,
    },
    {
        id: "q-2",
        type: "true_false",
        prompt: "React uses a Virtual DOM to minimize actual DOM manipulations.",
        points: 2,
        correctBoolean: true,
    },
    {
        id: "q-3",
        type: "identification",
        prompt: "What does HTML stand for?",
        points: 3,
        acceptedAnswers: ["HyperText Markup Language", "Hypertext Markup Language"],
    },
    {
        id: "q-4",
        type: "essay",
        prompt: "Explain the concept of 'closures' in JavaScript with a practical example.",
        points: 10,
        rubric: "Understanding of scope, inner functions, and data encapsulation.",
        maxLength: 1000,
    },
    {
        id: "q-5",
        type: "matching",
        prompt: "Match the CSS property to its effect.",
        points: 5,
        pairs: [
            { left: "display: flex", right: "Enables flexbox layout" },
            { left: "position: absolute", right: "Relative to nearest positioned ancestor" },
            { left: "opacity: 0", right: "Makes element fully transparent" }
        ],
    }
];
