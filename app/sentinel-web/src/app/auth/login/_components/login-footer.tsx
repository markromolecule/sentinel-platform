import Link from 'next/link';

export function LoginFooter() {
    return (
        <div className="mt-0 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
                href="/auth/register"
                className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
                Sign up
            </Link>
        </div>
    );
}
