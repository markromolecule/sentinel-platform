import { ExamAnswerKeyData } from '../exam-answer-key-view-model';

export const mockExamAnswerKeyFixture: ExamAnswerKeyData = {
    examId: 'exam-12345',
    title: 'Midterm Examination in Cyber Security & Cryptography',
    subjectCode: 'CS-401',
    subjectName: 'Cyber Security and Cryptography',
    durationMinutes: 120,
    difficulty: 'HARD',
    passingScore: 70,
    generatedAt: '2026-07-15T08:00:00.000Z',
    generatedBy: 'Dr. Evelyn Martinez',
    institutionName: 'Sentinel University',
    questions: [
        {
            questionId: 'q-1',
            type: 'MULTIPLE_CHOICE',
            points: 2,
            text: 'Which of the following cryptographic algorithms is considered symmetric?',
            passageText:
                'Symmetric cryptography utilizes the same key for both encryption and decryption, whereas asymmetric cryptography utilizes public and private key pairs. Common symmetric algorithms include AES and DES.',
            options: [
                { optionId: 'o-1-1', optionText: 'RSA', isCorrect: false },
                { optionId: 'o-1-2', optionText: 'AES', isCorrect: true },
                { optionId: 'o-1-3', optionText: 'ECC', isCorrect: false },
                { optionId: 'o-1-4', optionText: 'Diffie-Hellman', isCorrect: false },
            ],
        },
        {
            questionId: 'q-2',
            type: 'MULTIPLE_SELECT',
            points: 3,
            text: 'Select all protocols that operate at the Application Layer of the OSI Model. <p><i>Choose all that apply.</i></p>',
            options: [
                { optionId: 'o-2-1', optionText: 'HTTP', isCorrect: true },
                { optionId: 'o-2-2', optionText: 'TCP', isCorrect: false },
                { optionId: 'o-2-3', optionText: 'DNS', isCorrect: true },
                { optionId: 'o-2-4', optionText: 'IP', isCorrect: false },
            ],
        },
        {
            questionId: 'q-3',
            type: 'TRUE_FALSE',
            points: 1,
            text: 'In asymmetric key cryptography, the public key is used to decrypt data that was encrypted with the private key.',
            trueFalseAnswer: false,
        },
        {
            questionId: 'q-4',
            type: 'SHORT_ANSWER',
            points: 2,
            text: 'What is the full name of the standard hashing algorithm that produces a 256-bit hash value?',
            shortAnswerPattern: 'SHA-256',
        },
        {
            questionId: 'q-5',
            type: 'ESSAY',
            points: 10,
            text: 'Explain the concept of SQL Injection, how it can be exploited, and outline three distinct mitigation strategies to protect a relational database application.',
            rubric: [
                {
                    criterion: 'SQL Injection Explanation',
                    maxPoints: 3,
                    description:
                        'Clear and detailed explanation of input sanitization failure leading to SQL code injection.',
                },
                {
                    criterion: 'Exploitation Vectors',
                    maxPoints: 3,
                    description:
                        'Identification of authentication bypass, data extraction, or remote execution examples.',
                },
                {
                    criterion: 'Mitigation Strategies',
                    maxPoints: 4,
                    description:
                        'Provision of Parameterized Queries, Stored Procedures (safely), and Least Privilege permissions.',
                },
            ],
        },
        {
            questionId: 'q-6',
            type: 'FILL_IN_BLANK',
            points: 4,
            text: 'The <b>Transport Layer Security</b> (TLS) protocol consists of two main parts: the _____ protocol to establish connection parameters, and the _____ protocol to transmit encrypted segments.',
            blankAnswers: ['Handshake', 'Record'],
        },
        {
            questionId: 'q-7',
            type: 'MATCHING',
            points: 4,
            text: 'Match the cybersecurity terms on the left with their correct definitions on the right.',
            matchingPairs: [
                {
                    premise: 'Phishing',
                    response: 'Social engineering attack utilizing spoofed emails',
                },
                { premise: 'Salting', response: 'Adding random data to a password before hashing' },
                {
                    premise: 'Firewall',
                    response: 'Network security device monitoring incoming/outgoing traffic',
                },
                {
                    premise: 'Ransomware',
                    response: 'Malware that encrypts files and demands payment',
                },
            ],
        },
        {
            questionId: 'q-8',
            type: 'ORDERING',
            points: 3,
            text: 'Order the steps of a typical TCP three-way handshake from initiation to completion.',
            orderedItems: [
                'Client sends SYN packet',
                'Server responds with SYN-ACK packet',
                'Client sends ACK packet to establish connection',
            ],
        },
    ],
};
