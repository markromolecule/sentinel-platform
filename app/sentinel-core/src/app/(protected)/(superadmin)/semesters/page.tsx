import { redirect } from 'next/navigation';
import { getSupportPortalUrl } from '@/lib/support-portal';

export default function SuperadminSemestersPage() {
    redirect(`${getSupportPortalUrl()}/semesters`);
}
