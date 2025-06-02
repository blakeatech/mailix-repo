'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

export function ResetPasswordRequest() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: email
      })

      if (response.ok) {
        setSuccessMessage("If an account exists for this email, you'll receive reset instructions shortly.")
      } else {
        throw new Error('Failed to send reset email')
      }
    } catch {
      setErrorMessage("We couldn't find an account with that email. Please check the email or sign up for a new account.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <AnimatedLogo />
            <span className="text-2xl font-bold text-gray-800">Notaic</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100"
            >
              <Mail className="h-6 w-6 text-orange-600" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleResetRequest} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                )}
                Send reset email
              </Button>
            </div>
          </form>

          <div className="text-sm text-center">
            <Link href="/signin" className="font-medium text-orange-600 hover:text-orange-500">
              <ArrowLeft className="inline mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="bg-white py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">MADE BY NOTAIC</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}