import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckIcon, LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'

export function UpgradePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-orange-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <Link href="/" className="text-xl font-semibold">Notaic</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="text-orange-500 border-orange-500">
              10/100 Drafts left
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <Link href="/dashboard">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <Link href="/signin">Log out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
              <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14.75c2.67 0 8 1.33 8 4v1.25H4v-1.25c0-2.67 5.33-4 8-4zm0-9.5a4 4 0 110 8 4 4 0 010-8z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Subscribe to Notaic Pro</CardTitle>
            <p className="text-gray-500">Unlimited AI-powered email drafts</p>
          </CardHeader>
          <CardContent>
            <div className="text-center text-3xl font-bold mb-6">$20<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>Unlimited AI-generated email drafts</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>Priority email processing</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>Advanced customization options</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>24/7 premium support</span>
              </li>
            </ul>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Subscribe Now
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Don&apos;t want to subscribe? <Link href="#" className="text-orange-500 hover:underline">Continue with free plan</Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}