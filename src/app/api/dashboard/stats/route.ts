import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await prisma.$transaction([
      prisma.post.count({
        where: { userId: session.user.id },
      }),
      prisma.post.count({
        where: { 
          userId: session.user.id,
          status: "PUBLISHED",
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          }
        },
      }),
      prisma.brandProfile.count({
        where: { userId: session.user.id },
      }),
      prisma.socialAccount.count({
        where: { userId: session.user.id },
      }),
    ]);

    const [totalPosts, weeklyPosts, brandProfiles, socialAccounts] = stats;

    return NextResponse.json({
      totalPosts,
      weeklyPosts,
      brandProfiles,
      socialAccounts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}