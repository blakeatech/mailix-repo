"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function IntroductionPage() {
  const router = useRouter()
  const title = "There's a lot of repetition in email communication"
  const description = "There's the core email you want to send... and then there's everything you do to make sure it's professional, effective, and reaches the right people."

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-orange-50 font-sans">
      <header className="w-full p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-gray-800 hover:text-orange-500 transition-colors">
          <ArrowLeft size={20} />
          <span>Go back</span>
        </Link>
        <button onClick={() => router.push('/signup')} className="text-gray-600 hover:text-orange-500 transition-colors">
          Skip tutorial
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title.split(' ').map((word, index) => (
              <span key={index} className={word === 'email' ? 'text-orange-500' : ''}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>
          <motion.p 
            className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {description}
          </motion.p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button onClick={() => router.push('/solution')} className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:bg-orange-600 flex items-center space-x-2">
              <span>Continue</span>
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </main>

      <footer className="w-full p-4 flex justify-center items-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail size={20} />
          <span className="text-sm">MADE BY NOTAIC</span>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0">
        <motion.div
          className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Mail size={32} className="text-white" />
        </motion.div>
      </div>

      <div className="fixed top-1/4 right-0 transform -translate-y-1/2">
        <motion.div
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <Mail size={24} className="text-white" />
        </motion.div>
      </div>
    </div>
  )
}
