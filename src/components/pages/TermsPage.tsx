import React from 'react';
import StaticPage from './StaticPage';

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Service">
      <p className="text-sm font-semibold text-gray-500 mb-8 pb-4 border-b border-gray-100">Last updated: June 2026</p>
      
      <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        Please read these terms and conditions carefully before using the BubuWish platform.
      </p>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">1</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Acceptance of Terms</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            By accessing and using BubuWish, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">2</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Use License</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            Permission is granted to temporarily use the materials (information or software) on BubuWish's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">3</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">User Content</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            You retain all of your ownership rights in your User Content (including images, text, and data in the cards you create). By submitting User Content to BubuWish, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content solely for the purpose of providing the service to you and your intended recipients.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">4</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Prohibited Content</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            You agree not to use the service to create or share any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, or otherwise objectionable.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">5</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Disclaimer</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            The materials on BubuWish are provided on an 'as is' basis. BubuWish makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">6</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Limitations</h3>
          </div>
          <p className="text-gray-600 pl-0 sm:pl-11 mt-2 sm:mt-0">
            In no event shall BubuWish or its suppliers be liable for any damages arising out of the use or inability to use the materials on BubuWish's website.
          </p>
        </section>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
        <p className="text-gray-600">
          By continuing to use our services, you agree to these terms. For questions, please <a href="mailto:legal@bubuwish.com" className="text-pink-600 font-bold hover:underline">contact our legal team</a>.
        </p>
      </div>
    </StaticPage>
  );
}
