import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
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
            <Link href="/pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline text-[#8c52ff]">
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
              Frequently asked questions
            </h1>
            <p className="text-muted-foreground md:text-xl text-center max-w-[700px] mx-auto mb-12">
              See the list below for our most frequently asked questions. If your question is not listed here, then feel
              free to contact us.
            </p>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    Do I need a Google Play or App Store Developer Account?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes you need to have your own Google Play or App Store Developer Account if you want to publish the
                    app in Google Play Store or App Store.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">Do I need coding skills to build the App?</AccordionTrigger>
                  <AccordionContent>
                    No, you don't need any coding skills to convert your website to a mobile app with Tecxmate. Our
                    platform is designed to be user-friendly and requires no technical expertise.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    What will happen if I update my site content later?
                  </AccordionTrigger>
                  <AccordionContent>
                    Tecxmate automatically syncs your website content with your app. When you update your website, the
                    changes will be reflected in your app in real-time, ensuring your app always displays the most
                    current information.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    What kind of websites can be converted into App?
                  </AccordionTrigger>
                  <AccordionContent>
                    Tecxmate can convert most types of websites into mobile apps, including WordPress, Shopify, Wix,
                    Squarespace, and custom-built websites. Our platform is compatible with various content management
                    systems and web technologies.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">Is there a free test available?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we offer a free plan that allows you to build and test your app for 30 days. This gives you the
                    opportunity to explore our features and see how your website looks as a mobile app before committing
                    to a paid plan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    Are there any discounts available for bulk purchases or for non-profits?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, we offer special discounts for bulk purchases and non-profit organizations. Please contact our
                    sales team for more information about our discount programs and how we can accommodate your specific
                    needs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    Is there a money-back guarantee if I'm not satisfied with the service?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, we offer a 14-day money-back guarantee for all our paid plans. If you're not satisfied with our
                    service within the first 14 days of your purchase, you can request a full refund, no questions
                    asked.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
