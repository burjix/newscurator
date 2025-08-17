"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNav from "@/components/dashboard-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/brand', label: 'Brand Profile' },
    { href: '/dashboard/sources', label: 'News Sources' },
    { href: '/dashboard/content', label: 'Content Library' },
    { href: '/dashboard/posts', label: 'Posts' },
    { href: '/dashboard/schedule', label: 'Schedule' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/accounts', label: 'Social Accounts' },
    { href: '/dashboard/settings', label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          top-16 lg:top-0 min-h-[calc(100vh-64px)]
        `}>
          <div className="p-4">
            <div className="flex justify-between items-center lg:hidden mb-4">
              <h2 className="font-semibold">Menu</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                      isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}