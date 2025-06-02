'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, RefreshCw } from 'lucide-react'

const AnimatedLogo = () => (
  <motion.div
    className="relative w-24 h-24 mb-8"
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
        <Mail size={32} />
      </motion.div>
    </motion.div>
  </motion.div>
)

export function VerifyEmailPage() {
  const [resendTimer, setResendTimer] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const [resendStatus, setResendStatus] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timer)
          setIsResendDisabled(false)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResend = async () => {
    try {
      setIsResendDisabled(true)
      setResendStatus('Sending...')

      const email = localStorage.getItem('email')
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: email
      })

      if (!response.ok) {
        throw new Error('Failed to resend verification email')
      }

      const data = await response.json()

      if (data.message) {
        setResendStatus('Verification email sent successfully!')
      }

      setResendTimer(60)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
      setResendStatus('Failed to send verification email. Please try again later.')
    } finally {
      setIsResendDisabled(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-orange-50 font-sans">
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col items-center">
            <AnimatedLogo />
            <motion.h1
              className="text-3xl font-bold mb-4 text-center text-gray-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Verify your email
            </motion.h1>
            <motion.p
              className="text-gray-600 text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </motion.p>
            <motion.button
              className={`flex items-center justify-center w-full bg-orange-500 text-white px-4 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out ${
                isResendDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 shadow-lg hover:shadow-xl'
              }`}
              onClick={handleResend}
              disabled={isResendDisabled}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              {isResendDisabled ? `Resend in ${resendTimer}s` : 'Resend verification email'}
            </motion.button>
            {resendStatus && (
              <motion.p
                className="mt-4 text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {resendStatus}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
      <footer className="w-full p-4 flex justify-center items-center bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-sm">MADE BY NOTAIC</span>
        </div>
      </footer>
    </div>
  )
}
