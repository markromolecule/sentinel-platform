# Table of Specifications (TOS) & Assessment Logic

This document details the mathematical formulas, business logic, and automated workflows used by Sentinel to manage the Table of Specifications (TOS) and the question bank lifecycle.

---

## 1. Core Definitions

### What is a TOS?

A **Table of Specifications (TOS)** is a two-way matrix used in educational assessment to ensure an exam is balanced. It maps **Learning Topics** (Y-axis) against **Cognitive Levels** (X-axis, based on Bloom's Taxonomy).

### Bloom's Taxonomy Levels

Sentinel uses the following six cognitive levels for classification:

1. **REMEMBERING** (LOTS - Lower Order Thinking Skills)
2. **UNDERSTANDING** (LOTS)
3. **APPLYING** (HOTS - Higher Order Thinking Skills)
4. **ANALYZING** (HOTS)
5. **EVALUATING** (HOTS)
6. **CREATING** (HOTS)

---

## 2. Automated TOS Workflow

Sentinel automates the creation of the TOS through a multi-step pipeline:

### Step 1: AI-Driven Extraction & Tagging

When a source document (e.g., PDF) is uploaded for question generation, the **Gemini Orchestrator** instructs the AI to perform structured tagging:

- **Topic Extraction**: Identify the specific sub-topic from the text.
- **Cognitive Mapping**: Assign one of the six Bloom's levels based on the question's depth.
- **Initial Estimation**: Provide a `predicted_difficulty` (Easy, Moderate, Hard) based on linguistic complexity.

### Step 2: Matrix Aggregation

The system aggregates `ACTIVE` questions into the TOS Matrix.

- **Formula**: `Count(Question) GROUP BY Topic, CognitiveLevel`
- **Visibility**: Educators can review the distribution grid to ensure "coverage" (e.g., "Do we have enough 'Applying' questions for 'Data Structures'?") before approving the pool.

---

## 3. Dynamic Difficulty Calibration (IRT)

To move beyond "subjective" AI predictions, Sentinel uses a simplified **Item Response Theory (IRT)** model to calibrate question difficulty based on actual student performance.

### The P-Value Formula

The difficulty of a question is defined mathematically as its **P-Value** (Item Difficulty Index):

$$P = \frac{\text{Correct Count}}{\text{Total Attempted}}$$

### Difficulty Mapping

After an exam is completed, the background **Calibration Engine** updates the `actual_difficulty` field using the following thresholds:

| P-Value Range       | Difficulty Tag | Description                              |
| :------------------ | :------------- | :--------------------------------------- |
| **P ≥ 0.85**        | **EASY**       | Over 85% of students got it right.       |
| **0.30 ≤ P < 0.85** | **MODERATE**   | Balanced difficulty.                     |
| **P < 0.30**        | **HARD**       | Fewer than 30% of students got it right. |

> [!NOTE]
> Questions with zero attempts are skipped during calibration to prevent skewed data.

---

## 4. Lifecycle & Exposure Management

To maintain exam integrity, Sentinel implements an automated **Retirement System** to prevent "Item Exposure" (where questions become too familiar to students).

### Step-by-Step Logic

1. **Tracking**: Every time an exam is published, the `usage_count` for all included questions is incremented by 1.
2. **Threshold Check**: The system compares the `usage_count` against the `QB_EXPOSURE_LIMIT` (Default: **3**).
3. **Auto-Retirement**:
    - If `usage_count >= limit`, the question status is set to `RETIRED`.
    - Retired questions are excluded from the "Active" TOS Matrix and future automated exam pulls.
    - They remain in the database for historical reporting and audit logs.

---

## 5. Summary of the Business Logic Flow

1. **Generation**: PDF → AI → Structured Questions with TOS Metadata.
2. **Approval**: Educator reviews the TOS Matrix Dashboard → Activates Question Pool.
3. **Execution**: Students take the Exam → System records correctness per question.
4. **Calibration**: System recalculates P-Value → Updates `actual_difficulty`.
5. **Retirement**: `usage_count` hits limit → Question is retired from active rotation.

---

_Created on: 2026-04-29_
_Related Files:_

- [`get-tos-matrix.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/get-tos-matrix.ts)
- [`calibrate-question-difficulty.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/services/calibrate-question-difficulty.ts)
- [`check-exposure-threshold.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/services/check-exposure-threshold.ts)
