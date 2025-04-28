"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Layers, Bell, Download, Info, Layout, Palette, Code, Zap, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="mr-2">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open menu</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-[#8c52ff]">Tecxmate</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[#8c52ff] text-white"
                onClick={() => setIsOpen(false)}
              >
                <Layers size={18} />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Bell size={18} />
                Push Notification
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
              >
                <Info size={18} />
                App Info
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Layout size={18} />
                Splash Screen
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Palette size={18} />
                Customization
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Code size={18} />
                Custom CSS & JS
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Zap size={18} />
                Integration Modules
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={18} />
                Advanced Settings
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
