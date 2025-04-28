"use client"

import Link from "next/link"
import { ArrowLeft, Bell, Download, Info, Layout, Palette, Code, Zap, Settings, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Dashboard() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r min-h-[calc(100vh-65px)] p-4 hidden md:block">
        <nav className="space-y-1">
          <Link
            href="/account/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[#8c52ff] text-white"
          >
            <Layers size={18} />
            Dashboard
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Bell size={18} />
            Push Notification
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Download size={18} />
            Build & Download
          </Link>

          <div className="pt-4 pb-2">
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">App Settings</div>
          </div>

          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Info size={18} />
            App Info
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Layout size={18} />
            Splash Screen
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Palette size={18} />
            Customization
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Code size={18} />
            Custom CSS & JS
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Zap size={18} />
            Integration Modules
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Settings size={18} />
            Advanced Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <Link href="/account/apps" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Apps
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* App Info Card */}
          <Card className="col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#8c52ff] rounded-lg flex items-center justify-center text-white">
                  <span className="text-2xl font-bold">T</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">My Website</h2>
                  <p className="text-sm text-gray-500">Created for https://mywebsite.com/</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-sm">Create App</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-sm">Upload Logo</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-sm">Splash Screen</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-sm">Build App</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Overview Card */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>App Overview</CardTitle>
              <p className="text-sm text-gray-500">Basic overview of your app</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-100 p-4 rounded-lg">
                  <div className="text-sm text-purple-600">Expires in</div>
                  <div className="text-xl font-bold">30 Days</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-sm text-green-600">App Version</div>
                  <div className="text-xl font-bold">1 (1.0)</div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <div className="text-sm text-orange-600">Application Type</div>
                  <div className="text-xl font-bold">Android</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete App
                </Button>
                <Button className="bg-[#8c52ff] hover:bg-[#7a45e0]">Upgrade App</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Firebase Integration</div>
                  <div className="text-lg font-bold">Not Done</div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Connect Firebase to send Push Notification to app users.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Admob Integration</div>
                  <div className="text-lg font-bold">Not Done</div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Connect Admob to display Ads in the app and starting earning.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Resource Caching</div>
                  <div className="text-lg font-bold">Enabled</div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Caching loads the App Faster but slow to content changes.</p>
            </CardContent>
          </Card>
        </div>

        {/* Video Tutorials */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <p className="text-sm text-gray-500">Step by step guide to setup the complete app</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">How to convert your website into an Android App</h3>
                    <p className="text-sm text-gray-500">1 minute 40 seconds</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">How to connect Firebase for Push Notification</h3>
                    <p className="text-sm text-gray-500">2 minutes 46 seconds</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">How to connect Admob to Display Ads in the App</h3>
                    <p className="text-sm text-gray-500">1 minute 34 seconds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <p className="text-sm text-gray-500">List of questions you may ask</p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Do I need a Google Play Developer Account?</AccordionTrigger>
                  <AccordionContent>
                    Yes you need to have your own Google Play or App Store Developer Account if you want to publish the
                    app in Google Play Store or App Store.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Why the app is detected as virus while installing?</AccordionTrigger>
                  <AccordionContent>
                    When an app is installed from direct APK file, by default the Android OS displays a Play Protect
                    Warning. When the app will be published into Google Play Store, the warning will be removed.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Why the app is not showing updated website content?</AccordionTrigger>
                  <AccordionContent>
                    If you've enabled resource caching, the app might be showing cached content. You can disable caching
                    in the app settings or clear the app cache to see the updated content.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
