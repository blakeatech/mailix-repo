'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const InputField = ({ icon, type, placeholder, value, onChange }: { icon: React.ReactNode, type: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
)

const AnimatedLogo = () => (
  <motion.div
    className="relative w-32 h-32"
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
      className="absolute inset-2 bg-white rounded-full flex items-center justify-center"
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
        <Mail size={40} />
      </motion.div>
    </motion.div>
  </motion.div>
)

export function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isOver13, setIsOver13] = useState(false)
  const [showAgeError, setShowAgeError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const router = useRouter()

  const validateEmail = useCallback((email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }, [])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }, [validateEmail])

  const isFormValid = useCallback(() => {
    return validateEmail(email) && password.length > 0 && name.length > 0 && isOver13;
  }, [email, password, name, isOver13, validateEmail])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid()) {
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      }
      if (!isOver13) {
        setShowAgeError(true);
      }
      return;
    }
    setIsLoading(true);
    const api_url = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${api_url}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ full_name: name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('email', email);
      router.push('/verify-email');
    } else {
      console.error('Form submission failed:', data);
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-orange-50 font-sans">
      <div className="flex-grow flex">
        {/* Left side - Animated Logo */}
        <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center">
          <AnimatedLogo />
        </div>

        {/* Right side - Sign up form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-12">
          <motion.h1 
            className="text-4xl font-bold mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Start Your Free Trial
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            No credit card required. Get started in seconds.
          </motion.p>
          <motion.form 
            onSubmit={handleSubmit}
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <InputField
              icon={<User className="w-5 h-5 text-gray-400" />}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <InputField
              icon={<Mail className="w-5 h-5 text-gray-400" />}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={handleEmailChange}
            />
            {emailError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1 mb-2 text-red-500 text-sm"
              >
                {emailError}
              </motion.div>
            )}
            <InputField
              icon={<Lock className="w-5 h-5 text-gray-400" />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="ageCheck"
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                checked={isOver13}
                onChange={(e) => setIsOver13(e.target.checked)}
              />
              <label htmlFor="ageCheck" className="ml-2 text-sm text-gray-600">
                I am 13 years of age or older
              </label>
            </div>
            <AnimatePresence>
              {showAgeError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">You may not use Notaic if you are under the age of 13.</span>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white px-4 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:bg-orange-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              <span>{isLoading ? 'Processing...' : 'Start Free Trial'}</span>
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </button>
            <button
              onClick={() => router.push('/signin')}
              className="w-full bg-orange-500 text-white px-4 py-3 rounded-full text-lg mt-4 font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:bg-orange-600 flex items-center justify-center"
            >
              <span>Sign In</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.form>
          <p className="mt-8 text-sm text-gray-600 text-center">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-orange-500 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-orange-500 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full p-4 flex justify-center items-center bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-sm">MADE BY NOTAIC</span>
        </div>
      </footer>
    </div>
  )
}
