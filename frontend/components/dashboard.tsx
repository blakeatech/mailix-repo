'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Settings, Search, Edit, ExternalLink, CheckCircle, FileText, Layout, LogOut, ArrowUpCircle, Lock, Home, User, Send } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Bar } from 'react-chartjs-2'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
} from 'chart.js'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend
)

interface StatProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

interface Draft {
  id: string;
  draft_subject: string;
  email_body: string;
  draft_body: string;
  database_id: string;
  gmail_id: string;
  recipient_email: string;
  recipient_subject: string;
}

interface TodoItem {
  id: string;
  text: string;
  source: string;
}

interface HighPriorityEmail {
  id: string;
  subject: string;
  sender: string;
}

interface TodoListCardProps {
  isPro: boolean;
  recentDrafts: Draft[];
}

const TodoListCard: React.FC<TodoListCardProps> = ({ isPro, recentDrafts }) => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  useEffect(() => {
    if (isPro) {
      setTodos(recentDrafts.map(draft => ({
        id: draft.id,
        text: draft.draft_subject,
        source: draft.recipient_email || 'Unknown source'
      })));
    } else {
      setTodos([
        { id: '1', text: 'Review project proposal', source: 'Project Update Email' },
        { id: '2', text: 'Schedule team meeting', source: 'Weekly Sync Email' },
        { id: '3', text: 'Prepare presentation slides', source: 'Client Meeting Prep Email' },
      ]);
    }
  }, [isPro, recentDrafts]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const removeTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">To-Do List</h2>
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-md mb-2"
          >
            <div>
              <p className="text-gray-800 font-medium">{todo.text}</p>
              <p className="text-sm text-gray-500">Source: {todo.source}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.open('#', '_blank')}
                className="p-2 text-blue-500 hover:text-blue-600 transition-colors"
                aria-label="Go to source"
              >
                <ExternalLink size={20} />
              </button>
              <button
                onClick={() => removeTodo(todo.id)}
                className="p-2 text-green-500 hover:text-green-600 transition-colors"
                aria-label="Mark as done"
              >
                <CheckCircle size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

