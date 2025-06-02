"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { GetStartedPage } from "@/components/get-started"

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await axios.post('https://api.notaic.site/auth/authenticate', null, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.data.valid) {
            router.push('/dashboard')
          } else {
            localStorage.removeItem('token')
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Error verifying token:', error)
          localStorage.removeItem('token')
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    checkToken()
  }, [router])

  if (isLoading) {
    return null // Or return a loading spinner component
  }

  return <GetStartedPage />
}
