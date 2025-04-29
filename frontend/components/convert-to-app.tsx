"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Globe, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/lib/api"

export default function ConvertToApp() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [appName, setAppName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, isConfigured } = useAuth();

  const handleConvertToApp = async () => {
    // Check authentication first
    if (!user) {
      router.push("/account/login");
      return;
    }

    // Form validation
    if (!websiteUrl) {
      toast({
        title: "Please enter a website URL",
        description: "Enter the URL of the website you want to convert to an app.",
        variant: "destructive"
      })
      return
    }

    // Use either provided app name or generate from URL
    const finalAppName = appName || getAppNameFromUrl(websiteUrl)
    
    // Show loading state
    setIsLoading(true)

    try {
      // Make API call to trigger build
      const response = await api.builds.createBuild({
        appName: finalAppName,
        webviewUrl: websiteUrl
      })
      
      console.log('Build triggered successfully:', response)

      // Show success message with build ID
      toast({
        title: "Build Started",
        description: `Your app build has been started successfully.`,
      })

      // Redirect to build success page with the build ID
      if (response && response.data && response.data.id) {
        router.push(`/account/dashboard/build-success?id=${response.data.id}`)
      } else {
        // Fallback to builds page if we don't have a build ID
        router.push('/account/dashboard/build-download')
      }
    } catch (error) {
      console.error('Error triggering build:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error starting your app build. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get an app name from the URL
  const getAppNameFromUrl = (url: string): string => {
    try {
      // Add protocol if missing for URL parsing
      let urlStr = url
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr
      }
      
      const urlObj = new URL(urlStr)
      // Extract domain without www and TLD
      const domain = urlObj.hostname.replace('www.', '')
      // Capitalize first letter of each part
      return domain.split('.')[0]
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    } catch (e) {
      // If URL parsing fails, just return a default name
      return "My App"
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      <div className="flex flex-col gap-2">
        <Label htmlFor="website-url">Website URL</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="website-url"
            className="pl-10"
            placeholder="https://example.com"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground">Enter the full URL of the website you want to convert</p>
      </div>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="app-name">App Name (Optional)</Label>
        <div className="relative">
          <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="app-name"
            className="pl-10"
            placeholder="My Website App"
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground">Leave blank to auto-generate from URL</p>
      </div>
      
      <Button 
        className="w-full mt-2 bg-[#8c52ff] hover:bg-[#7a45e0]"
        onClick={handleConvertToApp}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Convert to App"}
        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  )
} 