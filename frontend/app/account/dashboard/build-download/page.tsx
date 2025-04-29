"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Trash2, AlertCircle, Clock, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import ApiDebug from "@/components/api-debug"
import api from "@/lib/api"

// Types
interface Build {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  appName: string;
  webviewUrl: string;
  apkUrl?: string;
  aabUrl?: string;
  buildPath?: string;
  error?: string;
}

export default function BuildDownloadPage() {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [triggeringBuild, setTriggeringBuild] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch builds on component mount
  useEffect(() => {
    fetchBuilds()
  }, [])

  // Fetch all builds from the API
  const fetchBuilds = async () => {
    setLoading(true)
    try {
      const response = await api.builds.getAll()
      console.log('API Response:', response) // Debug log
      
      // Extract the builds array from the response
      if (response && response.data && Array.isArray(response.data)) {
        setBuilds(response.data)
      } else {
        console.error('Invalid API response format:', response)
        setBuilds([]) // Set to empty array to avoid mapping errors
        setError('Received invalid data format from the API.')
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching builds:', err)
      setBuilds([]) // Set to empty array to avoid mapping errors
      setError('Failed to load builds. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load builds",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete a build
  const deleteBuild = async (buildId: string) => {
    if (!confirm('Are you sure you want to delete this build?')) {
      return
    }

    setDeleting(buildId)
    try {
      await api.builds.deleteBuild(buildId)
      // Remove the build from state
      setBuilds((prevBuilds) => 
        prevBuilds.filter(build => build.id !== buildId)
      )
      toast({
        title: "Success",
        description: "Build deleted successfully",
      })
    } catch (err) {
      console.error('Error deleting build:', err)
      toast({
        title: "Error",
        description: "Failed to delete build",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  // Trigger a new build
  const triggerBuild = async () => {
    setTriggeringBuild(true)
    try {
      const response = await api.builds.createBuild({ 
        appName: 'My Website',
        webviewUrl: 'https://example.com'
      })
      
      // Log the response to help with debugging
      console.log('Build trigger response:', response)
      
      toast({
        title: "Success",
        description: "Build triggered successfully",
      })
      // Refresh the builds list
      fetchBuilds()
    } catch (err) {
      console.error('Error triggering build:', err)
      toast({
        title: "Error",
        description: "Failed to trigger build",
        variant: "destructive",
      })
    } finally {
      setTriggeringBuild(false)
    }
  }

  // Download a build
  const downloadBuild = async (buildId: string) => {
    try {
      const response = await api.builds.downloadBuild(buildId)
      
      // Create a blob from the response
      const blob = await response.blob()
      
      // Create a link element and trigger the download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `build-${buildId}.zip`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Success",
        description: "Download started",
      })
    } catch (err) {
      console.error('Error downloading build:', err)
      toast({
        title: "Error",
        description: "Failed to download build",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/account/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">App Builds</h1>
          <p className="text-gray-500 mt-1">Manage and download your app builds</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchBuilds}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="bg-[#8c52ff] hover:bg-[#7a45e0]"
            onClick={triggerBuild}
          >
            New Build
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center flex-col p-6 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to Load Builds</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={fetchBuilds} className="mb-6">Try Again</Button>
              
              {/* API Debug Component */}
              <div className="w-full mt-8 border-t pt-6">
                <h4 className="text-left text-lg font-medium mb-4">API Connection Troubleshooting</h4>
                <ApiDebug />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : builds.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center flex-col p-6 text-center">
              <Download className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Builds Available</h3>
              <p className="text-gray-500 mb-4">You haven't created any builds yet.</p>
              <Button onClick={triggerBuild} className="bg-[#8c52ff] hover:bg-[#7a45e0]">
                Create Your First Build
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {builds.map(build => (
            <Card key={build.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {build.appName}
                      <Badge 
                        className={`ml-2 ${
                          build.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : build.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {build.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {build.createdAt && (
                        <>Created {format(new Date(build.createdAt), 'PPp')}</>
                      )}
                    </CardDescription>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteBuild(build.id)}
                          disabled={deleting === build.id}
                        >
                          {deleting === build.id ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete build</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">URL</h3>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{build.webviewUrl}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Status</h3>
                          <p className="text-xs text-gray-500">
                            {build.status === 'completed' ? (
                              <>Completed {build.completedAt && format(new Date(build.completedAt), 'PPp')}</>
                            ) : build.status === 'pending' ? (
                              <>Build in progress</>
                            ) : (
                              <>Failed: {build.error || 'Unknown error'}</>
                            )}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          build.status === 'completed' 
                            ? 'bg-green-100' 
                            : build.status === 'pending' 
                              ? 'bg-yellow-100' 
                              : 'bg-red-100'
                        }`}>
                          {build.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : build.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Downloads</h3>
                          <div className="flex flex-col gap-2 mt-2">
                            {build.status === 'completed' ? (
                              <>
                                {build.apkUrl && (
                                  <a 
                                    href={build.apkUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded inline-flex items-center hover:bg-green-200"
                                  >
                                    <Download className="h-3 w-3 mr-1" /> APK
                                  </a>
                                )}
                                {build.aabUrl && (
                                  <a 
                                    href={build.aabUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded inline-flex items-center hover:bg-blue-200"
                                  >
                                    <Download className="h-3 w-3 mr-1" /> AAB
                                  </a>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {build.status === 'pending' ? 'Build in progress...' : 'Build failed'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Download className="h-5 w-5 text-purple-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 