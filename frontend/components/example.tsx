"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mail, MessageSquare, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const useTypingEffect = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return displayedText
}

const EmailCard = ({ icon, title, description, email, onClick }: { icon: React.ReactNode, title: string, description: string, email: string, onClick: () => void }) => (
  <motion.div
    className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-semibold ml-3">{title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="bg-gray-100 p-4 rounded-md mb-4 flex-grow">
      <p className="text-sm text-gray-800">{email}</p>
    </div>
    <button
      onClick={onClick}
      className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-orange-600"
    >
      Try example
    </button>
  </motion.div>
)

const ResponseOverlay = ({ response, onClose }: { response: string, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full"
      >
        <h3 className="text-2xl font-bold mb-4">Notaic&apos;s Response</h3>
        <motion.div 
          className="bg-gray-100 p-4 rounded-md mb-4 h-64 overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
        </motion.div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-orange-600"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ExamplePage() {
  const router = useRouter()
  const title = useTypingEffect("PPlay with Notaic", 50)
  const description = useTypingEffect("Seelect an email example so   Notaic can help you draft a response.", 30)

  const [selectedExample, setSelectedExample] = useState<string | null>(null)

  const handleExampleClick = (example: string) => {
    setSelectedExample(example)
  }

  const closeResponse = () => {
    setSelectedExample(null)
  }

  const getResponse = (example: string) => {
    switch (example) {
      case 'sarah':
        return `Hi Michael,

Thank you for your interest in my consulting services. I'd be happy to provide you with more information.

My current rates range from $150 to $250 per hour, depending on the scope and complexity of the project. I offer package deals for long-term engagements as well.

Regarding availability, I typically book projects 2-3 weeks in advance, but I may be able to accommodate urgent requests depending on my current workload.

Would you like to schedule a brief call to discuss your specific needs? I'm available this Thursday and Friday afternoon if that works for you.

Looking forward to potentially working together!

Best regards,
Sarah`
      case 'alex':
        return `Hi Jamie,

Great to hear from you! I'm glad you enjoyed our conversation about AI in healthcare at the Tech Innovation Conference. It was definitely one of the highlights of the event for me.

I've been thinking more about some of the points you raised, especially regarding data privacy in AI-driven diagnostics. I came across an interesting article on the topic that I thought you might appreciate. I'll send it your way shortly.

By the way, are you planning to attend the upcoming HealthTech Summit next month? If so, perhaps we could meet up and continue our discussion. If not, maybe we could grab a coffee sometime and exchange more ideas?

Looking forward to staying in touch!

Best,
Alex`
      case 'emily':
        return `Hi Taylor,

Thank you for offering me the position of Junior Developer at TechCorp. I appreciate the time and consideration you've given my application throughout the interview process.

After careful consideration, I've decided to decline this opportunity. While I'm impressed with TechCorp's innovative work, I've realized that my career goals are more aligned with data science and machine learning roles at this time.

I want to express my gratitude for your confidence in my abilities. It was a pleasure learning about TechCorp, and I wish you and your team all the best in your future endeavors.

Thank you again for your offer and your understanding.

Best regards,
Emily`
      default:
        return ''
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }

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

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {title}
        </motion.h1>
        <motion.p 
          className="text-xl text-center text-gray-600 mb-12 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {description}
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <EmailCard
              icon={<Mail className="w-8 h-8 text-orange-500" />}
              title="Help Sarah draft a professional response"
              description="to a client inquiry about her consulting services"
              email="Dear Sarah,

I came across your website and I'm interested in your consulting services. Could you please provide more information about your rates and availability?

Best regards,
Michael"
              onClick={() => handleExampleClick('sarah')}
            />
          </motion.div>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <EmailCard
              icon={<MessageSquare className="w-8 h-8 text-orange-500" />}
              title="Help Alex compose a friendly follow-up"
              description="to a networking contact he met at a conference"
              email="Hi Alex,

It was great meeting you at the Tech Innovation Conference last week. I enjoyed our conversation about AI in healthcare.

Best,
Jamie"
              onClick={() => handleExampleClick('alex')}
            />
          </motion.div>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <EmailCard
              icon={<X className="w-8 h-8 text-orange-500" />}
              title="Help Emily write a polite decline"
              description="to a job offer that doesn't align with her career goals"
              email="Dear Emily,
              
              We are pleased to offer you the position of Junior Developer at TechCorp. The starting salary is $60,000 per year with standard benefits.

Please let us know your decision by Friday.

Regards,
Taylor, HR Manager"
              onClick={() => handleExampleClick('emily')}
            />
          </motion.div>
        </div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <button onClick={() => router.push('/signup')} className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:bg-orange-600 flex items-center space-x-2">
            <span>Continue</span>
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </main>

      <footer className="w-full p-4 flex justify-center items-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail size={20} />
          <span className="text-sm">MADE BY NOTAIC</span>
        </div>
      </footer>

      <AnimatePresence>
        {selectedExample && (
          <ResponseOverlay
            response={getResponse(selectedExample)}
            onClose={closeResponse}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
