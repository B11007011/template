"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Trash2, AlertCircle, Clock, CheckCircle, RefreshCw, Globe, Type, X, AlertTriangle, Inbox, MoreHorizontal, Calendar, ExternalLink, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import ApiDebug from "@/components/api-debug"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import UserAvatar from "@/components/UserAvatar"
import MobileSidebar from "@/components/mobile-sidebar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import QRCodeModal from "@/components/QRCodeModal"

// Types
interface Build {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
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
  const { toast } = useToast()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [triggeringBuild, setTriggeringBuild] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  
  // QR Code Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrModalData, setQrModalData] = useState<{
    url: string;
    title: string;
    buildId: string;
    fileType: 'apk' | 'aab';
  } | null>(null)
  
  // New state for the build dialog form
  const [buildDialogOpen, setBuildDialogOpen] = useState(false)
  const [newBuildUrl, setNewBuildUrl] = useState("")
  const [newAppName, setNewAppName] = useState("")
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState<{
    buildId: string;
    appName: string;
    timestamp: string;
  } | null>(null)
  
  const router = useRouter()
  
  // Debug monitor for dialog state
  useEffect(() => {
    console.log("Dialog state changed:", buildDialogOpen);
  }, [buildDialogOpen]);
  
  // Effect to auto-dismiss success message after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Delete a build
  const deleteBuild = async (buildId: string) => {
    // Enhanced confirmation with build details
    const buildToDelete = builds.find(build => build.id === buildId);
    
    if (!buildToDelete) {
      toast({
        title: "Error",
        description: "Build not found in current list",
        variant: "destructive"
      });
      return;
    }
    
    // Detailed confirmation message
    if (!confirm(`Are you sure you want to delete this build?\n\nApp: ${buildToDelete.appName}\nStatus: ${buildToDelete.status}\nBuild ID: ${buildId}\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeleting(buildId);
    
    // Show toast that deletion is in progress
    toast({
      title: "Deleting Build...",
      description: `Removing build for ${buildToDelete.appName}`,
    });
    
    try {
      // Special case for the static Firebase Storage build
      if (buildId === '14709933897') {
        console.log('Special case for the Firebase Storage build');
        // This build is handled specially by the server
      }
      
      // Make API request to delete build
      console.log(`Making API request to delete build: ${buildId}`);
      await api.builds.deleteBuild(buildId);
      
      // Remove the build from state
      setBuilds((prevBuilds) => 
        prevBuilds.filter(build => build.id !== buildId)
      );
      
      // Show success message
      toast({
        title: "Build Deleted",
        description: `Successfully deleted build for ${buildToDelete.appName}`,
      });
    } catch (err) {
      console.error('Error deleting build:', err);
      
      // Helper function to check if error has status property
      const isApiError = (error: unknown): error is { status: number; message: string } => {
        return typeof error === 'object' && 
               error !== null && 
               'status' in error && 
               typeof (error as any).status === 'number';
      };
      
      // Log detailed error info
      if (isApiError(err)) {
        console.error(`API Error: Status ${err.status}, Message: ${err.message}`);
      }
      
      // Handle 404 errors specially
      if (isApiError(err) && err.status === 404) {
        console.log('Build not found on server, removing from UI anyway');
        // If the build doesn't exist on the server but is in our UI, still remove it from UI
        setBuilds((prevBuilds) => 
          prevBuilds.filter(build => build.id !== buildId)
        );
        
        toast({
          title: "Build Deleted",
          description: `The build was removed from your list. (Note: It may have been already deleted on the server)`,
        });
        return;
      }
      
      // Show detailed error message for other errors
      toast({
        title: "Delete Failed",
        description: `Failed to delete build: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
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
      // Show initial notification that build is being triggered
      toast({
        title: "Triggering Build...",
        description: `Creating app for ${finalAppName} (${newBuildUrl})`,
      });
      
      const response = await api.builds.createBuild({ 
        appName: finalAppName,
        webviewUrl: newBuildUrl
      })
      
      // Log the response to help with debugging
      console.log('Build trigger response:', response)
      
      // Show success notification with more details
      toast({
        title: "Build Triggered Successfully",
        description: `Build ID: ${response.data?.id || 'Unknown'} - ${finalAppName}`,
        variant: "default",
      })
      
      // Add build to state immediately without refetching
      if (response && response.data && response.data.id) {
        // Create a new build object
        const newBuild: Build = {
          id: response.data.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          appName: finalAppName,
          webviewUrl: newBuildUrl
        };
        
        // Add the new build to the beginning of the builds list
        setBuilds(prevBuilds => [newBuild, ...prevBuilds]);
        
        // Show a prominent notification
        setSuccessMessage({
          buildId: response.data.id,
          appName: finalAppName,
          timestamp: new Date().toISOString()
        });
      } else {
        // If we don't get a proper response, still refresh the builds list
        fetchBuilds();
      }
    } catch (err) {
      console.error('Error triggering build:', err);
      // Show detailed error notification
      toast({
        title: "Build Trigger Failed",
        description: "Failed to trigger build: " + (err instanceof Error ? err.message : String(err)),
        variant: "destructive",
      })
    } finally {
      setTriggeringBuild(false)
    }
  }

  // Download a build
  const downloadBuild = async (buildId: string, fileType: 'apk' | 'aab' = 'apk') => {
    try {
      setDownloading(buildId);
      
      // Always use Firebase Storage URL for all builds
      const url = `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${buildId}/app.${fileType}`;
      
      // Create temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `tecxmate.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `${fileType.toUpperCase()} download has started. Check your browser's download folder.`,
      });
      
    } catch (error) {
      console.error('Error initiating download:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error downloading your build",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  // Open QR code modal for a build
  const openQRCodeModal = (build: Build, fileType: 'apk' | 'aab' = 'apk') => {
    // Always use Firebase Storage URL pattern for QR codes
    const downloadUrl = `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${build.id}/app.${fileType}`;
    
    setQrModalData({
      url: downloadUrl,
      title: `${build.appName} (${fileType.toUpperCase()})`,
      buildId: build.id,
      fileType: fileType
    });
    
    setQrModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4 px-4 md:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <MobileSidebar />
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#8c52ff]">Tecxmate</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <UserAvatar />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex justify-between items-center">
        <div>
            <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
            <h1 className="text-2xl font-bold mt-2">My App Builds</h1>
        </div>
          
          <Button 
            onClick={openBuildDialog}
            className="bg-[#8c52ff] hover:bg-[#7a45e0]"
          >
            New Build
          </Button>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
            <div>
              <h3 className="font-medium text-green-800">Build Successfully Triggered</h3>
              <p className="text-green-700 text-sm">
                Build for "{successMessage.appName}" has been started at {successMessage.timestamp}.
              </p>
              <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-700 border-green-300 hover:bg-green-100"
                  onClick={() => {
                    fetchBuilds() // Refresh the builds list
                    setSuccessMessage(null) // Dismiss the message
                  }}
              >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Refresh Builds
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  router.push(`/dashboard/build-success?id=${successMessage.buildId}`)
                }}
              >
                Track Build Progress
              </Button>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-700 hover:bg-green-100 h-6 w-6 p-0 rounded-full"
            onClick={() => setSuccessMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

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
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-16 h-16 border-t-4 border-[#8c52ff] border-solid rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold mt-4">Loading your builds...</h2>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Builds</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                fetchBuilds();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : builds.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 inline-block mx-auto">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Builds Found</h3>
            <p className="text-gray-600 mb-4">You haven't created any app builds yet.</p>
            <Button
              onClick={openBuildDialog}
              className="bg-[#8c52ff] hover:bg-[#7a45e0]"
            >
                Create Your First Build
              </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {builds.map((build) => (
            <div 
              key={build.id} 
              className="border rounded-lg shadow-sm hover:shadow transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                  <div>
                  <h3 className="text-xl font-semibold mb-1 flex items-center">
                    {build.appName || 'Unnamed App'}
                    {build.status === 'completed' && (
                      <Badge className="ml-2 bg-green-500" variant="secondary">Ready</Badge>
                    )}
                    {(build.status === 'pending' || build.status === 'processing') && (
                      <Badge className="ml-2 bg-blue-500" variant="secondary">Processing</Badge>
                    )}
                    {build.status === 'failed' && (
                      <Badge className="ml-2 bg-red-500" variant="secondary">Failed</Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {build.webviewUrl ? (
                      <a 
                        href={build.webviewUrl.startsWith('http') ? build.webviewUrl : `https://${build.webviewUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        <Globe className="h-3 w-3" />
                        {build.webviewUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">No URL provided</span>
                            )}
                          </p>
                        </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {build.status === 'completed' && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => downloadBuild(build.id, 'apk')}
                          className="flex gap-2 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          Download APK
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => downloadBuild(build.id, 'aab')}
                          className="flex gap-2 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          Download AAB
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openQRCodeModal(build, 'apk')}
                          className="flex gap-2 cursor-pointer"
                        >
                          <QrCode className="h-4 w-4" />
                          QR Code (APK)
                        </DropdownMenuItem>
                      <DropdownMenuItem 
                          onClick={() => openQRCodeModal(build, 'aab')}
                        className="flex gap-2 cursor-pointer"
                      >
                        <QrCode className="h-4 w-4" />
                          QR Code (AAB)
                      </DropdownMenuItem>
                      </>
                    )}
                    {(build.status === 'pending' || build.status === 'processing') && (
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/build-success?id=${build.id}`)}
                        className="flex gap-2 cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Progress
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => deleteBuild(build.id)}
                      className="flex gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Build
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                        </div>
              
              <div className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4" />
                Created: {new Date(build.createdAt).toLocaleString()}
                      </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {build.status === 'completed' && (
                  <>
                    <Button 
                      onClick={() => downloadBuild(build.id, 'apk')}
                      variant="outline"
                      size="sm"
                      disabled={downloading === build.id}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download APK
                    </Button>
                  <Button 
                      onClick={() => downloadBuild(build.id, 'aab')}
                    variant="outline"
                      size="sm"
                      disabled={downloading === build.id}
                    className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download AAB
                    </Button>
                    <Button 
                      onClick={() => openQRCodeModal(build, 'apk')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                  >
                    <QrCode className="h-4 w-4" />
                      QR Code
                  </Button>
                  </>
                )}
                {(build.status === 'pending' || build.status === 'processing') && (
                  <Button
                    onClick={() => router.push(`/dashboard/build-success?id=${build.id}`)}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Progress
                  </Button>
                )}
                <Button
                  onClick={() => deleteBuild(build.id)}
                  variant="outline"
                  className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                        </div>
                      </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalData && (
        <QRCodeModal
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          url={qrModalData.url}
          title={qrModalData.title}
          description={`Scan this QR code to download ${qrModalData.title}`}
        />
      )}
    </div>
    </div>
  )
} 