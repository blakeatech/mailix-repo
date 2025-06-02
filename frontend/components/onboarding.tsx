"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight, Send } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const questions = [
  {
    question: "Select words you don't use in your writing:",
    type: "multiSelect",
    options: [
      "Additionally", "Moreover", "Furthermore", "In addition", "Consequently",
      "Accordingly", "That being said", "In light of this", "On the other hand",
      "To clarify", "Likewise", "To that end", "Notwithstanding",
      "With all due respect", "Be advised", "Nevertheless", "However",
      "Therefore", "Thus", "Hence", "Conversely", "Alternatively",
      "Correspondingly", "Subsequently", "Ultimately", "Essentially",
      "Fundamentally", "Notably", "Particularly", "Specifically"
    ]
  },
  {
    question: "Select the average length of your emails:",
    type: "singleSelect",
    options: [
      "Short (15-30 words)",
      "Medium (30-70 words)",
      "Long (70-100 words)"
    ]
  }
]

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
        <Mail size={16} />
      </motion.div>
    </motion.div>
  </motion.div>
)

export function OnboardingPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[][]>(Array(questions.length).fill([]))
  const router = useRouter()

  const handleOptionToggle = (option: string) => {
    const newAnswers = [...answers]
    if (questions[currentQuestion].type === "multiSelect") {
      if (newAnswers[currentQuestion].includes(option)) {
        newAnswers[currentQuestion] = newAnswers[currentQuestion].filter(item => item !== option)
      } else {
        newAnswers[currentQuestion] = [...newAnswers[currentQuestion], option]
      }
    } else {
      newAnswers[currentQuestion] = [option]
    }
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    const selectedWords = answers[0];
    const averageLength = answers[1][0];

    const onboardingData = {
      selectedWords: selectedWords,
      averageLength: averageLength
    };

    const token = localStorage.getItem('token');

    try {
      await axios.put(
        'https://api.notaic.site/account/complete-onboarding',
        onboardingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-orange-50 font-sans">
      <header className="w-full p-4 flex justify-between items-center bg-white shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <AnimatedLogo />
          <span className="text-xl font-bold text-gray-800">Notaic</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
          Skip onboarding
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-lg shadow-xl p-8 pb-4 max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Tell Us About Yourself</h1>
          <p className="text-gray-600 text-center mb-8">
            Answer these 2 questions to help us understand your writing style and personalize your experience.
          </p>

          <div className="mb-8 bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-orange-500 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{questions[currentQuestion].question}</h2>
              <div className="grid grid-cols-2 gap-4 h-64 overflow-y-auto pr-2 custom-scrollbar">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionToggle(option)}
                    className={`p-4 rounded-md text-left transition-all duration-300 ease-in-out ${
                      answers[currentQuestion].includes(option)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center mt-8">
                <div className="flex space-x-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
                      currentQuestion === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {currentQuestion < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      disabled={answers[currentQuestion].length === 0}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
                        answers[currentQuestion].length === 0
                          ? 'bg-orange-200 text-orange-400 cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={answers[currentQuestion].length === 0}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
                        answers[currentQuestion].length === 0
                          ? 'bg-orange-200 text-orange-400 cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}
