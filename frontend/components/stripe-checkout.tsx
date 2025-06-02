'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Settings, LogOut, ArrowRight, Home, Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '../env'; // Import your environment variables

// Load Stripe using the public key from the environment variable
const stripePromise = loadStripe(config.stripePublicKey);

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

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const api_url = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${api_url}/account/subscription-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });
        const data = await response.json();
        setIsPro(data.isPro);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };

    checkSubscriptionStatus();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setShowErrorPopup(false);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setLoading(false);
      setError('An error occurred. Please try again.');
      setShowErrorPopup(true);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message ?? 'An error occurred. Please try again.');
      setLoading(false);
      setShowErrorPopup(true);
    } else {
      try {
        const api_url = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${api_url}/subscription/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            payment_method_id: paymentMethod.id,
          }),
        });

        if (response.ok) {
          router.push('/subscription-success');
        } else {
          setError('Subscription unsuccessful. Please try again later.');
          setShowErrorPopup(true);
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
        setShowErrorPopup(true);
        console.error('Error:', error);
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-md shadow-sm">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {isPro ? (
        <div className="w-full bg-gray-400 text-white py-3 px-4 rounded-md flex items-center justify-center cursor-not-allowed">
          You have a Pro subscription
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading && <Loader className="animate-spin mr-2 h-5 w-5" />}
          {loading ? 'Processing...' : 'Subscribe Now'}
          {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
        </motion.button>
      )}
      <AnimatePresence>
        {showErrorPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export function CheckoutPage() {
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
            <h1 className="text-3xl font-extrabold text-gray-900">
              Upgrade to Notaic Pro
            </h1>
            <p className="mt-2 text-xl text-gray-600">
              Unlock premium features for $20/month
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-xl rounded-lg overflow-hidden"
          >
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            </div>
            <div className="px-6 pt-6 pb-8 bg-gray-50 sm:px-10 sm:py-10">
              <div className="flex justify-center items-center space-x-2">
                <span className="text-sm text-gray-500">Powered by</span>
                <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#635BFF" d="M59.64 14.28h-8.06v-1.84h8.05v1.84zm-8.06-3.67h8.05v-1.84h-8.05v1.84zm-8.06 5.51h8.05v-1.84h-8.05v1.84zm16.11-7.35V7.35h-16.1v1.42h16.1zm-16.1 9.19h16.1v-1.42h-16.1v1.42zm-9.47-5.51h8.05v-1.84h-8.05v1.84zm8.05-3.67h-8.05v-1.84h8.05v1.84zm-8.05 7.34h8.05v-1.84h-8.05v1.84zm16.11-1.83h-8.06v1.84h8.06v-1.84zm-8.06-1.84h8.06v-1.84h-8.06v1.84zm0-5.51h8.06V7.35h-8.06v1.84zM8.05 17.95h8.06v-1.84H8.05v1.84zm8.06-3.67H8.05v-1.84h8.06v1.84zm-8.06-3.67h8.06V8.77H8.05v1.84zm16.11 5.51h-8.05v1.84h8.05v-1.84zm-8.05-1.84h8.05v-1.84h-8.05v1.84zm0-5.51h8.05V7.35h-8.05v1.84zM0 14.28h8.05v-1.84H0v1.84zm8.05-3.67H0v-1.84h8.05v1.84zM0 17.95h8.05v-1.84H0v1.84z"/>
                </svg>
              </div>
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