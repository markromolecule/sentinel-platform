import { redirect } from 'next/navigation';

export default function SuperadminRedirectPage() {
    redirect('/institutions');
}
