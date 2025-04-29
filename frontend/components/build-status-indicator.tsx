"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import api from "@/lib/api"

interface BuildStatusIndicatorProps {
  buildId: string
  initialStatus?: 'pending' | 'completed' | 'failed'
  autoRefresh?: boolean
  onStatusChange?: (status: string) => void
}

export default function BuildStatusIndicator({
  buildId,
  initialStatus = 'pending',
  autoRefresh = true,
  onStatusChange
}: BuildStatusIndicatorProps) {
  const [status, setStatus] = useState<string>(initialStatus)
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  
  // Effect to update progress bar for pending builds
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (status === 'pending' && autoRefresh) {
      // Start with initial progress
      setProgress(10);
      
      // Create an artificial progress bar that moves slowly
      interval = setInterval(() => {
        setProgress(prev => {
          // Don't go above 90% until we know it's complete
          const newProgress = prev + (0.5 * Math.random());
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 2000);
      
      // Check build status more frequently - every 3 seconds
      const statusCheck = setInterval(() => {
        console.log(`Checking build status for build ${buildId}...`);
        fetchBuildStatus();
      }, 3000);
      
      return () => {
        if (interval) clearInterval(interval);
        clearInterval(statusCheck);
      };
    }
    
    // For completed or failed builds, set appropriate progress
    if (status === 'completed') {
      setProgress(100);
    } else if (status === 'failed') {
      setProgress(100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, autoRefresh, buildId]);
  
  // Fetch build status from API
  const fetchBuildStatus = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching status for build ${buildId}...`);
      const response = await api.builds.getById(buildId);
      console.log(`Build ${buildId} status response:`, response);
      
      if (response && response.data) {
        const newStatus = response.data.status;
        console.log(`Current status: ${status}, New status: ${newStatus}`);
        
        // Only update if status has changed
        if (newStatus !== status) {
          setStatus(newStatus);
          
          if (onStatusChange) {
            onStatusChange(newStatus);
          }
          
          // Show toast for status change
          if (newStatus === 'completed') {
            toast({
              title: "Build Completed",
              description: "Your app build has completed successfully!",
            });
          } else if (newStatus === 'failed') {
            const errorMessage = response.data.error || 'Unknown error';
            setError(errorMessage);
            toast({
              title: "Build Failed",
              description: `Your app build failed: ${errorMessage}`,
              variant: "destructive"
            });
          }
        }
      } else {
        console.error(`Invalid response for build ${buildId}:`, response);
      }
    } catch (err) {
      console.error(`Error fetching build status for ${buildId}:`, err);
      console.error('Error details:', err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchBuildStatus();
  };
  
  // Navigate to build download page
  const goToBuildDetails = () => {
    router.push(`/account/dashboard/build-download?highlight=${buildId}`);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Build #{buildId}</CardTitle>
            <CardDescription>Status: {status}</CardDescription>
          </div>
          <Badge 
            className={
              status === 'completed' ? 'bg-green-100 text-green-800' :
              status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }
          >
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">Progress:</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className={
              status === 'completed' ? 'bg-green-100' :
              status === 'failed' ? 'bg-red-100' :
              'bg-gray-100'
            } />
          </div>
          
          <div className="flex items-center text-sm">
            {status === 'completed' ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : status === 'pending' ? (
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
            )}
            
            <span>
              {status === 'completed' 
                ? 'Build completed successfully' 
                : status === 'pending' 
                  ? 'Building your app...' 
                  : error || 'Build failed'}
            </span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isLoading}
            >
              Refresh Status
            </Button>
            <Button 
              size="sm"
              className="bg-[#8c52ff] hover:bg-[#7a45e0]"
              onClick={goToBuildDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 