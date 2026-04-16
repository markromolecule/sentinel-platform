import Link from 'next/link';

export function RegisterFooter() {
    return (
        <div className="mt-0 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
                href="/auth/login"
                className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
                Sign in
            </Link>
        </div>
    );
}
