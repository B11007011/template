import Link from "next/link"
import type { ReactNode } from "react"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4 px-4 md:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#8c52ff]">Tecxmate</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
