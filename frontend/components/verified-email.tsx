'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

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

export function EmailVerifiedPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const verificationAttempted = useRef(false)
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      try {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (!token) {
          throw new Error('No token provided')
        }

        const api_url = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${api_url}/auth/verify-email?token=${token}`)

        if (response.status === 200) {
          setVerificationStatus('success')
        } else {
          setVerificationStatus('error')
        }
      } catch (error) {
        console.error('Error verifying email:', error)
        setVerificationStatus('error')
      }
    }
    verifyEmail()
  }, [])

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
            {verificationStatus === 'loading' && (
              <motion.div
                className="text-2xl font-bold mb-4 text-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Verifying your email...
              </motion.div>
            )}
            {verificationStatus === 'success' && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Email Verified!</h1>
                <p className="text-gray-600 text-center mb-8">
                  Your email has been successfully verified. You can now go back and continue using Notaic.
                </p>
                <Button
                  onClick={() => router.push('/onboarding')}
                  className="flex items-center justify-center w-full bg-orange-500 text-white px-4 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-orange-600 shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Proceed to Onboarding
                </Button>
              </motion.div>
            )}
            {verificationStatus === 'error' && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Verification Failed</h1>
                <p className="text-gray-600 text-center mb-8">
                  We&apos;re sorry, but the verification link has expired or is invalid. Please request a new verification email.
                </p>
                <Link
                  href="/resend-verification"
                  className="flex items-center justify-center w-full bg-orange-500 text-white px-4 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-orange-600 shadow-lg hover:shadow-xl"
                >
                  Request New Verification
                </Link>
              </motion.div>
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