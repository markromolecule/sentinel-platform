# Goal

- To replicate the new lobby and monitoring page from the sentinel-web to sentinel-core
    - Ensure that all the components are replicated - no changes
    - Ensure that all the functionalities are replicated - no changes

- 1-is-to-1 like copy and paste and ensure that it looks like on the sentinel-web's monitoring and lobby page

# Fix the Issue on

- app/sentinel-core/src/app/(protected)/exams/[id]/monitoring/page.tsx

Type '{ examId: string; examTitle: string; examSubject: string; runtimeAccess: ExamRuntimeAccess | undefined; onRefresh: () => void; isRefreshing: boolean; onLock: () => void; onReopen: () => void; onReset: () => void; onClose: () => void; isUpdatingAccess: boolean; }' is not assignable to type 'IntrinsicAttributes & MonitoringHeaderProps'.
Property 'examId' does not exist on type 'IntrinsicAttributes & MonitoringHeaderProps'.ts(2322)
