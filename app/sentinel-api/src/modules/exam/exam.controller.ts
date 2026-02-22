import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import { ExamService } from './exam.service';

const examsRouter = new Hono<{ Variables: { user: { id: string }; supabaseUser: unknown } }>();

// Ensure all routes are authenticated
examsRouter.use('/*', authMiddleware);

// Create a new draft exam
examsRouter.post('/', async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();

        const { title, subject_id, duration_minutes, passing_score, difficulty } = body;

        if (!title || !duration_minutes) {
            return c.json({ error: 'Title and duration are required' }, 400);
        }

        const draft = await ExamService.createDraftExam({
            title,
            subject_id,
            duration_minutes: Number(duration_minutes),
            passing_score: Number(passing_score) || 0,
            difficulty: difficulty || 'MEDIUM',
            created_by: user.id,
        });

        return c.json({ data: draft }, 201);
    } catch (error: unknown) {
        console.error('Error creating draft exam:', error);
        return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
});

// Retrieve an exam for the builder
examsRouter.get('/:id/builder', async (c) => {
    try {
        const examId = c.req.param('id');
        const exam = await ExamService.getExamWithQuestions(examId);

        if (!exam) {
            return c.json({ error: 'Exam not found' }, 404);
        }

        return c.json({ data: exam }, 200);
    } catch (error: unknown) {
        console.error('Error fetching exam builder state:', error);
        return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
});

// Save external builder state (Draft)
examsRouter.put('/:id/builder', async (c) => {
    try {
        const examId = c.req.param('id');
        const body = await c.req.json();

        const { questions } = body;

        if (!questions || !Array.isArray(questions)) {
            return c.json({ error: 'Questions array is required' }, 400);
        }

        const updatedExam = await ExamService.saveBuilderState(examId, questions);
        const refetchedExam = await ExamService.getExamWithQuestions(examId);

        return c.json({ data: refetchedExam, message: 'Draft saved successfully' }, 200);
    } catch (error: unknown) {
        console.error('Error saving builder state:', error);
        return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
});

export default examsRouter;
