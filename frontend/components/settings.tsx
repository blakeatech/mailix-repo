'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Settings, LogOut, Trash2, X, Plus, ArrowRight, ChevronDown, ChevronUp, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

// Define a type for personalized styles
type PersonalizedStyle = {
  type: string;
  value: string;
  style: string;
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

export function SettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [writingStyle, setWritingStyle] = useState('professional')
  const [personalizedStyles, setPersonalizedStyles] = useState<PersonalizedStyle[]>([])
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [newPersonalizedStyle, setNewPersonalizedStyle] = useState({ type: 'email', value: '', style: 'professional' })
  const [isPro, setIsPro] = useState(false) // This should be set based on the user's actual subscription status
  const [isPersonalizedStylesOpen, setIsPersonalizedStylesOpen] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const router = useRouter();

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

  const handleDeleteAccount = async () => {
    // Implement account deletion logic here
    const token = localStorage.getItem('token')

    const api_url = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${api_url}/account/delete-account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.ok) {
      localStorage.removeItem('token')
      router.push('/signin')
      setShowDeleteConfirm(false)
    } else {
      console.error('Failed to delete account')
    }
  }

  const handleAddPersonalizedStyle = () => {
    setPersonalizedStyles([...personalizedStyles, newPersonalizedStyle])
    setNewPersonalizedStyle({ type: 'email', value: '', style: 'professional' })
  }

  const handleRemovePersonalizedStyle = (index: number) => {
    const updatedStyles = personalizedStyles.filter((_, i) => i !== index)
    setPersonalizedStyles(updatedStyles)
  }

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown)
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    router.push('/signin');
  }

  interface Style {
    type: string;
    value: string; // Adjust the type based on your actual data structure
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveMessage('')
    const token = localStorage.getItem('token')
    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/account/update-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: writingStyle }),
      })
      if (response.ok) {
        setSaveMessage('Settings successfully saved.')
      } else {
        setSaveMessage('Settings failed to save.')
      }
    } catch {
      setSaveMessage('Settings failed to save.')
    } finally {
      setIsSaving(false)
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
      } catch {
        console.error('Authentication error')
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

  const handleCancelSubscription = async () => {
    // Implement subscription cancellation logic here
    const token = localStorage.getItem('token')
    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        setSaveMessage('Pro subscription cancelled successfully.')
        setIsPro(false)  // Update the local state
      } else {
        setSaveMessage('Failed to cancel subscription. Please try again.')
      }
    } catch {
      setSaveMessage('An error occurred while cancelling the subscription.')
    }
  }

  interface Style {
    type: string;
    value: string; // Adjust the type based on your actual data structure
    style: string; // Add this property if it exists in your data
  }
  
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

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl mx-auto space-y-8"
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900">Settings</motion.h1>
          
          <motion.section variants={itemVariants} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Writing Style</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="writingStyle"
                    value="professional"
                    checked={writingStyle === 'professional'}
                    onChange={() => setWritingStyle('professional')}
                    className="mr-2"
                  />
                  Professional
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="writingStyle"
                    value="casual"
                    checked={writingStyle === 'casual'}
                    onChange={() => setWritingStyle('casual')}
                    className="mr-2"
                  />
                  Casual
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="writingStyle"
                    value="formal"
                    checked={writingStyle === 'formal'}
                    onChange={() => setWritingStyle('formal')}
                    className="mr-2"
                  />
                  Formal
                </label>
              </div>
            </div>
          </motion.section>

          {isPro && (
            <motion.section variants={itemVariants} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personalized Writing Styles</h2>
                  <p className="text-sm text-gray-500 mt-1">Customize writing styles for specific emails or domains</p>
                </div>
                <button
                  onClick={() => setIsPersonalizedStylesOpen(!isPersonalizedStylesOpen)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {isPersonalizedStylesOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>
              <AnimatePresence>
                {isPersonalizedStylesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      {personalizedStyles.map((style, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center space-x-2"
                        >
                          <motion.select
                            value={style.type}
                            onChange={(e) => {
                              const updatedStyles = [...personalizedStyles]
                              updatedStyles[index].type = e.target.value
                              updatedStyles[index].value = ''
                              setPersonalizedStyles(updatedStyles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <option value="email">Email</option>
                            <option value="domain">Domain</option>
                          </motion.select>
                          <motion.div className="flex-grow relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                            {(style as Style).type === 'email' && (
                              <input
                                type="email"
                                value={(style as Style).value}
                                onChange={(e) => {
                                  const updatedStyles = [...personalizedStyles]
                                  updatedStyles[index].value = e.target.value
                                  setPersonalizedStyles(updatedStyles)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="name@example.com"
                              />
                            )}
                            {style.type === 'domain' && (
                              <div className="flex items-center">
                                <span className="absolute left-3 text-gray-500">@</span>
                                <input
                                  type="text"
                                  value={style.value}
                                  onChange={(e) => {
                                    const updatedStyles = [...personalizedStyles]
                                    updatedStyles[index].value = e.target.value
                                    setPersonalizedStyles(updatedStyles)
                                  }}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="example.com"
                                />
                              </div>
                            )}
                          </motion.div>
                          <motion.select
                            value={(style as Style).style}
                            onChange={(e) => {
                              const updatedStyles = [...personalizedStyles]
                              updatedStyles[index].style = e.target.value
                              setPersonalizedStyles(updatedStyles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="formal">Formal</option>
                          </motion.select>
                          <motion.button
                            onClick={() => handleRemovePersonalizedStyle(index)}
                            className="p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <X size={18} />
                          </motion.button>
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <select
                          value={newPersonalizedStyle.type}
                          onChange={(e) => setNewPersonalizedStyle({ ...newPersonalizedStyle, type: e.target.value, value: '' })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="email">Email</option>
                          <option value="domain">Domain</option>
                        </select>
                        <div className="flex-grow relative">
                          {newPersonalizedStyle.type === 'email' && (
                            <input
                              type="email"
                              value={newPersonalizedStyle.value}
                              onChange={(e) => setNewPersonalizedStyle({ ...newPersonalizedStyle, value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="name@example.com"
                            />
                          )}
                          {newPersonalizedStyle.type === 'domain' && (
                            <div className="flex items-center">
                              <span className="absolute left-3 text-gray-500">@</span>
                              <input
                                type="text"
                                value={newPersonalizedStyle.value}
                                onChange={(e) => setNewPersonalizedStyle({ ...newPersonalizedStyle, value: e.target.value })}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="example.com"
                              />
                            </div>
                          )}
                        </div>
                        <select
                          value={newPersonalizedStyle.style}
                          onChange={(e) => setNewPersonalizedStyle({ ...newPersonalizedStyle, style: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="formal">Formal</option>
                        </select>
                        <button
                          onClick={handleAddPersonalizedStyle}
                          className="p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {!isPro && (
            <motion.section variants={itemVariants} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upgrade to Pro</h2>
              <p className="text-gray-600 mb-4">Upgrade to Pro to segment writing styles by email or domain.</p>
              <Link href="/pro" passHref>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors duration-300"
                >
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.a>
              </Link>
            </motion.section>
          )}

          <motion.section variants={itemVariants} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
            {isPro && (
              <button
                onClick={handleCancelSubscription}
                className="flex items-center text-orange-600 hover:text-orange-800 transition-colors mb-4"
              >
                <X size={18} className="mr-2" />
                Cancel Pro Subscription
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Account
            </button>
          </motion.section>

          <motion.div variants={itemVariants} className="flex justify-end items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <span className="text-sm font-semibold text-gray-500">Made By Notaic</span>
        </div>
      </footer>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Account Deletion</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
              saveMessage.includes('successfully') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}