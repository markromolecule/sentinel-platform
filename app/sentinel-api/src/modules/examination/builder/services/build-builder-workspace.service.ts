import { QuestionTypeService } from '../../../content/question-type/question-type.service';
import type { BuilderWorkspace } from '../builder.dto';

/**
 * Constructs a BuilderWorkspace object from an exam object.
 * Integrates the supported question types from QuestionTypeService.
 */
export function buildBuilderWorkspace(exam: BuilderWorkspace['exam']): BuilderWorkspace {
    return {
        exam,
        questionTypes: QuestionTypeService.getQuestionTypes(),
    };
}
