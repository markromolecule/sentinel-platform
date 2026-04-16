import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#0f0f10] pt-32 pb-20 md:pt-40 lg:pt-48">
            {/* Background Grid */}
            <div className="bg-size:40px_40px mask-linear-gradient(to_bottom,black_40%,transparent_100%) pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]"></div>

            <div className="relative z-10 container mx-auto max-w-4xl px-6">
                <Link
                    href="/"
                    className="group mb-8 inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                <div className="mb-12">
                    <h1 className="mb-6 font-sans text-4xl font-bold tracking-tight text-white md:text-5xl">
                        Terms of Service
                    </h1>
                    <p className="text-lg leading-relaxed text-gray-400">
                        Last updated:{' '}
                        {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                    <p>
                        Please read these Terms of Service (&quot;Terms&quot;) carefully before
                        using the Sentinel examination security system operated by us.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        1. Acceptance of Terms
                    </h2>
                    <p>
                        By accessing or using Sentinel, you agree to be bound by these Terms. If you
                        disagree with any part of the terms, then you may not access the service.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        2. Description of Service
                    </h2>
                    <p>
                        Sentinel provides an automated proctoring solution that uses webcam and
                        microphone data to monitor examination integrity. This service is intended
                        for use by educational institutions and their students.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        3. User Responsibilities
                    </h2>
                    <p>As a user of Sentinel, you agree to:</p>
                    <ul className="list-disc space-y-2 pl-6 text-gray-400">
                        <li>
                            Provide accurate and complete information during registration and exam
                            sessions.
                        </li>
                        <li>
                            Ensure you have the necessary hardware (webcam, microphone) and stable
                            internet connection.
                        </li>
                        <li>
                            Conduct yourself with academic honesty and integrity during all
                            assessments.
                        </li>
                        <li>
                            Not attempt to circumvent, disable, or tamper with the security features
                            of the system.
                        </li>
                    </ul>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        4. Privacy and Data Collection
                    </h2>
                    <p>
                        Your use of Sentinel is also governed by our{' '}
                        <Link
                            href="/privacy-policy"
                            className="text-blue-400 transition-colors hover:text-blue-300"
                        >
                            Privacy Policy
                        </Link>
                        . By using the service, you consent to the collection and use of information
                        as detailed in the Privacy Policy, including biometric and audio data
                        processing in compliance with the Data Privacy Act of 2012.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        5. Intellectual Property
                    </h2>
                    <p>
                        The Sentinel service and its original content, features, and functionality
                        are and will remain the exclusive property of varying educational partners
                        and licensors. The service is protected by copyright, trademark, and other
                        laws.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        6. Termination
                    </h2>
                    <p>
                        We may terminate or suspend access to our service immediately, without prior
                        notice or liability, for any reason whatsoever, including without limitation
                        if you breach the Terms.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        7. Limitation of Liability
                    </h2>
                    <p>
                        In no event shall Sentinel, nor its directors, employees, partners, agents,
                        suppliers, or affiliates, be liable for any indirect, incidental, special,
                        consequential or punitive damages, including without limitation, loss of
                        profits, data, use, goodwill, or other intangible losses.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">8. Changes</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these
                        Terms at any time. By continuing to access or use our service after those
                        revisions become effective, you agree to be bound by the revised terms.
                    </p>

                    <h2 className="mt-12 mb-6 text-2xl font-semibold text-blue-200">
                        9. Contact Us
                    </h2>
                    <p>
                        If you have any questions about these Terms, please contact us at{' '}
                        <a
                            href="mailto:support@sentinelph.tech"
                            className="text-blue-400 transition-colors hover:text-blue-300"
                        >
                            support@sentinelph.tech
                        </a>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}
