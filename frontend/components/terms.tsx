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

const TermsSection = ({ title, content, index }: { title: string, content: string[], index: number }) => {
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

export function TermsAndConditions() {
  const termsContent = [
    {
      title: "1. Introduction and Acceptance of Terms",
      content: [
        "1.1 These **Terms and Conditions** ('Terms') govern your access to and use of **Notaic** ('the Application'), including any content, functionality, and services offered on or through the Application.",
        "1.2 By accessing or using the Application, you agree to be **bound by these Terms**. If you disagree with any part of the Terms, you may not access the Application.",
        "1.3 We reserve the right to **modify these Terms** at any time. Notice of changes will be provided by posting the new Terms on this page, notifying you via email, and/or through an in-app notification. The '__Last Updated__' date will be revised accordingly. Continued use of the Application after changes indicates acceptance."
      ]
    },
    {
      title: "2. Eligibility and User Accounts",
      content: [
        "2.1 **Age Restrictions**: Users must be at least 16 years old. Users aged 13 to 16 require verifiable parental or legal guardian consent obtained through our secure process, including submission of a government-issued ID or credit card verification. This consent will be stored securely as long as the user account is active.",
        "2.2 **Account Creation**: You agree to provide accurate, current, and complete information during registration and keep it updated.",
        "2.3 **Account Security**: You are responsible for safeguarding your password. In case of unauthorized access, notify us immediately at __security@notaic.com__.",
        "2.4 **Termination of Account**: We may terminate or suspend your account for substantial breaches of these Terms. You will receive a written warning with at least 7 days' notice unless the breach endangers the security or integrity of the Application or violates laws, in which case immediate termination may occur."
      ]
    },
    {
      title: "3. Data Collection, Use, and Privacy",
      content: [
        "3.1 **Limited Data Usage**: We collect and process user data solely to create email drafts and provide services as outlined in these Terms. Your data will not be used for advertising, profiling, or sold to third parties. Third-party service providers are subject to strict confidentiality and data protection agreements.",
        "3.2 **Data Minimization**: We collect only the data necessary to provide our core services. Information about third-party data processors and their access levels is available upon request.",
        "3.3 **Revocation of Permissions**: Users can revoke permissions via app settings or by contacting __support@notaic.com__. Upon revocation, data collection and processing cease immediately. This may limit certain functionalities.",
        "3.4 **Data Retention**:",
        "- Active accounts: Data is retained for the duration of account activity.",
        "- Inactive accounts: Data is retained for 12 months, after which it is securely deleted.",
        "- Deleted accounts: All personal data is removed within 30 days. Backup data is purged within 60 days following a secure deletion process.",
        "3.5 **Data Access and Portability**: Users can access and request their data in a machine-readable format through the Application or by contacting __dpo@notaic.com__. Requests are processed within 30 days.",
        "3.6 **Data Correction**: Requests to correct inaccurate data are processed within 30 days.",
        "3.7 **Right to Be Forgotten**: Users can request data deletion, and all data will be deleted within 30 days of verification, except where legal retention is required.",
        "3.8 **Data Breach Notification**: In the event of a data breach, we will notify affected users via email and post an in-app notification within 72 hours, as well as report to relevant authorities."
      ]
    },
    {
      title: "4. Premium Subscription (Notaic Pro)",
      content: [
        "4.1 **Subscription Options**: Notaic Pro is available on a monthly or annual basis.",
        "4.2 **Premium Features**: Include removal of branding, Custom AI Writing Assistant, unlimited AI drafts, priority support, and advanced analytics.",
        "4.3 **Custom AI Writing Assistant**: By subscribing, you consent to email analysis for AI customization. This feature can be opted out via settings but may limit functionality.",
        "4.4 **Unlimited AI-Generated Drafts**: Fair usage is monitored. Abuse includes automated or excessive generation of drafts beyond normal usage patterns. Users will be notified of potential abuse and given the opportunity to adjust usage before limitations are imposed.",
        "4.5 **Priority Support**: Pro subscribers receive prioritized support but response times are not guaranteed.",
        "4.6 **Advanced Analytics**: Data collected for analytics is used solely to provide insights to users and is never shared or sold.",
        "4.7 **Subscription Terms**: Users can cancel subscriptions at any time via account settings or by contacting __support@notaic.com__.",
        "4.8 **Refund Policy**:",
        "- A 14-day money-back guarantee is offered for first-time subscribers.",
        "- After 14 days, refunds are prorated for unused portions. Refunds must be requested in writing via __support@notaic.com__ and will be processed within 30 days.",
        "4.9 **Changes to Premium Features**:",
        "- We provide 30 days' notice for significant changes.",
        "- If a significant feature is removed, affected users may cancel and receive a prorated refund."
      ]
    },
    {
      title: "5. Protection of Minors",
      content: [
        "5.1 **Parental Consent**: Consent is obtained and verified as per Section 2.1.",
        "5.2 **Child-Friendly Language**: Communications and policies for minors are provided in simple language.",
        "5.3 **No Targeted Advertising**: We do not use data from minors for advertising purposes.",
        "5.4 **Limited Data Collection**: Data collection for minors is minimized to core service requirements.",
        "5.5 **Parental Access**: Parents can review or delete their child's data by contacting __parentsupport@notaic.com__."
      ]
    },
    {
      title: "6. Intellectual Property Rights",
      content: [
        "6.1 **Application Content**: All original content, features, and functionality are owned by Notaic Inc. and protected by intellectual property laws.",
        "6.2 **User Content**: Users retain rights to their content but grant us a non-exclusive license to use it within the Application.",
        "6.3 **DMCA Compliance**: For copyright claims, contact __copyright@notaic.com__. We will respond within 10 business days."
      ]
    },
    {
      title: "7. User Conduct and Prohibited Activities",
      content: [
        "7.1 Users must not engage in illegal, infringing, or harmful activities or content submission.",
        "7.2 We may terminate access for breaches, with at least 7 days' written notice for non-critical breaches."
      ]
    },
    {
      title: "8. Disclaimers and Limitations of Liability",
      content: [
        "8.1 **'AS IS' and 'AS AVAILABLE' Basis**: The Application is provided without warranties, except where explicitly required by law. Users assume all risks related to their use of the Application.",
        "8.2 **Limitation of Liability**:",
        "- In no event will liability exceed the amount paid by you to us in the 12 months preceding the claim.",
        "- We are not liable for indirect, incidental, special, or consequential damages, including but not limited to loss of profits, data, goodwill, or other intangible losses."
      ]
    },
    {
      title: "9. Indemnification",
      content: [
        "You agree to indemnify and hold harmless Notaic Inc. from claims arising from your use, violations of these Terms, or infringement of third-party rights, provided that we notify you of such claims promptly. We reserve the right to assume exclusive defense at your expense."
      ]
    },
    {
      title: "10. Governing Law and Jurisdiction",
      content: [
        "10.1 These Terms are governed by the laws of Delaware, U.S., subject to applicable consumer protection laws of your jurisdiction.",
        "10.2 For international users, any conflicts with local laws will be addressed in compliance with those laws where required."
      ]
    },
    {
      title: "11. Dispute Resolution",
      content: [
        "11.1 Disputes are resolved via binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules.",
        "11.2 **Costs**: Each party is responsible for its arbitration fees, unless otherwise awarded. Arbitration will be conducted in Wilmington, Delaware, or virtually if agreed by both parties.",
        "11.3 Class action waivers apply unless prohibited by applicable law."
      ]
    },
    {
      title: "12. Severability and Waiver",
      content: [
        "12.1 If any provision is unenforceable, it will be modified to reflect the parties' intent while the remaining provisions remain in effect.",
        "12.2 Waivers must be in writing to be effective."
      ]
    },
    {
      title: "13. Changes to Application and Services",
      content: [
        "13.1 We reserve the right to amend or withdraw the Application. Notice of significant changes will be provided at least 30 days in advance for Premium features.",
        "13.2 In the event of a service interruption, affected users will be notified promptly and may be entitled to compensation, such as subscription extensions, if appropriate."
      ]
    },
    {
      title: "14. Force Majeure",
      content: [
        "14.1 Notaic Inc. will not be liable for any delay or failure in performance due to events beyond our reasonable control, including but not limited to natural disasters, war, terrorism, strikes, pandemics, power outages, or government actions."
      ]
    },
    {
      title: "15. Notice Procedures",
      content: [
        "15.1 Notices under these Terms will be provided via email to the address you provided, in-app notifications, or through updates posted on our website. It is your responsibility to keep your contact information current."
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
            Terms and Conditions
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
            {termsContent.map((section, index) => (
              <TermsSection key={index} title={section.title} content={section.content} index={index} />
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