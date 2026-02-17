import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
     return (
          <main className="min-h-screen bg-[#0f0f10] pt-32 md:pt-40 lg:pt-48 pb-20 relative overflow-hidden">
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size:40px_40px mask-linear-gradient(to_bottom,black_40%,transparent_100%) pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
                         <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                         Back to Home
                    </Link>

                    <div className="mb-12">
                         <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans tracking-tight">
                              Terms of Service
                         </h1>
                         <p className="text-gray-400 text-lg leading-relaxed">
                              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                         </p>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                         <p>
                              Please read these Terms of Service ("Terms") carefully before using the Sentinel examination security system operated by us.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">1. Acceptance of Terms</h2>
                         <p>
                              By accessing or using Sentinel, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">2. Description of Service</h2>
                         <p>
                              Sentinel provides an automated proctoring solution that uses webcam and microphone data to monitor examination integrity. This service is intended for use by educational institutions and their students.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">3. User Responsibilities</h2>
                         <p>
                              As a user of Sentinel, you agree to:
                         </p>
                         <ul className="list-disc pl-6 space-y-2 text-gray-400">
                              <li>Provide accurate and complete information during registration and exam sessions.</li>
                              <li>Ensure you have the necessary hardware (webcam, microphone) and stable internet connection.</li>
                              <li>Conduct yourself with academic honesty and integrity during all assessments.</li>
                              <li>Not attempt to circumvent, disable, or tamper with the security features of the system.</li>
                         </ul>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">4. Privacy and Data Collection</h2>
                         <p>
                              Your use of Sentinel is also governed by our <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</Link>. By using the service, you consent to the collection and use of information as detailed in the Privacy Policy, including biometric and audio data processing in compliance with the Data Privacy Act of 2012.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">5. Intellectual Property</h2>
                         <p>
                              The Sentinel service and its original content, features, and functionality are and will remain the exclusive property of varying educational partners and licensors. The service is protected by copyright, trademark, and other laws.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">6. Termination</h2>
                         <p>
                              We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">7. Limitation of Liability</h2>
                         <p>
                              In no event shall Sentinel, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">8. Changes</h2>
                         <p>
                              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">9. Contact Us</h2>
                         <p>
                              If you have any questions about these Terms, please contact us at <a href="mailto:support@sentinel.edu" className="text-blue-400 hover:text-blue-300 transition-colors">support@sentinel.edu</a>.
                         </p>
                    </div>
               </div>
          </main>
     );
}
