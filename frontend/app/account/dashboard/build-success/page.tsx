"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import BuildStatusIndicator from "@/components/build-status-indicator"
import { toast } from "@/components/ui/use-toast"

export default function BuildSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const buildId = searchParams.get('id')
  
  useEffect(() => {
    // Redirect to builds page if no buildId is provided
    if (!buildId) {
      toast({
        title: "Missing Build ID",
        description: "No build ID was provided. Redirecting to builds page.",
        variant: "destructive"
      })
      router.push('/account/dashboard/build-download')
    }
  }, [buildId, router])
  
  // Handle status change
  const handleStatusChange = (status: string) => {
    console.log(`Build status changed to: ${status}`)
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/account/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2 mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <Link href="/account/dashboard/build-download" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
          <Download className="mr-2 h-4 w-4" />
          All Builds
        </Link>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Build In Progress</CardTitle>
            <CardDescription>
              Your app is being built. This process typically takes 3-5 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {buildId && (
                <BuildStatusIndicator 
                  buildId={buildId} 
                  initialStatus="pending"
                  autoRefresh={true}
                  onStatusChange={handleStatusChange}
                />
              )}
              
              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-sm text-yellow-800">
                <p className="font-medium mb-1">While you wait:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You can leave this page and come back later</li>
                  <li>Builds are saved to your account</li>
                  <li>You'll receive a notification when your build is ready</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            <Button variant="outline" onClick={() => router.push('/account/dashboard')}>
              Return to Dashboard
            </Button>
            <Button 
              className="bg-[#8c52ff] hover:bg-[#7a45e0]"
              onClick={() => router.push('/account/dashboard/build-download')}
            >
              View All Builds
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#8c52ff] text-white flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Build Process</h3>
                  <p className="text-sm text-gray-600">
                    Our CI/CD pipeline is converting your website into a mobile app, 
                    configuring the app settings based on your inputs.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#8c52ff] text-white flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Download Ready</h3>
                  <p className="text-sm text-gray-600">
                    Once completed, you'll be able to download both APK (for direct installation) 
                    and AAB (for Play Store publishing) files.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#8c52ff] text-white flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Publish to Store</h3>
                  <p className="text-sm text-gray-600">
                    Use the AAB file to publish your app to the Google Play Store using your 
                    developer account.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Link 
              href="https://play.google.com/console/about/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#8c52ff] text-sm font-medium"
            >
              Learn about Google Play Console
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 