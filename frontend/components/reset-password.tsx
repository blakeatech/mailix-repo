'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Loader, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get token from URL on client-side
    const urlParams = new URLSearchParams(window.location.search)
    setToken(urlParams.get('token'))
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: password, token: token })
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/signin?reset=success')
        }, 3000)
      } else {
        throw new Error('Failed to reset password')
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.")
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
              <Lock className="h-6 w-6 text-orange-600" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center justify-center space-x-3"
            >
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="font-medium">Password reset successful!</span>
              <Loader className="animate-spin h-5 w-5 text-green-500 ml-2" />
              <span className="text-sm">Redirecting...</span>
            </motion.div>
          ) : (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div className="relative">
                  <label htmlFor="new-password" className="sr-only">New password</label>
                  <Input
                    id="new-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">Confirm new password</label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Reset Password
                </Button>
              </div>
            </form>
          )}

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
