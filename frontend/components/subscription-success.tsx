'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Settings, LogOut, ArrowRight, Home, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '../env'; // Import your environment variables

const AnimatedLogo = () => (
  <motion.div
    className="relative w-10 h-10"
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
        <Mail size={16} />
      </motion.div>
    </motion.div>
  </motion.div>
)

export function SubscriptionSuccessPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    router.push('/');
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      transformOrigin: 'top right' 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        type: 'spring', 
        duration: 0.3, 
        bounce: 0.3 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/not-found');
      return;
    }
  
    const authenticateUser = async () => {
      try {
        const api_url = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${api_url}/auth/authenticate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/not-found');
      }
    };
  
    authenticateUser();
  }, [router]);

  if (!isAuthenticated) {
    return null; // Optionally, you can display a loading spinner here
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <AnimatedLogo />
              <span className="text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-orange-500">Notaic</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard');
              }}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Home size={24} className="text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={handleSettingsClick}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Settings size={24} className="text-gray-600" />
              </button>
              <AnimatePresence>
                {showSettingsDropdown && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                  >
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a>
                    <a href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help & Support</a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <LogOut size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <Check size={48} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Subscription Successful!
            </h1>
            <p className="mt-2 text-xl text-gray-600">
              Welcome to Notaic Pro
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-xl rounded-lg overflow-hidden"
          >
            <div className="px-6 py-8 sm:p-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Pro Benefits:</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  Unlimited AI-generated email drafts
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  Custom AI Writing Assistant
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  Advanced analytics
                </li>
              </ul>
            </div>
            <div className="px-6 py-8 sm:p-10 bg-gray-50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors duration-300 flex items-center justify-center"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <span className="text-sm font-semibold text-gray-500">Made By Notaic</span>
        </div>
      </footer>
    </div>
  );
}