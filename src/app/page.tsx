import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">NewsCurator</h1>
          <nav className="flex gap-2 sm:gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="text-sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-12 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Automate Your Social Media Content
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            AI-powered news curation and social media posting. Save hours while maintaining your authentic voice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">Start Free Trial</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Learn More</Button>
            </Link>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-12 sm:py-24">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Features</h3>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="border rounded-lg p-6">
              <h4 className="text-lg sm:text-xl font-semibold mb-3">Smart Curation</h4>
              <p className="text-muted-foreground text-sm sm:text-base">
                AI analyzes thousands of articles to find content that matches your brand and audience.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="text-lg sm:text-xl font-semibold mb-3">Auto Publishing</h4>
              <p className="text-muted-foreground text-sm sm:text-base">
                Schedule and publish to X and LinkedIn automatically at optimal times.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="text-lg sm:text-xl font-semibold mb-3">Analytics</h4>
              <p className="text-muted-foreground text-sm sm:text-base">
                Track engagement, growth, and optimize your content strategy with data-driven insights.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-muted/20 py-12 sm:py-24">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h3>
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2">Connect Your Accounts</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Link your X and LinkedIn accounts securely to start posting.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2">Set Your Preferences</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Define your brand voice, industry, and content preferences for AI curation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2">Automate & Grow</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Watch as AI finds, curates, and posts relevant content for your audience.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 sm:py-24">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Pricing</h3>
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            <div className="border rounded-lg p-6">
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Free</h4>
              <p className="text-2xl sm:text-3xl font-bold mb-4">$0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  1 social account
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  5 posts per week
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Basic analytics
                </li>
              </ul>
              <Button className="w-full" variant="outline">Start Free</Button>
            </div>
            <div className="border-2 border-primary rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                POPULAR
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Professional</h4>
              <p className="text-2xl sm:text-3xl font-bold mb-4">$29<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  3 social accounts
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  50 posts per week
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  AI post generation
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Advanced analytics
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Business</h4>
              <p className="text-2xl sm:text-3xl font-bold mb-4">$99<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  10 social accounts
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Unlimited posts
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  API access
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Priority support
                </li>
              </ul>
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </div>
          </div>
        </section>

        <section className="bg-muted/20 py-12 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of content creators who save hours every week with automated social media curation.
            </p>
            <Link href="/auth/signup">
              <Button size="lg">Start Your Free Trial</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 NewsCurator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
