"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Trash2, AlertCircle, Clock, CheckCircle, RefreshCw, Globe, Type, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, isValid } from "date-fns"
import ApiDebug from "@/components/api-debug"
import api from "@/lib/api"
import QRCode from "react-qr-code"
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
import { useRouter } from "next/navigation"

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

// Helper function to safely format dates
const safeFormatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'PPp') : 'Invalid date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function BuildDownloadPage() {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [triggeringBuild, setTriggeringBuild] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [qrCodeModal, setQRCodeModal] = useState<{open: boolean, build: Build | null, fileType: 'apk' | 'aab'}>({
    open: false,
    build: null,
    fileType: 'apk'
  })
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState<{
    buildId: string;
    appName: string;
    timestamp: string;
  } | null>(null)
  
  // New state for the build dialog form
  const [buildDialogOpen, setBuildDialogOpen] = useState(false)
  const [newBuildUrl, setNewBuildUrl] = useState("")
  const [newAppName, setNewAppName] = useState("")

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
      
      // Show detailed error message
      toast({
        title: "Delete Failed",
        description: `Failed to delete build: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
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
      
      // For our Firebase Storage build, handle direct download
      if (buildId === '14709933897') {
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
        
        setDownloading(null);
        return;
      }
      
      // Normal API download flow
      const downloadUrl = `${api.baseUrl}/builds/${buildId}/download?type=${fileType}`;
      
      // Open the download URL in a new tab
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Download Started",
        description: `Your build is downloading. If it doesn't start automatically, check your browser settings.`,
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

  // Function to get download URL for QR code
  const getDownloadUrl = (build: Build, fileType: 'apk' | 'aab' = 'apk'): string => {
    if (build.id === '14709933897') {
      return `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${build.id}/app.${fileType}`;
    }
    
    if (build[fileType === 'apk' ? 'apkUrl' : 'aabUrl']) {
      return build[fileType === 'apk' ? 'apkUrl' : 'aabUrl'] as string;
    }
    
    return `${api.baseUrl}/builds/${build.id}/download?type=${fileType}`;
  };

  // Open QR Code Modal
  const openQRCodeModal = (build: Build, fileType: 'apk' | 'aab' = 'apk') => {
    setQRCodeModal({
      open: true,
      build,
      fileType
    });
  };

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

      {/* Success message notification */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
          <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-green-800">Build Triggered Successfully!</h4>
            <p className="text-green-700 text-sm mt-1">
              Your app build for <span className="font-medium">{successMessage.appName}</span> has been started.
              Build ID: <span className="font-mono bg-green-100 px-1 rounded">{successMessage.buildId}</span>
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-700 border-green-300 hover:bg-green-100"
                onClick={() => setSuccessMessage(null)}
              >
                Dismiss
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  router.push(`/account/dashboard/build-success?id=${successMessage.buildId}`)
                }}
              >
                Track Build Progress
              </Button>
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

      {/* QR Code Modal */}
      <Dialog 
        open={qrCodeModal.open} 
        onOpenChange={(open) => setQRCodeModal(prev => ({...prev, open}))}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan QR Code to Download</DialogTitle>
            <DialogDescription>
              {qrCodeModal.build && (
                <>Use your mobile device to scan this QR code and download {qrCodeModal.build.appName}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            {qrCodeModal.build && (
              <>
                <div className="bg-white p-4 rounded-lg mb-4 border">
                  <QRCode
                    value={qrCodeModal.build ? getDownloadUrl(qrCodeModal.build, qrCodeModal.fileType) : ''}
                    size={250}
                    level="H"
                  />
                </div>
                <div className="text-sm text-center space-y-2 max-w-xs mx-auto">
                  <p className="font-medium">
                    {qrCodeModal.build.appName} - {qrCodeModal.fileType.toUpperCase()}
                  </p>
                  <p className="text-gray-500">
                    Scanning this code will download the {qrCodeModal.fileType.toUpperCase()} file directly to your device.
                  </p>
                  <div className="pt-2 text-xs text-gray-400 flex flex-col items-center">
                    <p>Download URL:</p>
                    <p className="truncate max-w-[300px] font-mono bg-gray-50 px-2 py-1 rounded">
                      {getDownloadUrl(qrCodeModal.build, qrCodeModal.fileType)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-sm text-yellow-800">
                    <h4 className="font-medium mb-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Installation Instructions
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>When downloading APK files, you may need to allow installation from unknown sources</li>
                      <li>AAB files are for publishing to the Google Play Store only</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              className="sm:flex-1"
              onClick={() => {
                if (qrCodeModal.build) {
                  downloadBuild(qrCodeModal.build.id, qrCodeModal.fileType);
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download on This Device
            </Button>
            <Button 
              className="bg-[#8c52ff] hover:bg-[#7a45e0] sm:flex-1"
              onClick={() => setQRCodeModal(prev => ({...prev, open: false}))}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                              : build.status === 'processing' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {build.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {build.createdAt && (
                        <>Created {safeFormatDate(build.createdAt)}</>
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
                              <>Completed {build.completedAt ? safeFormatDate(build.completedAt) : ''}</>
                            ) : build.status === 'pending' ? (
                              <>Build in progress</>
                            ) : build.status === 'processing' ? (
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
                              : build.status === 'processing' 
                                ? 'bg-blue-100'
                                : 'bg-red-100'
                        }`}>
                          {build.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : build.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          ) : build.status === 'processing' ? (
                            <Clock className="h-5 w-5 text-blue-500" />
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
                                  <div className="flex flex-col">
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadBuild(build.id, 'apk')}
                                        disabled={downloading === build.id}
                                        className="flex-1 flex items-center justify-center"
                                      >
                                        {downloading === build.id ? (
                                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Download className="h-4 w-4 mr-2" />
                                        )}
                                        {downloading === build.id ? "Downloading..." : "Download APK"}
                                      </Button>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => openQRCodeModal(build, 'apk')}
                                              className="px-2"
                                            >
                                              <Smartphone className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Show QR code for mobile download</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                )}
                                {build.aabUrl && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => downloadBuild(build.id, 'aab')}
                                      disabled={downloading === build.id}
                                      className="flex-1 flex items-center justify-center"
                                    >
                                      {downloading === build.id ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                      )}
                                      {downloading === build.id ? "Downloading..." : "Download AAB"}
                                    </Button>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openQRCodeModal(build, 'aab')}
                                            className="px-2"
                                          >
                                            <Smartphone className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Show QR code for mobile download</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
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