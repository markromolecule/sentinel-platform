export function shouldShowExamDetailsLoading({
    isAuthLoading,
    isPending,
    isFetching,
    hasRawExam,
}: {
    isAuthLoading: boolean;
    isPending: boolean;
    isFetching: boolean;
    hasRawExam: boolean;
}) {
    return isAuthLoading || isPending || (isFetching && !hasRawExam);
}
