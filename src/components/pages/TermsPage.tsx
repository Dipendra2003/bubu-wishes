import React from "react";
import StaticPage from "./StaticPage";
import {
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  Ban,
  Copyright,
  Gavel,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const sections = [
  {
    icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "1. Acceptance of Terms",
    gradient: "from-emerald-500 to-teal-500",
    content:
      "Welcome to BubuWish. By accessing our website, creating an account, or sending/viewing any digital cards on our platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, you are strictly prohibited from using our services.",
  },
  {
    icon: <Copyright className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "2. Use License & Intellectual Property",
    gradient: "from-blue-500 to-indigo-500",
    content:
      "All content provided on BubuWish (including the Bubu & Dudu illustrations, 3D assets, UI designs, and code) is the intellectual property of BubuWish or its licensors. Permission is granted to temporarily use the materials on our platform for personal, non-commercial transitory viewing only.",
    details: [
      "You may not modify, scrape, or copy our assets for commercial purposes.",
      "You may not reverse engineer, decompile, or attempt to extract source code from the 3D viewers.",
      "You may not remove any copyright or proprietary notations from our digital cards.",
      "This license automatically terminates if you violate any of these restrictions.",
    ],
  },
  {
    icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "3. User Content & Ownership",
    gradient: "from-purple-500 to-violet-500",
    content:
      "You retain all ownership rights in your User Content (including personal photos, custom text messages, and audio recordings you upload to your cards). By submitting User Content to BubuWish, you grant us a worldwide, non-exclusive, royalty-free license to securely store, encrypt, and display that content solely for the purpose of delivering the card to your intended recipients.",
  },
  {
    icon: <Ban className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "4. Prohibited Content & Abuse",
    gradient: "from-red-500 to-rose-500",
    content:
      "To maintain a safe and joyful environment, you agree not to use BubuWish to create or distribute any content that is harmful, illegal, or abusive. We reserve the right to immediately terminate accounts and permanently delete cards that violate this policy without notice.",
    details: [
      "No illegal, harmful, or physically threatening content.",
      "No harassment, hate speech, bullying, or targeted discrimination.",
      "No explicitly adult, obscene, or highly sensitive NSFW material.",
      "No spam, malware distribution, phishing, or deceptive links.",
    ],
  },
  {
    icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "5. Account Security & Responsibilities",
    gradient: "from-cyan-500 to-blue-500",
    content:
      "You are responsible for safeguarding the password and login credentials that you use to access BubuWish. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "6. Disclaimer of Warranties",
    gradient: "from-amber-500 to-orange-500",
    content:
      "The materials and services on BubuWish are provided on an 'as is' and 'as available' basis. BubuWish makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.",
  },
  {
    icon: <Scale className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "7. Limitations of Liability",
    gradient: "from-gray-600 to-gray-800",
    content:
      "In no event shall BubuWish, its founders, or its suppliers be liable for any indirect, incidental, special, consequential, or punitive damages (including damages for loss of data, loss of emotional value, or business interruption) arising out of the use or inability to use the BubuWish service, even if we have been notified orally or in writing of the possibility of such damage.",
  },
];

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      subtitle="Please read these terms and conditions carefully before using the BubuWish platform."
    >
      {/* Updated date badge */}
      <div className="flex flex-wrap items-center gap-3 mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs sm:text-sm font-bold border border-pink-100">
          <FileText className="w-3.5 h-3.5" /> Last Updated: June 2026
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-sm font-bold border border-blue-100">
          <Gavel className="w-3.5 h-3.5" /> Version 1.0
        </span>
      </div>

      {/* Summary */}
      <motion.div
        className="bg-linear-to-br from-blue-50 via-white to-indigo-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-blue-100/80 shadow-sm mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Gavel className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-base sm:text-lg mb-2 font-display">
              Terms Summary
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              These Terms of Service govern your use of BubuWish. By using our
              service, you agree to these terms. We want to be transparent about
              what's expected on both sides.{" "}
              <strong className="text-gray-800">
                Your content remains yours — we just need permission to display
                it.
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

      {/* Terms sections */}
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
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base ml-0 sm:ml-13 lg:ml-15">
                {section.content}
              </p>
              {section.details && (
                <ul className="ml-0 sm:ml-13 lg:ml-15 mt-4 space-y-2">
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
        <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mx-auto mb-3" />
        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2 font-display">
          Questions About These Terms?
        </h3>
        <p className="text-gray-500 mb-4 sm:mb-5 text-sm sm:text-base font-medium max-w-md mx-auto">
          By continuing to use our services, you agree to these terms. For
          questions, feel free to reach out.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:legal@bubuwish.com"
            className="px-5 py-2.5 bg-linear-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition text-sm"
          >
            legal@bubuwish.com
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
