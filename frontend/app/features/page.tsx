import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#8c52ff]">Tecxmate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
            <Link href="/features" className="text-sm font-medium hover:underline text-[#8c52ff]">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hidden md:inline-flex">
              <Button variant="outline">Contact</Button>
            </Link>
            <Link href="/account">
              <Button className="bg-[#8c52ff] hover:bg-[#7a45e0]">Account</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-16 text-center">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-center max-w-3xl mx-auto text-[#8c52ff] mb-4">
              Features of Tecxmate
            </h1>
            <p className="text-muted-foreground md:text-xl text-center max-w-[700px] mx-auto mb-12">
              Tecxmate offers advanced features that ensure a smooth, efficient, and customizable website-to-app
              conversion for an exceptional mobile experience.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#1a0b3b] text-white rounded-xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 text-[#8c52ff]">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 4V20M4 12H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mb-2 text-sm text-[#8c52ff]">Content Synchronization</div>
                <h3 className="text-xl font-bold mb-3">Live Content Sync</h3>
                <p className="text-sm text-gray-300">
                  Instantly sync your website content with the app, ensuring real-time updates in your website to app.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#1a0b3b] text-white rounded-xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 text-[#8c52ff]">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 7V12L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mb-2 text-sm text-[#8c52ff]">Caching</div>
                <h3 className="text-xl font-bold mb-3">Resource Caching</h3>
                <p className="text-sm text-gray-300">
                  Optimize app performance with resource caching for a faster experience in your web to app.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#1a0b3b] text-white rounded-xl p-6 relative overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="absolute right-0 bottom-0 opacity-10 text-[#8c52ff]">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mb-2 text-sm text-[#8c52ff]">Admob</div>
                <h3 className="text-xl font-bold mb-3">Revenue Generation</h3>
                <p className="text-sm text-gray-300">
                  Maximize your app's revenue potential by integrating AdMob for targeted ads. Effortlessly generate
                  income while enhancing user experience and tapping into a vast network for web to app monetization.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#1a0b3b] text-white rounded-xl p-6 relative overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="absolute right-0 bottom-0 opacity-10 text-[#8c52ff]">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mb-2 text-sm text-[#8c52ff]">Firebase</div>
                <h3 className="text-xl font-bold mb-3">Push Notification</h3>
                <p className="text-sm text-gray-300">
                  Increase user engagement with push notifications sent directly from the Tecxmate or from your own
                  website. Seamlessly integrate with Firebase for real-time delivery to keep your website to app users
                  informed.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-[#1a0b3b] text-white rounded-xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 text-[#8c52ff]">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 16V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H18C18.5304 19 19.0391 18.7893 19.4142 18.4142C19.7893 18.0391 20 17.5304 20 17V16M16 8L12 4M12 4L8 8M12 4V16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mb-2 text-sm text-[#8c52ff]">File</div>
                <h3 className="text-xl font-bold mb-3">Uploads & Downloads</h3>
                <p className="text-sm text-gray-300">
                  Enable file uploads and downloads within the app, improving your website to mobile app functionality.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-[#1a0b3b] text-white rounded-xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 text-[#8c52ff]">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 7C16.1046 7 17 6.10457 17 5C17 3.89543 16.1046 3 15 3C13.8954 3 13 3.89543 13 5C13 6.10457 13.8954 7 15 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 17C10.1046 17 11 16.1046 11 15C11 13.8954 10.1046 13 9 13C7.89543 13 7 13.8954 7 15C7 16.1046 7.89543 17 9 17Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 21C16.1046 21 17 20.1046 17 19C17 17.8954 16.1046 17 15 17C13.8954 17 13 17.8954 13 19C13 20.1046 13.8954 21 15 21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 17L15 19M15 7L9 13M15 7L15 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mb-2 text-sm text-[#8c52ff]">Permissions</div>
                <h3 className="text-xl font-bold mb-3">Hardware Access</h3>
                <p className="text-sm text-gray-300">
                  Manage camera, microphone, and location permissions in your website into app for seamless integration.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#8c52ff]">Tecxmate</span>
            <span className="text-sm text-muted-foreground">© 2023 All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="#" className="text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-muted-foreground hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
