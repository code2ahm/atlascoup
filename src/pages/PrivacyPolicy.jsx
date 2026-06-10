import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: June 2026</p>

        <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, and profile picture when you create an account. We also collect data generated through your use of the Platform, including habits, tasks, goals, journal entries, and analytics data.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve the Platform, personalize your experience, communicate with you, and ensure the security of your account. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. Data Storage and Security</h2>
            <p>Your data is stored securely using Firebase (Google Cloud Platform). We implement reasonable security measures to protect your information. However, no method of electronic storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Third-Party Services</h2>
            <p>We use Firebase (Google) for authentication and data storage. Google's privacy policy applies to the handling of data on their infrastructure. We may also use analytics tools to understand usage patterns.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Your Rights</h2>
            <p>You can access, update, or delete your account and data at any time through the Platform settings. You may export your data by contacting us. Account deletion permanently removes your data from our systems.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Cookies</h2>
            <p>We use local storage and Firebase authentication tokens to maintain your session and preferences. We do not use tracking cookies for advertising purposes.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">8. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:mru3337@gmail.com" className="text-primary-400 hover:text-primary-300">mru3337@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
