"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mail, Edit, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function SolutionPage() {
  const router = useRouter()
  const title = "Notaic drafts emails in your voice"
  const description1 = "Whether you're writing personal emails or for business, writing with your unique voice is crucial. But crafting the perfect email can be time-consuming and repetitive."
  const description2 = "Notaic helps you create draft emails that sound just like you, saving time while ensuring your personal touch remains intact."

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-orange-50 font-sans">
      <header className="w-full p-4 flex justify-between items-center">
        <Link href="/introduction" className="flex items-center space-x-2 text-gray-800 hover:text-orange-500 transition-colors">
          <ArrowLeft size={20} />
          <span>Go back</span>
        </Link>
        <button onClick={() => router.push('/signup')} className="text-gray-600 hover:text-orange-500 transition-colors">
          Skip tutorial
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-4xl w-full space-y-8">
          <motion.p 
            className="text-xl text-center text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {description1}
          </motion.p>

          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-12 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {title.split(' ').map((word, index) => (
              <span key={index} className={word === 'Notaic' ? 'text-orange-500' : ''}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>

          <motion.div
            className="flex justify-center items-center space-x-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Edit size={32} className="text-orange-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Your Voice</p>
            </div>
            <div className="flex-1 h-0.5 bg-orange-200 relative">
              <motion.div
                className="absolute top-1/2 left-0 transform -translate-y-1/2"
                animate={{ x: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={24} className="text-orange-500" />
              </motion.div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                <Mail size={32} className="text-white" />
              </div>
              <p className="text-sm font-medium text-gray-600">Drafted Email</p>
            </div>
          </motion.div>

          <motion.p 
            className="text-xl text-center text-gray-600 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {description2}
          </motion.p>

          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <button onClick={() => router.push('/example')} className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:bg-orange-600 flex items-center space-x-2">
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
    </div>
  )
}
