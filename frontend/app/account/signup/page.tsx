// "use client"

// import type React from "react"
// import Link from "next/link"
// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { useRouter, useSearchParams } from "next/navigation"
// import { useAuth } from "@/lib/auth"
// import { toast } from "sonner"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { AlertCircle } from "lucide-react"

// export default function SignupPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [passwordError, setPasswordError] = useState("")
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const redirectPath = searchParams?.get('redirect') || '/dashboard'
//   const { user, signUp, signInWithGoogle, error, loading, isConfigured } = useAuth()

//   useEffect(() => {
//     // Redirect if user is already logged in
//     if (user) {
//       router.push(redirectPath)
//     }
//   }, [user, router, redirectPath])

//   useEffect(() => {
//     // Show error toast if there's an authentication error
//     if (error) {
//       toast.error(error)
//     }
//   }, [error])

//   const validatePasswords = () => {
//     if (password !== confirmPassword) {
//       setPasswordError("Passwords do not match")
//       return false
//     }
//     if (password.length < 6) {
//       setPasswordError("Password must be at least 6 characters")
//       return false
//     }
//     setPasswordError("")
//     return true
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!validatePasswords()) return
//     await signUp(email, password)
//   }

//   const handleGoogleSignIn = async () => {
//     await signInWithGoogle()
//   }

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c52ff] mx-auto"></div>
//           <p className="mt-4">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex min-h-screen">
//       {/* Testimonial Section */}
//       <div className="hidden md:flex md:w-1/2 bg-[#f5f2ff] flex-col justify-center items-center p-8 relative">
//         <div className="max-w-md mx-auto text-center">
//           <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">
//             Join thousands of users who have transformed their websites into mobile apps with Tecxmate!
//           </h2>
//           <div className="flex flex-col items-center mt-8">
//             <div className="w-16 h-16 rounded-full bg-gray-300 mb-3"></div>
//             <p className="font-medium">Michael Chen</p>
//             <p className="text-sm text-gray-500">Founder, StartupXYZ</p>
//             <div className="flex mt-2">
//               {[...Array(5)].map((_, i) => (
//                 <svg
//                   key={i}
//                   className="w-5 h-5 text-yellow-400"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
//                 </svg>
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className="absolute bottom-4 left-4 text-sm text-gray-500">© 2023 Tecxmate. All Rights Reserved</div>
//       </div>

//       {/* Signup Form */}
//       <div className="w-full md:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           <h1 className="text-2xl font-bold text-center mb-2">Create an account</h1>
//           <p className="text-center text-gray-600 mb-8">Sign up to get started with Tecxmate</p>

//           {!isConfigured && (
//             <Alert variant="destructive" className="mb-6">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Firebase Configuration Required</AlertTitle>
//               <AlertDescription>
//                 Firebase authentication is not properly configured. Please update your environment 
//                 variables in the .env.local file with valid Firebase configuration.
//               </AlertDescription>
//             </Alert>
//           )}

//           {redirectPath !== '/account/dashboard' && (
//             <Alert className="mb-6">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Authentication Required</AlertTitle>
//               <AlertDescription>
//                 You need to create an account to access this page.
//               </AlertDescription>
//             </Alert>
//           )}

//           {redirectPath !== '/dashboard' && (
//             <Alert className="mb-6">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Authentication Required</AlertTitle>
//               <AlertDescription>
//                 You need to create an account to access this page.
//               </AlertDescription>
//             </Alert>
//           )}

//           {!isConfigured && (
//             <Alert variant="destructive" className="mb-6">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Firebase Configuration Required</AlertTitle>
//               <AlertDescription>
//                 Firebase authentication is not properly configured. Please update your environment 
//                 variables in the .env.local file with valid Firebase configuration.
//               </AlertDescription>
//             </Alert>
//           )}

//           {redirectPath !== '/dashboard' && (
//             <Alert className="mb-6">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Authentication Required</AlertTitle>
//               <AlertDescription>
//                 You need to create an account to access this page.
//               </AlertDescription>
//             </Alert>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                   required
//                   disabled={!isConfigured}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                   Password
//                 </label>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Create a password"
//                   required
//                   disabled={!isConfigured}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                   Confirm Password
//                 </label>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   placeholder="Confirm your password"
//                   required
//                   disabled={!isConfigured}
//                 />
//                 {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
//               </div>

//               <Button 
//                 type="submit" 
//                 className="w-full bg-[#8c52ff] hover:bg-[#7a45e0]"
//                 disabled={!isConfigured}
//               >
//                 Sign up
//               </Button>

//               <div className="relative flex items-center justify-center">
//                 <div className="border-t border-gray-300 flex-grow"></div>
//                 <span className="mx-4 text-sm text-gray-500">or</span>
//                 <div className="border-t border-gray-300 flex-grow"></div>
//               </div>

//               <Button 
//                 variant="outline" 
//                 className="w-full" 
//                 type="button"
//                 onClick={handleGoogleSignIn}
//                 disabled={!isConfigured}
//               >
//                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                   <path
//                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                     fill="#4285F4"
//                   />
//                   <path
//                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                     fill="#34A853"
//                   />
//                   <path
//                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                     fill="#FBBC05"
//                   />
//                   <path
//                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                     fill="#EA4335"
//                   />
//                 </svg>
//                 Sign up with Google
//               </Button>
//             </div>
//           </form>

//           <p className="text-center mt-8 text-sm text-gray-600">
//             Already have an account?{" "}
//             <Link href={`/account/login${redirectPath !== '/account/dashboard' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`} className="text-[#8c52ff] hover:underline font-medium">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// } 