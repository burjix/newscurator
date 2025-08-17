import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  const stats = await prisma.$transaction([
    prisma.post.count({
      where: { userId: session?.user?.id },
    }),
    prisma.post.count({
      where: { 
        userId: session?.user?.id,
        status: "PUBLISHED",
        publishedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }
      },
    }),
    prisma.brandProfile.count({
      where: { userId: session?.user?.id },
    }),
    prisma.socialAccount.count({
      where: { userId: session?.user?.id },
    }),
  ]);

  const [totalPosts, weeklyPosts, brandProfiles, socialAccounts] = stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyPosts}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brandProfiles}</div>
            <p className="text-xs text-muted-foreground">Active profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialAccounts}</div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your content strategy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {brandProfiles === 0 && (
              <Link href="/dashboard/brand/new">
                <Button className="w-full" variant="outline">
                  Create Brand Profile
                </Button>
              </Link>
            )}
            {socialAccounts === 0 && (
              <Link href="/dashboard/accounts">
                <Button className="w-full" variant="outline">
                  Connect Social Accounts
                </Button>
              </Link>
            )}
            <Link href="/dashboard/content">
              <Button className="w-full" variant="outline">
                Discover Content
              </Button>
            </Link>
            <Link href="/dashboard/posts/new">
              <Button className="w-full">
                Create Post
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest posts and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to show
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}