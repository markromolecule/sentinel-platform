import { useQuery } from '@tanstack/react-query';
import { getQuestionType } from '@sentinel/services';
import type { QuestionType } from '@sentinel/shared/types';
import { QUESTION_TYPE_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useQuestionTypeQuery(type?: QuestionType) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: type ? QUESTION_TYPE_QUERY_KEYS.details(type) : QUESTION_TYPE_QUERY_KEYS.all,
        queryFn: () => getQuestionType(apiClient, type as QuestionType),
        enabled: isAuthenticatedQueryEnabled && Boolean(type),
    });
}
