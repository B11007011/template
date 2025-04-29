"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Trash2, AlertCircle, Clock, CheckCircle, RefreshCw, Globe, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import ApiDebug from "@/components/api-debug"
import api from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  
  // New state for the build dialog form
  const [buildDialogOpen, setBuildDialogOpen] = useState(false)
  const [newBuildUrl, setNewBuildUrl] = useState("")
  const [newAppName, setNewAppName] = useState("")

  // Debug monitor for dialog state
  useEffect(() => {
    console.log("Dialog state changed:", buildDialogOpen);
  }, [buildDialogOpen]);

  // Fetch builds on component mount and set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchBuilds();
    
    // No auto-refresh interval - only fetch when user requests it
  }, []);

  // Fetch all builds from the API
  const fetchBuilds = async () => {
    setLoading(true)
    try {
      console.log('Fetching builds from API...');
      const response = await api.builds.getAll()
      console.log('API Response:', response) // Debug log
      
      // Extract the builds array from the response
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} builds`);
        setBuilds(response.data)
      } else {
        console.error('Invalid API response format:', response)
        console.error('Expected response.data to be an array but got:', 
          response?.data ? typeof response.data : 'undefined or null');
        setBuilds([]) // Set to empty array to avoid mapping errors
        setError('Received invalid data format from the API.')
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching builds:', err)
      console.error('Error details:', err instanceof Error ? err.message : String(err));
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

  // Function to open the build dialog
  const openBuildDialog = () => {
    // Reset form fields
    setNewBuildUrl("")
    setNewAppName("")
    // Open the dialog
    console.log("Opening build dialog...");
    setBuildDialogOpen(true);
    
    // Force dialog to open with a small delay if needed
    setTimeout(() => {
      if (!buildDialogOpen) {
        console.log("Forcing dialog to open...");
        setBuildDialogOpen(true);
      }
    }, 100);
  }

  // Helper function to get app name from URL if none is provided
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

  // Trigger a new build
  const triggerBuild = async () => {
    console.log("triggerBuild called with URL:", newBuildUrl);
    
    // Form validation
    if (!newBuildUrl) {
      console.log("URL validation failed - empty URL");
      toast({
        title: "Website URL Required",
        description: "Please enter a valid website URL",
        variant: "destructive"
      })
      return
    }

    // Use provided app name or generate from URL
    const finalAppName = newAppName || getAppNameFromUrl(newBuildUrl)
    console.log("Using app name:", finalAppName);
    
    setTriggeringBuild(true)
    setBuildDialogOpen(false) // Close the dialog
    
    try {
      console.log("Calling API to create build...");
      const response = await api.builds.createBuild({ 
        appName: finalAppName,
        webviewUrl: newBuildUrl
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
        description: "Failed to trigger build: " + (err instanceof Error ? err.message : String(err)),
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
            type="button"
            onClick={() => {
              console.log("New Build button clicked");
              openBuildDialog();
            }}
            disabled={triggeringBuild}
          >
            {triggeringBuild ? "Creating..." : "New Build"}
          </Button>
        </div>
      </div>

      {/* New Build Dialog */}
      <Dialog open={buildDialogOpen} onOpenChange={setBuildDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New App Build</DialogTitle>
            <DialogDescription>
              Enter the website URL you want to convert to a mobile app.
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              triggerBuild();
            }}
            className="space-y-4"
          >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website-url" className="text-right">
                Website URL
              </Label>
              <div className="col-span-3 relative">
                <Globe className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="website-url"
                  placeholder="https://example.com"
                  className="pl-8"
                  value={newBuildUrl}
                  onChange={(e) => setNewBuildUrl(e.target.value)}
                    required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="app-name" className="text-right">
                App Name
              </Label>
              <div className="col-span-3 relative">
                <Type className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="app-name"
                  placeholder="Optional (will be generated from URL)"
                  className="pl-8"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
                type="button"
              onClick={() => setBuildDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#8c52ff] hover:bg-[#7a45e0]"
                type="submit"
              disabled={triggeringBuild}
            >
              {triggeringBuild ? "Creating..." : "Create Build"}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fallback dialog in case the Dialog component isn't working */}
      {buildDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New App Build</h2>
            <p className="text-gray-500 mb-4">Enter the website URL you want to convert to a mobile app.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              triggerBuild();
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fb-website-url" className="font-medium">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      id="fb-website-url"
                      placeholder="https://example.com"
                      className="w-full pl-8 p-2 border rounded"
                      value={newBuildUrl}
                      onChange={(e) => setNewBuildUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="fb-app-name" className="font-medium">App Name</label>
                  <div className="relative">
                    <Type className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      id="fb-app-name"
                      placeholder="Optional (will be generated from URL)"
                      className="w-full pl-8 p-2 border rounded"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                    onClick={() => setBuildDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#8c52ff] hover:bg-[#7a45e0] text-white rounded"
                    disabled={triggeringBuild}
                  >
                    {triggeringBuild ? "Creating..." : "Create Build"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <Button 
                type="button"
                onClick={() => {
                  console.log("Create First Build button clicked");
                  openBuildDialog();
                }} 
                className="bg-[#8c52ff] hover:bg-[#7a45e0] mb-8"
              >
                Create Your First Build
              </Button>
              
              {/* Debug Section */}
              <div className="w-full mt-6 border-t pt-6 text-left">
                <h4 className="text-left text-lg font-medium mb-4">Build System Status</h4>
                <div className="bg-gray-100 p-4 rounded-md text-sm">
                  <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
                  <p><strong>Status:</strong> {error ? 'Error fetching builds' : 'No builds found'}</p>
                  <p><strong>Troubleshooting:</strong></p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Make sure the backend server is running (port 5000)</li>
                    <li>Check that you're logged in correctly</li>
                    <li>Try creating a new build using the button above</li>
                    <li>Check browser console for API errors</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
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