'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

const AnimatedLogo = () => (
  <motion.div
    className="relative w-12 h-12"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <motion.div
      className="absolute inset-0 bg-orange-500 rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: 3,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
      }}
    />
    <motion.div
      className="absolute inset-1 bg-white rounded-full flex items-center justify-center"
      animate={{
        scale: [1, 0.8, 1],
      }}
      transition={{
        duration: 3,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
      }}
    >
      <motion.div
        animate={{
          rotate: [0, -360],
          color: ['#f97316', '#ea580c', '#f97316'],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
      >
        <Mail size={20} />
      </motion.div>
    </motion.div>
  </motion.div>
)

const PolicySection = ({ title, content, index }: { title: string, content: string[], index: number }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="border-b border-gray-200 py-5"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-2xl font-bold text-gray-800 hover:text-orange-500 transition-colors duration-300">{title}</h2>
        {isOpen ? <ChevronUp className="text-gray-500" size={30} /> : <ChevronDown className="text-gray-500" size={30} />}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-5 text-gray-600 space-y-3">
          {content.map((paragraph, idx) => (
            <motion.div
              key={idx}
              className="ml-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              {paragraph.startsWith('-') ? (
                <li className="list-disc ml-5 text-lg">
                  <span dangerouslySetInnerHTML={{ __html: formatText(paragraph.slice(1).trim()) }} />
                </li>
              ) : (
                <p className="text-lg" dangerouslySetInnerHTML={{ __html: formatText(paragraph) }} />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

const formatText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
}

export function PrivacyPolicy() {
  const policyContent = [
    {
      title: "1. Data Collection and Use",
      content: [
        "We collect and process user data solely to provide our core services, which include automating the drafting of emails on your behalf. Our data collection practices adhere to the principle of data minimization, ensuring we only collect information necessary for our operations.",
        "**Types of Data Collected Include:**",
        "- Personal Information: Name, email address, and any other details required to create an account.",
        "- Email Access: We access the content of your email account to draft, send, and manage emails as part of our service.",
        "- Usage Data: Information on how you interact with our app, including access times, pages viewed, and actions taken.",
        "- Technical Data: IP address, device type, browser type, and operating system.",
        "- Cookies and Tracking Technologies: See our 'Cookies and Tracking Technologies' section for more details."
      ]
    },
    {
      title: "2. Email Account Access and Management",
      content: [
        "**Email Content**: To provide our email automation services, we access your email account with your permission. This access is used exclusively to draft, manage, and automate emails as per your instructions.",
        "**Data Deletion**: You may request the deletion of all email-related data at any time via app settings or by contacting us. Upon verification of your request, all email data will be deleted within 30 days."
      ]
    },
    {
      title: "3. Cookies and Tracking Technologies",
      content: [
        "We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can manage cookie preferences through your browser settings or the cookie consent tool on our website.",
        "- Essential Cookies: Required for the basic functionality of the Application.",
        "- Analytical Cookies: Help us understand how users interact with our service.",
        "- Marketing Cookies: Used to provide personalized advertising (if applicable).",
        "You have the right to disable cookies, but this may affect the functionality of the Application."
      ]
    },
    {
      title: "4. Data Processing and Third Parties",
      content: [
        "Your data will not be used for advertising, profiling, or sold to third parties. Any third-party service providers we engage (e.g., payment processors, analytics providers) are subject to strict confidentiality and data protection agreements. We only share data with third parties to the extent necessary to deliver our services.",
        "**Categories of Third-Party Service Providers Include:**",
        "- Email Service Providers (for email automation)",
        "- Payment Processing Services",
        "- Analytics Services",
        "A full list of these third parties can be provided upon request."
      ]
    },
    {
      title: "5. User Rights and Control",
      content: [
        "**Data Access and Portability**: Users can access and request their data in a machine-readable format via the application. Requests are processed within 30 days.",
        "**Data Correction**: Requests to correct inaccurate data are processed within 30 days.",
        "**Right to Be Forgotten**: Upon request, we will delete all user data, including email data, within 30 days of verification, except where retention is legally required.",
        "**Revocation of Permissions**: Users can revoke data collection permissions via app settings. This may limit certain functionalities."
      ]
    },
    {
      title: "6. Data Retention",
      content: [
        "- Active accounts: Data, including email access data, is retained for the duration of account activity.",
        "- Inactive accounts: Data is retained for 12 months, after which it is securely deleted.",
        "- Deleted accounts: All personal data, including email data, is removed within 30 days. Backup data is purged within 60 days following a secure deletion process."
      ]
    },
    {
      title: "7. Data Security and Breach Notification",
      content: [
        "We implement appropriate security measures, including encryption, firewalls, and regular security audits, to protect your data. In the event of a data breach, we will notify affected users via email and post an in-app notification within 72 hours, as well as report to relevant authorities when required."
      ]
    },
    {
      title: "8. International Data Transfers",
      content: [
        "If your data is transferred outside your jurisdiction, we ensure it is protected using appropriate safeguards, such as standard contractual clauses or equivalent legal mechanisms."
      ]
    },
    {
      title: "9. Protection of Minors",
      content: [
        "We take special precautions to protect minors' data:",
        "- Parental Consent: Required for users aged 13 to 16. Consent is obtained through a secure verification process.",
        "- Child-Friendly Language: We use simple, clear language for minors.",
        "- No Targeted Advertising: We do not target minors with advertising.",
        "- Data Minimization: Data collection for minors is limited to core service requirements.",
        "- Parental Access: Parents can review or request the deletion of their child's data."
      ]
    },
    {
      title: "10. Changes to Privacy Policy",
      content: [
        "We reserve the right to modify this Privacy Policy. Users will be notified of significant changes via email, in-app notifications, or website postings at least 30 days before the changes take effect. Continued use of the Application after the changes constitutes acceptance of the revised policy."
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-5">
            <Link href="/" className="flex items-center space-x-3 group">
              <AnimatedLogo />
              <span className="text-2xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-orange-500">Notaic</span>
            </Link>
          </div>
          <div className="flex space-x-5">
            <Link href="/signup">
              <button className="px-5 py-3 bg-orange-500 text-white text-lg rounded-md hover:bg-orange-600 transition-colors">
                Sign Up
              </button>
            </Link>
            <Link href="/signin">
              <button className="px-5 py-3 bg-white text-orange-500 text-lg border border-orange-500 rounded-md hover:bg-orange-50 transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-5 sm:px-7 lg:px-10 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-10">
          <motion.h1
            className="text-4xl font-bold text-gray-900 mb-3"
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-10"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Last Updated: September 29, 2024
          </motion.p>
          
          <div className="h-[75vh] overflow-y-auto pr-5">
            {policyContent.map((section, index) => (
              <PolicySection key={index} title={section.title} content={section.content} index={index} />
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 flex justify-center items-center">
          <span className="text-base font-semibold text-gray-500">Made By Notaic</span>
        </div>
      </footer>
    </div>
  )
}