const HighPriorityEmailsCard: React.FC<{ isPro: boolean; highPriorityEmails: HighPriorityEmail[] }> = ({ isPro, highPriorityEmails }) => {
  const [emails, setEmails] = useState<HighPriorityEmail[]>([]);

  useEffect(() => {
    if (isPro) {
      setEmails(highPriorityEmails.map(email => ({
        id: email.id,
        subject: email.subject,
        sender: email.sender
      })));
    } else {
      setEmails([
        { id: '1', subject: 'Urgent: Client Meeting Rescheduled', sender: 'John Doe'},
        { id: '2', subject: 'Project Deadline Update', sender: 'Jane Smith'},
        { id: '3', subject: 'Important: Budget Approval Needed', sender: 'Finance Team'},
      ]);
    }
  }, [isPro, highPriorityEmails]);

  const removeEmail = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">High Priority Emails</h2>
      <AnimatePresence>
        {emails.map((email) => (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-md mb-2"
          >
            <div>
              <p className="text-gray-800 font-medium">{email.subject}</p>
              <p className="text-sm text-gray-500">From: {email.sender}</p>
            </div>
            <button
              onClick={() => removeEmail(email.id)}
              className="p-2 text-orange-500 hover:text-orange-600 transition-colors"
              aria-label="Mark as responded"
            >
              <Mail size={20} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const DraftCounterButton = ({ draftsLeft, isPro }: { draftsLeft: number, isPro: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter();

  if (isPro) return null

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => router.push('/pro')}
            size="sm"
            className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-primary-foreground hover:bg-primary"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <FileText className="h-4 w-4" />
            <span>{draftsLeft}/100 drafts left</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="w-64 p-4">
          <p className="text-sm font-semibold mb-2">Upgrade to Premium</p>
          <p className="text-xs">Get unlimited drafts and more features with our Premium plan!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const Stat = ({ icon, value, label }: StatProps) => (
  <div className="flex flex-col items-center">
    <div className="rounded-full bg-orange-100 p-3 mb-2">
      {icon}
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
)

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

const TopRecipients = ({ recipients, maxDrafts }: { recipients: [string, number][], maxDrafts: number }) => (
  <div className="bg-white rounded-lg shadow-md p-8 col-span-2">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Top Recipients</h3>
      <ul className="space-y-6">
        {recipients.map((recipient: [string, number], index: number) => (
          <motion.li
            key={index}
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{recipient[0]}</p>
              <div className="mt-1 relative">
                <div className="h-2 bg-gray-200 rounded-full">
                  <motion.div
                    className="absolute left-0 top-0 h-2 bg-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(recipient[1] / maxDrafts) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-semibold text-gray-900">{recipient[1]}</p>
              <p className="text-xs text-gray-500">drafts</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
)
const TopTopics = ({ topics, maxTopics }: { topics: [string, number][], maxTopics: number }) => (
  <div className="bg-white rounded-lg shadow-md p-8 col-span-2">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Top Topics</h3>
      <ul className="space-y-6">
        {topics.map((topic: [string, number], index: number) => (
          <motion.li
            key={index}
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{topic[0]}</p>
              <div className="mt-1 relative">
                <div className="h-2 bg-gray-200 rounded-full">
                  <motion.div
                    className="absolute left-0 top-0 h-2 bg-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(topic[1] / maxTopics) * 100}%` }}
                    transition={{ duration: 0.5, delay: topic[1] * 0.1 }}
                  />
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-semibold text-gray-900">{topic[1]}</p>
              <p className="text-xs text-gray-500">drafts</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
)

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showGmailAuth, setShowGmailAuth] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const [numberOfDrafts, setNumberOfDrafts] = useState(0);
  const [topRecipients, setTopRecipients] = useState<[string, number][]>([]);
  const [topTopics, setTopTopics] = useState<[string, number][]>([]);
  const [recentDrafts, setRecentDrafts] = useState<Draft[]>([]);
  const [numberOfMessages, setNumberOfMessages] = useState(0);
  const [averageWords, setAverageWords] = useState(0);
  const [remainingDrafts, setRemainingDrafts] = useState(0);
  const [highPriorityEmails, setHighPriorityEmails] = useState<HighPriorityEmail[]>([]);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [sendingDraftId, setSendingDraftId] = useState<string | null>(null);

  const [isPro, setIsPro] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrafts = useMemo(() => {
    if (!searchQuery.trim()) return recentDrafts;

    return recentDrafts.filter(draft => 
      draft.draft_subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.email_body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.draft_body.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentDrafts, searchQuery]);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    const token = localStorage.getItem('token')
    const body = {
      subject: subject,
      gmail_id: editingDraft?.gmail_id,
      database_id: editingDraft?.database_id,
      body: content,
      to: editingDraft?.recipient_email
    }
    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/account/emails/save-draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setSubject(subject)
      setContent(content)
      setEditingDraft(null)
      setShowSaveConfirmation(true)
      setTimeout(() => setShowSaveConfirmation(false), 3000)
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  }

  const handleSendDraft = async (draft: Draft) => {
    setSendingDraftId(draft.database_id);
    const token = localStorage.getItem('token');
    const body = {
      gmail_id: draft.gmail_id,
      database_id: draft.database_id,
    };
  
    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/account/emails/send-draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send draft');
      }
  
      setRecentDrafts((prevDrafts) => 
        prevDrafts.filter((item) => item.database_id !== draft.database_id)
      );
  
      setShowSendConfirmation(true);
      setTimeout(() => setShowSendConfirmation(false), 3000);
    } catch (error) {
      console.error('Error sending draft:', error);
    } finally {
      setSendingDraftId(null);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token')
      try {
        const [draftsResponse, recipientsResponse, topicsResponse, recentDraftsResponse, messagesResponse, averageWordsResponse, remainingDraftsResponse, subscriptionResponse, highPriorityEmailsResponse] = await Promise.all([
          fetch('https://api.notaic.site/account/drafts/count', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/emails/top-senders', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/emails/common-topics', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/drafts/recent', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/messages/count', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/drafts/average-words', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/remaining-drafts', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/subscription-status', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://api.notaic.site/account/emails/high-priority', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);

        const draftsData = await draftsResponse.json();
        const recipientsData = await recipientsResponse.json();
        const topicsData = await topicsResponse.json();
        const recentDraftsData = await recentDraftsResponse.json();
        const messagesData = await messagesResponse.json();
        const averageWordsData = await averageWordsResponse.json();
        const remainingDraftsData = await remainingDraftsResponse.json();
        const subscriptionData = await subscriptionResponse.json();
        const highPriorityEmailsData = await highPriorityEmailsResponse.json();

        setNumberOfDrafts(draftsData.drafts_count);
        setTopRecipients(recipientsData.top_senders);
        setTopTopics(topicsData.common_topics);
        setRecentDrafts(recentDraftsData.recent_drafts);
        setNumberOfMessages(messagesData.messages_sent);
        setAverageWords(averageWordsData.average_words);
        setRemainingDrafts(remainingDraftsData.remaining_drafts);
        setHighPriorityEmails(highPriorityEmailsData.highest_priority);
        setIsPro(subscriptionData.subscription_status);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    fetchDashboardData();
  }, []);

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
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/not-found')
      return
    }
  
    const authenticateUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication failed')
      }
      
      try {
        const api_url = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${api_url}/auth/authenticate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
  
        if (!response.ok) {
          throw new Error('Authentication failed')
        }
  
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
  
        setIsAuthenticated(true)
        if (data.is_google_authorized) {
          setShowGmailAuth(false)
        } else {
          setShowGmailAuth(true)
        }

        if (data.onboarding_completed) {
          setShowOnboarding(false)
        } else {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/not-found')
      }
    }
  
    authenticateUser()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    router.push('/signin');
  }

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown)
  }

  const handleEditDraft = (draft: Draft) => {
    setSubject(draft.draft_subject);
    setContent(draft.draft_body);
    setEditingDraft(draft);
  }

  const handleGmailAuth = async () => {
    const accessToken = localStorage.getItem('token');
    
    if (!accessToken) {
      console.error('No access token found');
      return;
    }
  
    try {
      const api_url = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${api_url}/auth/google-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to initiate Google Auth');
      }
  
      const data = await response.json();
      window.location.href = data.authUrl;
  
    } catch (error) {
      console.error('Error initiating Google Auth:', error);
    }
  
    setShowGmailAuth(false);
  };

  if (!isAuthenticated) {
    return null
  }

  const maxDrafts = Math.max(...topRecipients.map(recipient => recipient[1]));
  const maxTopics = Math.max(...topTopics.map(topic => topic[1]));

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
          {!isPro && <DraftCounterButton draftsLeft={remainingDrafts} isPro={isPro} />}
            <div className="relative">
              <input
                type="text"
                placeholder="Search drafts"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                router.push('/');
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

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-auto">
        <div className="min-w-[640px]">
          <AnimatePresence>
            {showOnboarding && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-white border-l-4 border-orange-500 text-gray-700 p-4 mb-8 rounded-md shadow-md"
              >
                <p className="font-bold mb-2">Welcome to Notaic!</p>
                <p className="mb-4">Let&apos;s get you set up. Please answer a few questions to get you started.</p>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Complete Onboarding
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showGmailAuth && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-white border-l-4 border-orange-500 text-gray-700 p-4 mb-8 rounded-md shadow-md"
              >
                <p className="font-bold mb-2">Grant Gmail Access</p>
                <p className="mb-4">Please grant us access to read and create drafts in your Gmail account.</p>
                <button
                  onClick={handleGmailAuth}
                  className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                  Authenticate with Google
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="mb-8">
            <ul className="flex space-x-4 border-b border-gray-200">
              {[
                { id: 'overview', label: 'Overview', icon: Layout },
                { id: 'drafts', label: 'Drafts', icon: FileText },
                { id: 'tasks', label: 'Tasks & Deadlines', icon: Bar },
              ].map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm rounded-t-md ${
                      activeTab === id
                        ? 'bg-white text-orange-500 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                      <div className="bg-white p-6 rounded-lg shadow-md col-span-3">
                      <Card className="w-full px-10">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <Stat 
                              icon={<FileText className="h-10 w-10 text-orange-500" />}
                              value={numberOfDrafts}
                              label="Total Drafts"
                            />
                            <Stat 
                              icon={<Mail className="h-10 w-10 text-orange-500" />}
                              value={averageWords}
                              label="Avg. Word Length of Drafts"
                            />
                            <Stat 
                              icon={<Send className="h-10 w-10 text-orange-500" />}
                              value={numberOfMessages}
                              label="Drafts Sent"
                            />
                          </div>
                        </CardContent>
                      </Card>
                      </div>
                  <div className="bg-white p-6 rounded-lg shadow-md col-span-3">
                      <TopRecipients recipients={topRecipients} maxDrafts={maxDrafts} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md col-span-3">
                      <TopTopics topics={topTopics} maxTopics={maxTopics} />
                  </div>
              </motion.div>
            )}

            {activeTab === 'drafts' && (
              <motion.div
                key="drafts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredDrafts.map((draft) => (
                        <motion.tr
                          key={draft.database_id}
                          initial={{ opacity: 1, height: "auto" }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{draft.draft_subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{draft.draft_body.split('T')[0]}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditDraft(draft)}
                              className="text-orange-600 hover:text-orange-900 mr-4"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleSendDraft(draft)}
                              disabled={sendingDraftId === draft.database_id}
                              className="text-red-600 hover:text-red-900 relative"
                            >
                              {sendingDraftId === draft.database_id ? (
                                <svg
                                  className="animate-spin h-5 w-5 text-red-600"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <Send size={18} />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md relative"
              >
                {!isPro && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Premium Feature</h3>
                      <p className="text-gray-600 mb-4">Upgrade to Pro to access detailed tasks and deadlines extracted from your emails.</p>
                      <button
                        onClick={() => router.push('/pro')}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  <TodoListCard isPro={isPro} recentDrafts={recentDrafts} />
                  <HighPriorityEmailsCard isPro={isPro} highPriorityEmails={highPriorityEmails} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isPro && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push('/pro')}
                className="flex items-center bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-orange-600 shadow-lg hover:shadow-xl"
              >
                <ArrowUpCircle className="mr-2 h-5 w-5" />
                Upgrade to Pro
              </button>
            </div>
          )}
          <AnimatePresence>
          {editingDraft && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Original Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>From:</strong> {editingDraft.recipient_email}</p>
                        <p><strong>Subject:</strong> {editingDraft.recipient_subject}</p>
                        <p className="mt-4">
                          {editingDraft.email_body}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Reply</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input 
                            id="subject" 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="content">Message</Label>
                          <Textarea 
                            id="content" 
                            rows={10} 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your reply here..."
                          />
                        </div>
                      </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setEditingDraft(null)}>Cancel</Button>
                      <Button 
                        onClick={handleSaveDraft} 
                        disabled={isSavingDraft}
                        className="relative"
                      >
                        {isSavingDraft ? (
                          <>
                            <span className="opacity-0">Save Draft</span>
                            <svg 
                              className="animate-spin h-5 w-5 text-white absolute inset-0 m-auto" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                              ></circle>
                              <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </>
                        ) : (
                          'Save Draft'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSaveConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg"
            >
              Changes saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSendConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg"
            >
              Email sent successfully!
            </motion.div>
          )}
        </AnimatePresence>
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
