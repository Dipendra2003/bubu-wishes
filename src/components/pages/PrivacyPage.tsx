import React from "react";
import StaticPage from "./StaticPage";
import {
  Shield,
  Eye,
  Server,
  Lock,
  RefreshCw,
  Bell,
  UserCheck,
  Database,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const sections = [
  {
    icon: <Database className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "1. Information We Collect",
    gradient: "from-blue-500 to-indigo-500",
    content:
      "When you interact with BubuWish, we collect the necessary information to provide you with a magical experience. This includes data you explicitly provide and data we collect automatically to ensure our 3D platform runs smoothly.",
    details: [
      "Account Data: Name, email address, and securely hashed passwords.",
      "Card Assets: Personal photos, text messages, and audio notes you upload.",
      "Technical Data: Browser type, device models (to optimize 3D rendering), and IP addresses.",
      "Cookies: Essential session tokens to keep you logged in securely.",
    ],
  },
  {
    icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "2. How We Use Your Data",
    gradient: "from-purple-500 to-violet-500",
    content:
      "Your data is strictly used to operate, maintain, and enhance the BubuWish platform. Our primary goal is to securely deliver your digital greeting cards to your intended recipients without compromising speed or quality.",
    details: [
      "Rendering your 3D greeting cards flawlessly across devices.",
      "Sending transactional emails (password resets, card open alerts).",
      "Using Google Gemini AI (only when explicitly requested via 'Magic Write') to generate message drafts.",
      "Analyzing aggregated, anonymized metrics to improve platform performance.",
    ],
  },
  {
    icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "3. Data Sharing & Third Parties",
    gradient: "from-teal-500 to-emerald-500",
    content:
      'We have a strict "No Data Selling" policy. Your personal photos, messages, and contact information will never be sold to advertisers or data brokers. We only share data with essential infrastructure partners.',
    details: [
      "Cloud Infrastructure: AWS/GCP for secure database hosting and media storage.",
      "Email Providers: Resend for delivering system notifications.",
      "AI Partners: Google Gemini (content is sent for generation only when 'Magic Write' is clicked, and is not used to train their models).",
      "Legal Compliance: We may disclose data if legally required by law enforcement.",
    ],
  },
  {
    icon: <Lock className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "4. Security Measures",
    gradient: "from-rose-500 to-pink-500",
    content:
      "We implement industry-standard security protocols to protect your memories. However, please remember that any unique card link you share can be viewed by anyone who possesses that exact URL.",
    details: [
      "Encryption: All data in transit is protected via TLS 1.3 (HTTPS).",
      "Storage: Passwords are salted and hashed using bcrypt.",
      "Media: User-uploaded photos are stored in secure cloud buckets with obfuscated URLs.",
      "Authentication: We utilize secure, HTTP-only JWT cookies to prevent XSS attacks.",
    ],
  },
  {
    icon: <Server className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "5. Data Retention & Deletion",
    gradient: "from-amber-500 to-orange-500",
    content:
      "Your digital greeting cards are designed to be lifelong digital keepsakes. We will retain your card data indefinitely unless you explicitly delete it.",
    details: [
      "You can delete specific cards from your Dashboard at any time.",
      "You can request full account deletion by contacting support.",
      "Deleted cards and associated media (photos/audio) are permanently scrubbed from our servers within 30 days.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      subtitle="Your privacy is important to us. Learn how BubuWish collects, uses, and protects your information."
    >
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
            <h3 className="font-black text-gray-900 text-base sm:text-lg mb-2 font-display">
              Our Privacy Commitment
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              At BubuWish, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website or use our application.{" "}
              <strong className="text-gray-800">
                We never sell your personal data.
              </strong>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Table of Contents */}
      <motion.div
        className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">
          Table of Contents
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sections.map((section, i) => (
            <button
              key={i}
              onClick={() => {
                const element = document.getElementById(`section-${i}`);
                if (element) {
                  const y = element.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 font-medium py-1 text-left transition-colors"
            >
              <span className="text-xs font-black text-pink-400 w-5">
                0{i + 1}
              </span>
              {section.title}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Policy sections */}
      <div className="space-y-4 sm:space-y-6 mb-10 sm:mb-14">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            id={`section-${i}`}
            className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300 scroll-mt-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br ${section.gradient} rounded-xl flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  {section.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-400">
                      Section {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 font-display">
                    {section.title}
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4 ml-0 sm:ml-13 lg:ml-15">
                {section.content}
              </p>
              {section.details && (
                <ul className="ml-0 sm:ml-13 lg:ml-15 space-y-2">
                  {section.details.map((detail, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm text-gray-500 font-medium"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-linear-to-br ${section.gradient} mt-2 shrink-0`}
                      ></div>
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
        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2 font-display">
          Questions About Privacy?
        </h3>
        <p className="text-gray-500 mb-4 sm:mb-5 text-sm sm:text-base font-medium max-w-md mx-auto">
          If you have any questions about this Privacy Policy, please reach out
          to our team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:privacy@bubuwish.com"
            className="px-5 py-2.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition text-sm"
          >
            privacy@bubuwish.com
          </a>
          <Link
            to="/contact"
            className="px-5 py-2.5 bg-white text-pink-600 font-bold rounded-full border border-pink-200 hover:bg-pink-50 transition text-sm"
          >
            Contact Form
          </Link>
        </div>
      </motion.div>
    </StaticPage>
  );
}
