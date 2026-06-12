import React from 'react';
import StaticPage from './StaticPage';

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p className="text-sm font-semibold text-gray-500 mb-8 pb-4 border-b border-gray-100">Last updated: June 2026</p>
      
      <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        At BubuWish, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application.
      </p>
      
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">1</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Information We Collect</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            We collect information that you provide directly to us when you register for an account, create a card, or communicate with us. This may include your name, email address, password, and the content you include in your greeting cards (including photos and text).
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">2</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">How We Use Your Information</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            We use the information we collect to operate, maintain, and provide the features and functionality of BubuWish. This includes customizing the greeting cards you create, authenticating your identity, and providing customer support.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">3</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Sharing Your Information</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            We do not sell or rent your personal information to third parties. We may share information with trusted third-party service providers who assist us in operating our application, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">4</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Security of Your Information</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            We use administrative, technical, and physical security measures to help protect your personal information. However, no data transmission over the Internet or wireless network can be guaranteed to be 100% secure.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">5</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Changes to This Privacy Policy</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
        <p className="text-gray-600">
          If you have any questions about this Privacy Policy, please <a href="mailto:support@bubuwish.com" className="text-pink-600 font-bold hover:underline">contact us</a>.
        </p>
      </div>
    </StaticPage>
  );
}
