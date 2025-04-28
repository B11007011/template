import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function PricingPage() {
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
            <Link href="/features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:underline text-[#8c52ff]">
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
            <Link href="/dashboard">
              <Button className="bg-[#8c52ff] hover:bg-[#7a45e0]">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-[#8c52ff] mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Choose the perfect plan for your needs with no hidden fees or complicated tiers.
              </p>
            </div>

            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center rounded-full border bg-background p-1 text-muted-foreground">
                <button className="rounded-full px-4 py-2 text-sm font-medium bg-[#8c52ff] text-white">Android</button>
                <button className="rounded-full px-4 py-2 text-sm font-medium">iOS</button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="relative bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Free</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                  <p className="text-gray-600 mb-6">Perfect for exploring and testing your app idea.</p>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white mb-6">Get Started</Button>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">1 Android Application</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited Builds</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited Active Users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">30-Day Trial</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Yearly Plan */}
              <div className="relative bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Yearly</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">$69</span>
                    <span className="text-gray-500 ml-1">/year</span>
                  </div>
                  <p className="text-gray-600 mb-6">Our most popular plan with all the essential features.</p>
                  <Button className="w-full bg-[#8c52ff] hover:bg-[#7a45e0] mb-6">Get Started</Button>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">1 Android Application</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited Builds</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited Active Users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Play Store Releasable</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">No Tecxmate Logo</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Admob Integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Push Notifications</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Lifetime Plan */}
              <div className="relative bg-[#8c52ff] text-white rounded-2xl shadow-md overflow-hidden transform md:scale-105">
                <div className="absolute top-0 right-0 bg-[#e9ff00] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  BEST VALUE
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Lifetime</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">$89</span>
                    <span className="text-gray-200 ml-1">one-time</span>
                  </div>
                  <p className="text-gray-100 mb-6">Pay once and get lifetime access to all premium features.</p>
                  <Button className="w-full bg-[#e9ff00] hover:bg-[#d4e800] text-black mb-6">Get Started</Button>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">1 Android Application</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited Builds</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited Active Users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Play Store Releasable</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">No Tecxmate Logo</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Admob Integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Push Notifications</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Free Lifetime Updates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-[#e9ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Priority Support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-16 max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-medium mb-2">Do I need a Google Play Developer Account?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you'll need your own Google Play Developer Account to publish your app to the Play Store.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Is there a money-back guarantee?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Can I upgrade my plan later?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you can upgrade from Free to Yearly or Lifetime at any time.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Are there any hidden fees?</h3>
                  <p className="text-gray-600 text-sm">
                    No, the price you see is the price you pay. No hidden fees or charges.
                  </p>
                </div>
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
