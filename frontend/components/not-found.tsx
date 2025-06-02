'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, FileSearch, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'

const AnimatedLogo = () => (
  <motion.div
    className="relative w-16 h-16"
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
        <Mail size={24} />
      </motion.div>
    </motion.div>
  </motion.div>
)

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <AnimatedLogo />
            <span className="text-2xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-orange-500">Notaic</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                },
              }}
              className="inline-block mb-8"
            >
              <FileSearch size={120} className="text-orange-500" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
            <div className="space-y-4">
              <p className="text-lg text-gray-700">Please sign in or create an account to continue.</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signin" passHref>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-300"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </motion.a>
                </Link>
                <Link href="/signup" passHref>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-300"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </motion.a>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <span className="text-sm font-semibold text-gray-500">Made By Notaic</span>
        </div>
      </footer>
    </div>
  )
}