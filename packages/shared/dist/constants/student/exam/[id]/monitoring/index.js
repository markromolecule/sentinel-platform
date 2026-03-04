"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOBILE_USER_AGENT_REGEX = exports.LOW_TIME_THRESHOLD_SECONDS = exports.MOCK_QUESTIONS = void 0;
// --- Mock Questions for Demo ---
exports.MOCK_QUESTIONS = [
    {
        id: 1,
        text: "Which of the following describes the behavior of a function where every element in the domain maps to a unique element in the codomain?",
        options: ["Injective (One-to-One)", "Surjective (Onto)", "Bijective", "Constant"],
        correct: 0,
    },
    {
        id: 2,
        text: "What is the derivative of f(x) = sin(x) + cos(x)?",
        options: ["cos(x) - sin(x)", "sin(x) - cos(x)", "cos(x) + sin(x)", "-sin(x) - cos(x)"],
        correct: 0,
    },
    {
        id: 3,
        text: "In computer science, what is the time complexity of searching for an element in a balanced binary search tree (BST)?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        correct: 2,
    },
    {
        id: 4,
        text: "Which protocol is used for securely transmitting data over the web?",
        options: ["HTTP", "HTTPS", "FTP", "SMTP"],
        correct: 1,
    },
];
// --- Timer Constants ---
exports.LOW_TIME_THRESHOLD_SECONDS = 300; // 5 minutes
// --- Mobile Detection Regex ---
exports.MOBILE_USER_AGENT_REGEX = /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i;
//# sourceMappingURL=index.js.map