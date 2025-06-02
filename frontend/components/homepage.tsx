'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Sparkles, Clock, Shield, Mail } from 'lucide-react'
import Link from 'next/link'
import { Link as ScrollLink } from 'react-scroll';

export function HomepageComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center group">
              <Mail className="h-8 w-8 text-orange-500 mr-3 transition-transform group-hover:scale-110" />
              <h1 className="text-2xl font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">Notaic</h1>
            </Link>
          <div className="hidden md:flex space-x-6">
            <ScrollLink to="features" smooth={true} duration={500} className="text-gray-600 hover:text-orange-500 transition-colors cursor-pointer">Features</ScrollLink>
            <ScrollLink to="how-it-works" smooth={true} duration={500} className="text-gray-600 hover:text-orange-500 transition-colors cursor-pointer">How It Works</ScrollLink>
            <ScrollLink to="pricing" smooth={true} duration={500} className="text-gray-600 hover:text-orange-500 transition-colors cursor-pointer">Pricing</ScrollLink>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/signin" className="text-gray-600 hover:text-orange-500 transition-colors">Log In</a>
            <a href="/signup" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">Sign Up</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              AI-Powered Email Responses
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Tailored to Your Voice, Crafted in Seconds
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <a href="#" className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors flex items-center">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a href="#" className="text-orange-500 border border-orange-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-50 transition-colors">
                Learn More
              </a>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Simplify Your Email Workflow</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Sparkles className="h-8 w-8 text-orange-500" />, title: "AI-Powered Writing", description: "Our advanced AI writes emails that sound just like you." },
                { icon: <Check className="h-8 w-8 text-orange-500" />, title: "Automatic Draft Creation", description: "AI-generated responses are automatically created as drafts in your email." },
                { icon: <Clock className="h-8 w-8 text-orange-500" />, title: "Time-Saving", description: "Reduce email writing time by up to 90% - just review and send AI-generated drafts." },
                { icon: <Shield className="h-8 w-8 text-orange-500" />, title: "Secure & Private", description: "Your data is encrypted and never used to train our AI models." }
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="bg-orange-50 p-6 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
              {[
                { number: 1, title: "Capture Your Style", description: "Answer a few questions to help our AI understand your unique writing style." },
                { number: 2, title: "AI Writes Responses", description: "Our AI automatically writes tailored and context-aware drafts for all incoming messages." },
                { number: 3, title: "Review and Send", description: "Quickly review the AI-generated drafts, make any necessary tweaks, and send with just a click." }
              ].map((step, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center text-center max-w-xs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Simple, Transparent Pricing</h2>
            <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch space-y-8 md:space-y-0 md:space-x-8">
              {[
                { 
                  title: "Free", 
                  price: "$0", 
                  features: [
                    "100 AI-generated drafts per month",
                    "Basic writing style customization",
                    "Email integration",
                    "Standard support"
                  ]
                },
                { 
                  title: "Pro", 
                  price: "$20", 
                  features: [
                    "Unlimited AI-generated drafts",
                    "Advanced writing style customization",
                    "Priority support",
                    "Analytics dashboard",
                    "Team collaboration features"
                  ],
                  highlighted: true
                }
              ].map((plan, index) => (
                <motion.div 
                  key={index}
                  className={`bg-white rounded-lg shadow-lg p-8 flex flex-col ${plan.highlighted ? 'border-2 border-orange-500' : ''}`}
                  style={{ width: '300px' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
                  <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg font-normal text-gray-600">/month</span></div>
                  <ul className="mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center mb-2">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a 
                    href="#" 
                    className={`text-center py-2 px-4 rounded-full font-semibold ${
                      plan.highlighted 
                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {plan.highlighted ? 'Start Free Trial' : 'Get Started'}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center group">
              <Mail className="h-8 w-8 text-orange-500 mr-3 transition-transform group-hover:scale-110" />
              <h1 className="text-2xl font-semibold text-white-900 group-hover:text-orange-500 transition-colors">Notaic</h1>
            </Link>
              <p className="mt-2 text-gray-400">AI-powered email responses, tailored to your voice.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            &copy; 2024 Notaic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}