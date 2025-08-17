import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="flex">
        <aside className="w-64 border-r min-h-[calc(100vh-64px)] p-4">
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-accent">
              Overview
            </a>
            <a href="/dashboard/brand" className="block px-3 py-2 rounded-md hover:bg-accent">
              Brand Profile
            </a>
            <a href="/dashboard/sources" className="block px-3 py-2 rounded-md hover:bg-accent">
              News Sources
            </a>
            <a href="/dashboard/content" className="block px-3 py-2 rounded-md hover:bg-accent">
              Content Library
            </a>
            <a href="/dashboard/posts" className="block px-3 py-2 rounded-md hover:bg-accent">
              Posts
            </a>
            <a href="/dashboard/schedule" className="block px-3 py-2 rounded-md hover:bg-accent">
              Schedule
            </a>
            <a href="/dashboard/analytics" className="block px-3 py-2 rounded-md hover:bg-accent">
              Analytics
            </a>
            <a href="/dashboard/accounts" className="block px-3 py-2 rounded-md hover:bg-accent">
              Social Accounts
            </a>
            <a href="/dashboard/settings" className="block px-3 py-2 rounded-md hover:bg-accent">
              Settings
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}