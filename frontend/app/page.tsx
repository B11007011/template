import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Globe } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import { features } from "@/lib/data"
import ConvertToApp from "@/components/convert-to-app"
import AuthLinks from "@/components/AuthLinks"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b py-4 px-4 md:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#8c52ff]">Tecxmate</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <AuthLinks>
              <Link href="/account/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link 
                href="/account/dashboard" 
                className="inline-flex h-9 items-center justify-center rounded-md bg-[#8c52ff] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#7a45e0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started
              </Link>
            </AuthLinks>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 px-4 md:py-24">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Convert Your Website to <span className="text-[#8c52ff]">Mobile App</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Turn any website into a beautiful Android app instantly without any coding. Just enter your website URL to get started.
            </p>
            
            <div className="max-w-md mx-auto mb-10">
              <ConvertToApp />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">No coding required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Ready in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Push notifications</span>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 bg-[#8c52ff]/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#8c52ff]/20 text-[#8c52ff] mb-6">
                  <span>Simple Process</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">
                  <span className="text-[#8c52ff]">03 Steps</span> to Convert your Website to App
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8c52ff] text-white">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Enter your website URL</h3>
                      <p className="text-sm text-muted-foreground">
                        Provide the address of your website to get started
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8c52ff] text-white">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Customize your app</h3>
                      <p className="text-sm text-muted-foreground">Choose features and design elements for your app</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8c52ff] text-white">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Download your app</h3>
                      <p className="text-sm text-muted-foreground">Get your app ready for publishing on app stores</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                    <span className="text-muted-foreground">App Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-white border-t py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-500">© 2023 Tecxmate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
