'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {LinkedinIcon, FacebookIcon, TwitterIcon, LinkIcon } from 'lucide-react'
import { SiWhatsapp as WhatsappIcon } from '@icons-pack/react-simple-icons'

const images = [
  {
    id: 1,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f0f0f0" />
        <path d="M20,50 Q50,20 80,50 Q50,80 20,50" fill="none" stroke="#f97316" strokeWidth="5" />
        <circle cx="50" cy="50" r="10" fill="#f97316" />
        <path d="M50,40 L50,30 M60,50 L70,50 M50,60 L50,70 M40,50 L30,50" stroke="#f97316" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 2,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f0f0f0" />
        <path d="M30,20 L70,20 L70,80 L30,80 Z" fill="none" stroke="#f97316" strokeWidth="5" />
        <path d="M40,30 L60,30 M40,45 L60,45 M40,60 L60,60" stroke="#f97316" strokeWidth="3" />
        <circle cx="50" cy="75" r="3" fill="#f97316" />
      </svg>
    )
  },
  {
    id: 3,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f0f0f0" />
        <path d="M20,30 C40,10 60,10 80,30 C60,50 40,50 20,30" fill="none" stroke="#f97316" strokeWidth="5" />
        <path d="M20,50 C40,30 60,30 80,50 C60,70 40,70 20,50" fill="none" stroke="#f97316" strokeWidth="5" />
        <path d="M20,70 C40,50 60,50 80,70 C60,90 40,90 20,70" fill="none" stroke="#f97316" strokeWidth="5" />
      </svg>
    )
  },
  {
    id: 4,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f0f0f0" />
        <path d="M30,20 L70,20 L70,70 L50,90 L30,70 Z" fill="none" stroke="#f97316" strokeWidth="5" />
        <path d="M40,40 L60,40 M40,55 L60,55" stroke="#f97316" strokeWidth="3" />
        <circle cx="50" cy="75" r="3" fill="#f97316" />
      </svg>
    )
  },
  {
    id: 5,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f0f0f0" />
        <path d="M20,50 Q35,20 50,50 Q65,80 80,50" fill="none" stroke="#f97316" strokeWidth="5" />
        <circle cx="20" cy="50" r="5" fill="#f97316" />
        <circle cx="50" cy="50" r="5" fill="#f97316" />
        <circle cx="80" cy="50" r="5" fill="#f97316" />
      </svg>
    )
  },
  {
    id: 6,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f0f0f0" />
        <path d="M30,30 L70,30 L70,70 L30,70 Z" fill="none" stroke="#f97316" strokeWidth="5" />
        <path d="M30,30 L50,50 L70,30 M30,70 L50,50 L70,70" stroke="#f97316" strokeWidth="3" />
      </svg>
    )
  }
]

export function ReferralPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[#f97316]">
        <div className="h-full bg-[#ea580c] w-[85%]" />
      </div>

      <nav className="p-4">
        <Link href="/example" className="text-gray-600 hover:text-gray-800 text-sm">
          ← Go back
        </Link>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-center">Get 10 more free Notaic replies by sharing</h1>
        <p className="text-sm text-gray-600 mb-8 text-center">
          For every friend who signs up using your link, you get 10 more free Notaic replies.
        </p>

        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">
            <span className="text-[#f97316]">Step 1:</span> Select your favorite image to share and help spread the word
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {images.map((image) => (
              <button
                key={image.id}
                className={`p-2 border-2 rounded-lg transition-all ${
                  selectedImage === image.id 
                    ? 'border-[#f97316] bg-[#fff7ed] shadow-lg' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => setSelectedImage(image.id)}
              >
                <div className="w-16 h-16">
                  {image.svg}
                </div>
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-4">
            <span className="text-[#f97316]">Step 2:</span> Share your referral link
          </h2>
          <div className="flex justify-center space-x-4 mb-8">
            <Button variant="outline" size="sm" className="p-1">
              <WhatsappIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-1">
              <LinkedinIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-1">
              <FacebookIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-1">
              <TwitterIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-1">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-center">
            <span className="text-[#f97316]">Step 3:</span> Start using Notaic
          </h2>
          <div className="flex justify-center">
            <Button asChild className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3 rounded-full text-lg font-semibold">
              <Link href="/onboarding">Get started</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="p-4">
        <div className="text-xs text-gray-500">MADE BY NOTAIC</div>
      </footer>
    </div>
  )
}