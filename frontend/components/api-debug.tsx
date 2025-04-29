"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ApiDebug() {
  const [status, setStatus] = useState<string>("Not tested")
  const [response, setResponse] = useState<string>("")
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setStatus("Testing...")
    setResponse("")
    setErrorDetails(null)

    try {
      // Test connection to the API server with a simple GET request
      const result = await fetch(`${API_URL}/builds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (result.ok) {
        const data = await result.json()
        setStatus(`Connection OK (${result.status})`)
        setResponse(JSON.stringify(data, null, 2))
      } else {
        const text = await result.text()
        setStatus(`Error (${result.status})`)
        setResponse(text || "No response body")
        
        try {
          // Try to parse as JSON for better error details
          setErrorDetails(JSON.parse(text))
        } catch {
          // If not JSON, just show the raw text
          setErrorDetails({ raw: text })
        }
      }
    } catch (error) {
      console.error('Connection test error:', error)
      setStatus("Failed")
      setResponse(error instanceof Error ? error.toString() : String(error))
      setErrorDetails({
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>Test connection to backend API at {API_URL}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Testing..." : "Test Connection"}
            </Button>
            <div>
              <span className="font-semibold mr-2">Status:</span>
              <Badge className={
                status === "Connection OK (200)" ? "bg-green-100 text-green-800" :
                status === "Testing..." ? "bg-yellow-100 text-yellow-800" :
                status === "Not tested" ? "bg-gray-100 text-gray-800" :
                "bg-red-100 text-red-800"
              }>
                {status}
              </Badge>
            </div>
          </div>

          {response && (
            <div className="mt-4">
              <div className="font-semibold mb-2">Response:</div>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-sm whitespace-pre-wrap">
                {response}
              </pre>
            </div>
          )}

          {errorDetails && (
            <div className="mt-4">
              <div className="font-semibold mb-2">Error Details:</div>
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                {errorDetails.message && (
                  <div className="mb-2">
                    <span className="font-medium">Message:</span> {errorDetails.message}
                  </div>
                )}
                {errorDetails.type && (
                  <div className="mb-2">
                    <span className="font-medium">Type:</span> {errorDetails.type}
                  </div>
                )}
                {errorDetails.success === false && (
                  <div className="mb-2">
                    <span className="font-medium">API Error:</span> {errorDetails.error}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="font-semibold mb-2">Debug Information:</div>
            <div className="bg-gray-100 p-4 rounded-md text-sm">
              <div><strong>API URL:</strong> {API_URL}</div>
              <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
              <div><strong>CORS:</strong> Make sure your backend allows requests from {typeof window !== 'undefined' ? window.location.origin : 'this origin'}</div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <strong>Quick Fixes:</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Check if your backend server is running</li>
                  <li>Verify the NEXT_PUBLIC_API_URL environment variable</li>
                  <li>Ensure Firebase credentials are valid or mock data is enabled</li>
                  <li>Check CORS configuration allows your frontend origin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 