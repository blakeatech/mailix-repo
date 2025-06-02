"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Settings, Search, LogOut, Send, ChevronDown, Home, Loader } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    transformOrigin: 'top right' 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring', 
      duration: 0.3, 
      bounce: 0.3 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { 
      duration: 0.2 
    } 
  }
};

const AnimatedLogo = () => (
  <motion.div
    className="relative w-10 h-10"
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
        <Mail size={16} />
      </motion.div>
    </motion.div>
  </motion.div>
)

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div layout className="border-b border-gray-200 py-4">
      <motion.button
        layout
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <motion.div
              variants={{ collapsed: { scale: 0.8 }, open: { scale: 1 } }}
              transition={{ duration: 0.3 }}
              className="mt-2 text-gray-600"
            >
              {answer}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function HelpAndSupportPage() {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"success" | "error" | null>(null)
  const router = useRouter()

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown)
  }

  const handleLogout = () => {
    // Implement logout logic here
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    router.push('/signin')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const token = localStorage.getItem('token')
    e.preventDefault()
    setIsSending(true)
    setSendStatus(null)

    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/account/user/create-help-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: ((e.target as HTMLFormElement).elements.namedItem('name') as HTMLInputElement)?.value,
          email: ((e.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement)?.value,
          message: ((e.target as HTMLFormElement).elements.namedItem('message') as HTMLTextAreaElement)?.value
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setSendStatus('success')
    } catch (error) {
      console.error('Error sending message:', error)
      setSendStatus('error')
    } finally {
      setIsSending(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/not-found')
      return
    }
  
    const authenticateUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication failed')
      }
      
      try {
        const api_url = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${api_url}/auth/authenticate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
  
        if (!response.ok) {
          throw new Error('Authentication failed')
        }
  
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
  
        // Authentication successful
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/not-found')
      }
    }
  
    authenticateUser()
  }, [router])

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <AnimatedLogo />
              <span className="text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-orange-500">Notaic</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search drafts"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard');
              }}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Home size={24} className="text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={handleSettingsClick}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Settings size={24} className="text-gray-600" />
              </button>
              <AnimatePresence>
                {showSettingsDropdown && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                  >
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a>
                    <a href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help & Support</a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <LogOut size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-gray-900 mb-8"
        >
          Help & Support
        </motion.h1>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.section variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="name" name="name" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" name="email" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" name="message" rows={4} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"></textarea>
              </div>
              <div>
                <button 
                  type="submit" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  disabled={isSending}
                >
                  {isSending ? (
                    <Loader className="animate-spin mr-2 h-5 w-5" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <motion.div layout className="space-y-4">
              <FAQItem
                question="How does Notaic write emails?"
                answer="Notaic employs a sophisticated blend of cutting-edge generative AI technology and personalized writing analysis. By carefully studying samples of your writing, our system crafts reply emails that authentically capture your unique voice and style. This ensures that each email not only conveys the right message but does so in a manner that's distinctly you."
              />
              <FAQItem
                question="How do I integrate my Gmail account with Notaic?"
                answer="We've streamlined the integration process to make it as seamless as possible. If your account requires Gmail integration, you'll see a prominent notification on your dashboard. This message will guide you through the simple steps to connect your Gmail account securely. We prioritize user experience, so you can rest assured that the process is straightforward and user-friendly."
              />
              <FAQItem
                question="Is it just Gmail that can be used with Notaic?"
                answer="Currently, Notaic is optimized for Gmail users, providing a seamless experience for those within the Google ecosystem. However, we're actively expanding our horizons. Our development team is working diligently to bring the power of Notaic to other popular email providers such as Outlook and Apple Mail. We're committed to making Notaic accessible to a broader audience, so stay tuned for exciting updates on new integrations."
              />
              <FAQItem
                question="How can I get free Pro access?"
                answer="We're delighted to offer our valued users the opportunity to experience Notaic Pro at no cost. Simply share your unique referral link with colleagues and friends who could benefit from our service. When they sign up using your link, you'll be rewarded with Pro access. It's our way of saying thank you for helping us grow the Notaic community while allowing you to enjoy premium features."
              />
              <FAQItem
                question="Is my data secure with Notaic?"
                answer="Absolutely. At Notaic, we consider data security to be of paramount importance. We employ state-of-the-art encryption protocols and rigorous security measures to safeguard your information. Our systems are regularly audited and updated to stay ahead of potential threats. Rest assured, your data is treated with the utmost confidentiality and protected by industry-leading security practices. Your trust is our priority, and we're committed to maintaining the highest standards of data protection."
              />
            </motion.div>
          </motion.section>
        </motion.div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <span className="text-sm font-semibold text-gray-500">Made By Notaic</span>
        </div>
      </footer>

      <AnimatePresence>
        {sendStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
              sendStatus === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {sendStatus === 'success' 
              ? "Message successfully sent. A member of our team will be reaching out to you as soon as possible."
              : "Failed to send message. Please try again later."}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}