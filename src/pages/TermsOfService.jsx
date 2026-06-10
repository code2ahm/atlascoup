import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: June 2026</p>

        <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Atlas Coup ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. Description of Service</h2>
            <p>Atlas Coup provides a personal development platform including habit tracking, task management, goal setting, journaling, and analytics tools. The Platform is provided "as is" without warranties of any kind.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate, current, and complete information during registration.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Acceptable Use</h2>
            <p>You agree not to misuse the Platform for any unlawful purpose or in violation of any applicable laws. You may not attempt to gain unauthorized access to any part of the Platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Data Privacy</h2>
            <p>Your use of the Platform is governed by our Privacy Policy. By using the Platform, you consent to the collection and use of your information as described therein.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Limitation of Liability</h2>
            <p>Atlas Coup shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform. The Platform is provided for personal development purposes only and is not a substitute for professional advice.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">7. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">8. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:mru3337@gmail.com" className="text-primary-400 hover:text-primary-300">mru3337@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
