"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ApiDebug() {
  const [status, setStatus] = useState<string>("Not tested")
  const [response, setResponse] = useState<string>("")
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testType, setTestType] = useState<string>("general")

  const testConnection = async () => {
    setIsLoading(true)
    setStatus("Testing...")
    setResponse("")
    setErrorDetails(null)
    setTestType("general")

    try {
      // Test connection to the API server with a simple GET request
      console.log(`Testing API connection to ${API_URL}/debug...`)
      const result = await fetch(`${API_URL}/debug`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Raw response status:', result.status)
      
      if (result.ok) {
        const data = await result.json()
        console.log('API debug response data:', data)
        setStatus(`Connection OK (${result.status})`)
        setResponse(JSON.stringify(data, null, 2))
      } else {
        const text = await result.text()
        console.error('API error response:', text)
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
  
  const testBuilds = async () => {
    setIsLoading(true)
    setStatus("Testing Builds API...")
    setResponse("")
    setErrorDetails(null)
    setTestType("builds")

    try {
      // Test the builds endpoint through our API client
      console.log("Testing builds API endpoint...")
      const response = await api.builds.getAll()
      console.log("Builds API response:", response)
      
      setStatus(`Builds API OK (${response.success ? 'Success' : 'Failed'})`)
      setResponse(JSON.stringify(response, null, 2))
      
      if (!response.success) {
        setErrorDetails({
          error: response.error || "Unknown error",
          message: "The API returned an unsuccessful response"
        })
      }
    } catch (error) {
      console.error('Builds API test error:', error)
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

  const testFirebaseConfig = async () => {
    setIsLoading(true)
    setStatus("Testing Firebase Config...")
    setResponse("")
    setErrorDetails(null)
    setTestType("firebase")

    try {
      // Request backend to test Firebase config
      console.log("Testing Firebase configuration...")
      const result = await fetch(`${API_URL}/debug/firebase`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Raw firebase test response status:', result.status)
      
      if (result.ok) {
        const data = await result.json()
        console.log('Firebase config test response:', data)
        setStatus(`Firebase Config ${data.success ? 'OK' : 'Error'}`)
        setResponse(JSON.stringify(data, null, 2))
        
        if (!data.success) {
          setErrorDetails({
            error: data.error || "Unknown error",
            message: "Firebase configuration test failed"
          })
        }
      } else {
        const text = await result.text()
        console.error('Firebase test error response:', text)
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
      console.error('Firebase config test error:', error)
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
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && testType === "general" ? "Testing..." : "Test Connection"}
            </Button>
            <Button 
              onClick={testBuilds} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading && testType === "builds" ? "Testing..." : "Test Builds API"}
            </Button>
            <Button 
              onClick={testFirebaseConfig} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading && testType === "firebase" ? "Testing..." : "Test Firebase Config"}
            </Button>
            <div className="ml-2">
              <span className="font-semibold mr-2">Status:</span>
              <Badge className={
                status.includes("OK") ? "bg-green-100 text-green-800" :
                status.includes("Testing") ? "bg-yellow-100 text-yellow-800" :
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
                {errorDetails.raw && (
                  <div className="mb-2">
                    <span className="font-medium">Raw Error:</span> {errorDetails.raw}
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
                  <li>Check if your backend server is running on port 5000</li>
                  <li>Make sure the backend is started with <code>cd backend && npm run dev</code></li>
                  <li>Verify the NEXT_PUBLIC_API_URL environment variable in .env.local (current: {API_URL})</li>
                  <li>Check if Firebase service account is properly configured in backend/service-account.json</li>
                  <li>Examine browser console (F12) for network errors and CORS issues</li>
                  <li>Try creating a new build to populate the builds collection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 