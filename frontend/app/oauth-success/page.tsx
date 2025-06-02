'use client';

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { CheckCircle } from 'lucide-react'

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

export default function OAuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Your OAuth success logic here
    // For example, you might want to redirect to the dashboard
    router.push('/dashboard');
  }, [router]);

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
            <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">OAuth Success!</h1>
                <p className="text-gray-600 text-center mb-8">
                  Thank you for connecting your Google account. You can now go back and continue using Notaic.
                </p>
              </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}