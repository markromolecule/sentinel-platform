Implementing a Table of Specifications (TOS) in an AI-driven educational CMS is a massive leap from a standard question generator to a production-grade assessment engine.

A traditional TOS is a two-way grid that aligns learning topics with cognitive levels (usually Bloom's Taxonomy) to ensure an exam is balanced. When integrated with generative AI, the TOS transitions from a manual planning document to an automated blueprint and validation dashboard.

Here is how you can architect this system to meet your goals of intelligent lifecycle management and dynamic difficulty scaling.

### 1. The Automated TOS Workflow

Instead of a human filling out a TOS before writing questions, your system reverses the flow or uses a hybrid approach:

- **Extraction & Tagging:** When Gemini generates a question from the PDF/source, it must output a structured JSON response that includes not just the question, but the **Topic**, the **Cognitive Level** (e.g., Remembering, Applying, Analyzing), and the **Predicted Difficulty**.
- **Aggregation:** The CMS backend groups these generated questions and plots them on the TOS grid.
- **The Dashboard (UI):** The TOS page displays a matrix. The Y-axis lists the topics from the PDF, and the X-axis lists the cognitive levels. The intersecting cells show the count of generated questions. This allows the educator to instantly see if the AI generated too many basic recall questions and not enough critical thinking questions.

### 2. Making Questions Smarter: The Lifecycle (When to Retire)

You should never permanently "delete" questions because that breaks historical exam records and analytics. Instead, implement a **Retirement System** based on "Item Exposure Rate."

If a question is used too many times, it becomes compromised (students share it).

**How to implement it:**

1.  **Tracking:** Add a `usage_count` and `last_used_date` column to your question bank database table.
2.  **Exposure Threshold:** Define a global or department-level limit (e.g., a question can only be used in 3 distinct exams or seen by 150 students).
3.  **Auto-Archiving:** Once the threshold is hit, the system automatically flags the question's status as `retired` or `cooling_off`. It will no longer be pulled into new generated exams, but it remains in the database for historical audits.

### 3. Intelligent Difficulty: Dynamic Calibration

Relying solely on an AI's predicted difficulty tag (Easy, Medium, Hard) is flawed because difficulty is subjective. A truly intelligent CMS uses actual student performance data to determine difficulty, utilizing a simplified version of **Item Response Theory (IRT)**.

**The Strategy: P-Value (Item Difficulty Index)**
Difficulty is defined mathematically as the percentage of students who answer the item correctly.

- **Initial State:** Gemini generates the question and assigns a `predicted_difficulty` (e.g., "Hard").
- **Data Collection:** After the exam is taken, the backend calculates the actual success rate.
    - _Formula:_ `(Total Students Who Answered Correctly) / (Total Students Who Took the Exam)`
- **Calibration:** \* If the result is **0.85 to 1.00** (85% - 100% got it right), the question is **Easy**.
    - If the result is **0.30 to 0.84**, the question is **Medium**.
    - If the result is **0.00 to 0.29**, the question is **Hard**.
- **System Update:** A cron job or background worker updates the question's `actual_difficulty` tag in the database based on this real-world data. Over time, the CMS learns exactly how hard the question pool truly is, overriding the AI's initial guess.

### Summary of the User Flow

1.  **Upload:** Admin uploads the PDF.
2.  **Generation:** System prompts Gemini to generate 50 questions, enforcing a structured output containing topics and Bloom's taxonomy levels.
3.  **TOS Generation:** System plots those 50 questions onto the TOS dashboard.
4.  **Review:** Admin reviews the TOS. If it looks balanced, they approve the pool.
5.  **Execution & Feedback:** Students take the exam. The backend records the scores.
6.  **Self-Correction:** The system recalculates the `actualDifficulty` for each question and increments the `usageCount`. If a question hits the exposure limit, it is seamlessly retired from the active pool.

---

After [TOS]

Fix the issue on production where it returns [content_too_large] when I select multiple [question_types] how can you ensure that the system can handle 50 - 100 questions that consisted of multiple [question_types] to prevent having an error code [413]
