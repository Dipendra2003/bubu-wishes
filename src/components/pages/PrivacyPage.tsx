import React from 'react';
import StaticPage from './StaticPage';
import { Shield, Eye, Server, Lock, RefreshCw, Bell, UserCheck, Database, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const sections = [
  {
    icon: <Database className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Information We Collect",
    gradient: "from-blue-500 to-indigo-500",
    content: "We collect information that you provide directly to us when you register for an account, create a card, or communicate with us. This may include your name, email address, password, and the content you include in your greeting cards (including photos and text).",
    details: [
      "Account information (name, email, password hash)",
      "Card content (messages, photos, themes, music selections)",
      "Usage data (pages visited, features used, interaction patterns)",
      "Device information (browser type, OS, screen resolution)",
    ]
  },
  {
    icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "How We Use Your Information",
    gradient: "from-purple-500 to-violet-500",
    content: "We use the information we collect to operate, maintain, and provide the features and functionality of BubuWish. This includes customizing the greeting cards you create, authenticating your identity, and providing customer support.",
    details: [
      "Delivering and personalizing your card experience",
      "Account authentication and security",
      "Customer support and communication",
      "Service improvement and analytics",
    ]
  },
  {
    icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Sharing Your Information",
    gradient: "from-teal-500 to-emerald-500",
    content: "We do not sell or rent your personal information to third parties. We may share information with trusted third-party service providers who assist us in operating our application, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.",
    details: [
      "Cloud hosting providers (for data storage)",
      "Email delivery services (for notifications)",
      "Analytics tools (anonymized usage data only)",
      "We never sell your data to advertisers",
    ]
  },
  {
    icon: <Lock className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Security of Your Information",
    gradient: "from-rose-500 to-pink-500",
    content: "We use administrative, technical, and physical security measures to help protect your personal information. However, no data transmission over the Internet or wireless network can be guaranteed to be 100% secure.",
    details: [
      "Encrypted data transmission (TLS/SSL)",
      "Secure password hashing (bcrypt)",
      "Regular security audits and monitoring",
      "JWT-based authentication with refresh tokens",
    ]
  },
  {
    icon: <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Changes to This Privacy Policy",
    gradient: "from-amber-500 to-orange-500",
    content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last updated\" date.",
    details: [
      "We'll notify you of significant changes via email",
      "The updated date will always be visible at the top",
      "Continued use implies acceptance of changes",
    ]
  },
];

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" subtitle="Your privacy is important to us. Learn how BubuWish collects, uses, and protects your information.">

      {/* Updated date badge */}
      <div className="flex flex-wrap items-center gap-3 mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs sm:text-sm font-bold border border-pink-100">
          <FileText className="w-3.5 h-3.5" /> Last Updated: June 2026
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs sm:text-sm font-bold border border-green-100">
          <Shield className="w-3.5 h-3.5" /> GDPR Compliant
        </span>
      </div>

      {/* Summary card */}
      <motion.div
        className="bg-linear-to-br from-pink-50 via-white to-rose-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-pink-100/80 shadow-sm mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-base sm:text-lg mb-2 font-display">Our Privacy Commitment</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              At BubuWish, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application. <strong className="text-gray-800">We never sell your personal data.</strong>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Policy sections */}
      <div className="space-y-4 sm:space-y-6 mb-10 sm:mb-14">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br ${section.gradient} rounded-xl flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {section.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-400">Section {i + 1}</span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 font-display">{section.title}</h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4 ml-0 sm:ml-13 lg:ml-15">
                {section.content}
              </p>
              {section.details && (
                <ul className="ml-0 sm:ml-13 lg:ml-15 space-y-2">
                  {section.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-500 font-medium">
                      <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-br ${section.gradient} mt-2 shrink-0`}></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact footer */}
      <motion.div
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400 mx-auto mb-3" />
        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2 font-display">Questions About Privacy?</h3>
        <p className="text-gray-500 mb-4 sm:mb-5 text-sm sm:text-base font-medium max-w-md mx-auto">
          If you have any questions about this Privacy Policy, please reach out to our team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="mailto:privacy@bubuwish.com" className="px-5 py-2.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition text-sm">
            privacy@bubuwish.com
          </a>
          <Link to="/contact" className="px-5 py-2.5 bg-white text-pink-600 font-bold rounded-full border border-pink-200 hover:bg-pink-50 transition text-sm">
            Contact Form
          </Link>
        </div>
      </motion.div>
    </StaticPage>
  );
}
