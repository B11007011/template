// "use client"

// import React, { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth";
// import { UserProfile } from "@/components/UserProfile";
// import Link from "next/link"
// import { ArrowLeft, Bell, Download, Info, Layout, Palette, Code, Zap, Settings, Layers } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { AlertCircle } from "lucide-react"

// export default function DashboardPage() {
//   const { user, loading, isConfigured } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user && isConfigured) {
//       router.push("/account/login");
//     }
//   }, [user, loading, router, isConfigured]);

//   if (loading) {
//   return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c52ff] mx-auto"></div>
//           <p className="mt-4">Loading...</p>
//         </div>
//                 </div>
//     );
//   }

//   if (!isConfigured) {
//     return (
//       <div className="container mx-auto py-12 px-4">
//         <div className="max-w-xl mx-auto">
//           <Alert variant="destructive" className="mb-6">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Firebase Configuration Required</AlertTitle>
//             <AlertDescription>
//               Firebase authentication is not properly configured. Please update your environment 
//               variables in the .env.local file with valid Firebase configuration.
//             </AlertDescription>
//           </Alert>
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h1 className="text-2xl font-bold mb-4">Firebase Setup Required</h1>
//             <p className="mb-4">To use authentication features, you need to configure Firebase:</p>
//             <ol className="list-decimal pl-5 mb-6 space-y-2">
//               <li>Create a Firebase project at <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
//               <li>Add a web app to your Firebase project</li>
//               <li>Enable Authentication with Email/Password and Google providers</li>
//               <li>Copy your Firebase configuration to the .env.local file</li>
//             </ol>
//             <div className="bg-gray-100 p-4 rounded-md mb-6">
//               <p className="font-mono text-sm">
//                 # Firebase configuration<br />
//                 NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key<br />
//                 NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com<br />
//                 NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id<br />
//                 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com<br />
//                 NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id<br />
//                 NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
//               </p>
//                       </div>
//             <Button 
//               className="w-full bg-[#8c52ff] hover:bg-[#7a45e0]"
//               onClick={() => router.push("/")}
//             >
//               Go to Home Page
//             </Button>
//                     </div>
//                   </div>
//                 </div>
//     );
//   }

//   if (!user) {
//     return null; // Will redirect in the useEffect
//   }

//   return (
//     <div className="container mx-auto py-12 px-4">
//       <h1 className="text-3xl font-bold text-center mb-8">Your Dashboard</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         <div className="md:col-span-1">
//           <UserProfile />
//         </div>

//         <div className="md:col-span-2">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-2xl font-semibold mb-4">Your Apps</h2>
            
//             {/* This is a placeholder for your actual dashboard content */}
//             <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No apps yet</h3>
//               <p className="text-gray-500 mb-4">
//                 Get started by creating your first mobile app from your website.
//               </p>
//               <button className="bg-[#8c52ff] hover:bg-[#7a45e0] text-white font-medium py-2 px-6 rounded-md">
//                 Create App
//               </button>
//               </div>
            
//             <div className="mt-6">
//               <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between p-3 bg-gray-50 rounded">
//                   <span>Account created</span>
//                   <span className="text-gray-500">{new Date().toLocaleDateString()}</span>
//                 </div>
//                 <div className="flex justify-between p-3 bg-gray-50 rounded">
//                   <span>Logged in with {user.providerData[0]?.providerId === "google.com" ? "Google" : "Email"}</span>
//                   <span className="text-gray-500">{new Date().toLocaleDateString()}</span>
//                 </div>
//                   </div>
//                 </div>
//               </div>
//         </div>
//       </div>
//     </div>
//   );
// }