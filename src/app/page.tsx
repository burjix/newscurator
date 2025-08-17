import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">NewsCurator</h1>
          <nav className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Automate Your Social Media Content
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered news curation and social media posting. Save hours while maintaining your authentic voice.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">Learn More</Button>
            </Link>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-24">
          <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">Smart Curation</h4>
              <p className="text-muted-foreground">
                AI analyzes thousands of articles to find content that matches your brand and audience.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">Auto Publishing</h4>
              <p className="text-muted-foreground">
                Schedule and publish to X and LinkedIn automatically at optimal times.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">Analytics</h4>
              <p className="text-muted-foreground">
                Track engagement, growth, and optimize your content strategy with data-driven insights.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <h3 className="text-3xl font-bold text-center mb-12">Pricing</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-2">Free</h4>
              <p className="text-3xl font-bold mb-4">$0/mo</p>
              <ul className="space-y-2 text-sm mb-6">
                <li>1 social account</li>
                <li>5 posts per week</li>
                <li>Basic analytics</li>
              </ul>
              <Button className="w-full" variant="outline">Start Free</Button>
            </div>
            <div className="border rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                POPULAR
              </div>
              <h4 className="text-xl font-semibold mb-2">Professional</h4>
              <p className="text-3xl font-bold mb-4">$29/mo</p>
              <ul className="space-y-2 text-sm mb-6">
                <li>3 social accounts</li>
                <li>50 posts per week</li>
                <li>AI post generation</li>
                <li>Advanced analytics</li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-2">Business</h4>
              <p className="text-3xl font-bold mb-4">$99/mo</p>
              <ul className="space-y-2 text-sm mb-6">
                <li>10 social accounts</li>
                <li>Unlimited posts</li>
                <li>Team collaboration</li>
                <li>API access</li>
                <li>Priority support</li>
              </ul>
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 NewsCurator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
