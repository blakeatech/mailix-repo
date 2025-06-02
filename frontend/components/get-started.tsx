'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export function GetStartedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <main className="flex-grow flex">
        <div className="w-1/2 bg-gray-50 p-12 flex flex-col justify-center">
          <motion.h1 
            className="text-5xl font-bold mb-6 text-gray-800 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to Notaic
          </motion.h1>
          <motion.p 
            className="text-xl mb-8 text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Notaic uses AI to automatically draft email replies in your voice, so you can focus on what matters most.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button 
              onClick={() => router.push('/introduction')} 
              className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:bg-orange-600"
            >
              Get started
            </button>
          </motion.div>
        </div>
        <div className="w-1/2 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-24 h-24 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <motion.div
              className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full opacity-75"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-500 rounded-full opacity-75"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
            />
          </motion.div>
        </div>
      </main>
      <footer className="bg-gray-100 py-4 px-12 text-center text-gray-600">
        <p className="text-sm">MADE BY NOTAIC</p>
      </footer>
    </div>
  )
}
