import { type DB } from '@sentinel/db';
import { type Selectable } from 'kysely';
import type { CreateExamBody, UpdateExamBody } from '@/modules/examination/exams/exam.dto';
import type { ExamConfigurationState, UpdateExamConfigurationBody } from '../configuration.dto';

export type ExamConfigurationPayload =
    | Pick<
          CreateExamBody,
          | 'shuffleQuestions'
          | 'showCorrectAnswers'
          | 'allowReview'
          | 'randomizeChoices'
          | 'settings'
          | 'configuration'
      >
    | Pick<
          UpdateExamBody,
          | 'shuffleQuestions'
          | 'showCorrectAnswers'
          | 'allowReview'
          | 'randomizeChoices'
          | 'settings'
          | 'configuration'
      >
    | UpdateExamConfigurationBody;

export type ExamConfigurationRecord = Selectable<DB['exam_configurations']>;

export type ExamSettingsState = ExamConfigurationState['settings'];
export type ExamConfigurationValues = ExamConfigurationState['configuration'];
