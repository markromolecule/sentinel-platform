import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                              Privacy Policy
                         </h1>
                         <p className="text-gray-400 text-lg leading-relaxed">
                              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                         </p>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                         <p>
                              At Sentinel, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclosure, and safeguard your data when you use our examination security system.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">1. Data Privacy Act of 2012</h2>
                         <p>
                              We strictly adhere to the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> of the Philippines. We are dedicated to upholding your rights as a data subject, including your right to be informed, to object, to access, to rectification, to erasure or blocking, and to damages.
                         </p>
                         <p>
                              All personal data collected is processed in accordance with the general principles of transparency, legitimate purpose, and proportionality.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">2. Information We Collect</h2>
                         <p>
                              To provide our examination monitoring services, we may collect the following types of information:
                         </p>
                         <ul className="list-disc pl-6 space-y-2 text-gray-400">
                              <li><strong>Personal Information:</strong> Name, student ID, email address, and institutional affiliation.</li>
                              <li><strong>Biometric Data:</strong> Facial data for gaze tracking and identity verification during exam sessions.</li>
                              <li><strong>Audio Data:</strong> Audio recordings from your microphone during the exam environment monitoring.</li>
                              <li><strong>Device Information:</strong> Device type, operating system, and browser version used to access the system.</li>
                         </ul>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">3. How We Use Your Information</h2>
                         <p>
                              Your data is used solely for the purpose of maintaining examination integrity:
                         </p>
                         <ul className="list-disc pl-6 space-y-2 text-gray-400">
                              <li>Verifying your identity before and during assessments.</li>
                              <li>Monitoring exam sessions for potential academic dishonesty (e.g., unauthorized looking away, unauthorized voices).</li>
                              <li>Generating reports for proctors and educators.</li>
                              <li>Improving the accuracy and performance of our security algorithms.</li>
                         </ul>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">4. Data Security</h2>
                         <p>
                              We implement strict security measures to protect your data. All sensitive information is encrypted in transit and at rest. Access to exam recordings and reports is strictly limited to authorized proctors and administrators of your institution.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">5. Data Retention</h2>
                         <p>
                              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law or your institution's policy.
                         </p>

                         <h2 className="text-blue-200 mt-12 mb-6 text-2xl font-semibold">6. Contact Us</h2>
                         <p>
                              If you have any questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@sentinel.edu" className="text-blue-400 hover:text-blue-300 transition-colors">privacy@sentinel.edu</a>.
                         </p>
                    </div>
               </div>
          </main>
     );
}
