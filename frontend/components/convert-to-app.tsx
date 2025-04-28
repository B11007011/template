"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ConvertToApp() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConvertToApp = async () => {
    // Validate the URL
    if (!websiteUrl) {
      toast({
        title: "Please enter a website URL",
        description: "Enter the URL of the website you want to convert to an app.",
        variant: "destructive"
      })
      return
    }

    // Add protocol if missing
    let url = websiteUrl
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    // Show loading state
    setIsLoading(true)

    try {
      // Make API call to trigger build
      const response = await fetch(`${API_URL}/builds/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appName: getAppNameFromUrl(url),
          webviewUrl: url
        })
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Show success message
      toast({
        title: "Build Started",
        description: "Your app build has been started successfully. You'll be redirected to the builds page.",
      })

      // Redirect to builds page
      setTimeout(() => {
        router.push('/dashboard/build-download')
      }, 1500)
    } catch (error) {
      console.error('Error triggering build:', error)
      toast({
        title: "Error",
        description: "There was an error starting your app build. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get an app name from the URL
  const getAppNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch (e) {
      // If URL parsing fails, just return the input as is
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
      <div className="relative w-full">
        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-20 py-6 w-full"
          placeholder="Enter your Website Address"
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button 
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 bg-[#8c52ff] hover:bg-[#7a45e0] w-full sm:w-auto"
        onClick={handleConvertToApp}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Convert to App"}
        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  )
} 