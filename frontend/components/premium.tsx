"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Settings, LogOut, Check, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


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

const FeatureItem = ({ title, description, index }: { title: string, description: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="flex items-start space-x-3"
  >
    <div className="flex-shrink-0">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30, delay: index * 0.1 + 0.2 }}
      >
        <Check className="h-6 w-6 text-green-500" />
      </motion.div>
    </div>
    <div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-500">{description}</p>
    </div>
  </motion.div>
)

export function PremiumPage() {
  const router = useRouter()
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isPro, setIsPro] = useState(false)
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

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    router.push('/signin')
  }

  const features = [
    {
      title: "Sentiment Segmentation",
      description: "We'll segment how your emails are written based on the email address of the recipient."
    },
    {
      title: "Unlimited AI-Generated Drafts",
      description: "Notaic creates as many email drafts as you need without any restrictions."
    },
    {
      title: "Priority Support",
      description: "Get faster responses and dedicated assistance from our support team."
    },
    {
      title: "Advanced Analytics",
      description: "Gain deeper insights into your email performance with detailed to-do lists and notices on high-priority emails."
    }
  ]

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

  useEffect(() => {
    const fetchIsPro = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        return
      }
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/account/subscription-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setIsPro(data.subscription_status)
    }
    fetchIsPro()
  }, [isAuthenticated])

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

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Upgrade to Notaic Pro
            </h1>
            <p className="mt-5 text-xl text-gray-500">
              Elevate your email game with advanced AI-powered features and unlimited possibilities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-xl rounded-lg overflow-hidden"
          >
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                {features.map((feature, index) => (
                  <FeatureItem key={index} title={feature.title} description={feature.description} index={index} />
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="px-6 pt-6 pb-8 bg-gray-50 sm:px-10 sm:py-10"
            >
              <div className="flex justify-center items-center mb-4">
                <span className="text-5xl font-extrabold text-gray-900">$20</span>
                <span className="text-xl text-gray-500 ml-2">/month</span>
              </div>
              <motion.div
                whileHover={isPro ? {} : { scale: 1.05 }}
                whileTap={isPro ? {} : { scale: 0.95 }}
                className="rounded-md shadow"
              >
                {isPro ? (
                  <div className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-400 cursor-not-allowed">
                    You have a Pro subscription
                  </div>
                ) : (
                  <Link 
                    href="/checkout" 
                    className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors duration-300"
                  >
                    Upgrade Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
              </motion.div>
              {!isPro && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Enjoy a 14-day free trial. Cancel anytime.
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <span className="text-sm font-semibold text-gray-500">Made By Notaic</span>
        </div>
      </footer>
    </div>
  )
}