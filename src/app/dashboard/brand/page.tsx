"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Users, Target, Megaphone } from "lucide-react";

interface BrandProfile {
  id: string;
  name: string;
  description: string;
  industry: string;
  targetAudience: string;
  tone: string;
  keywords: string[];
  createdAt: string;
  isActive: boolean;
}

export default function BrandProfilesPage() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      // Mock data for now - replace with API call
      setTimeout(() => {
        setProfiles([]);
        setLoading(false);
      }, 500);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Brand Profiles</h1>
          <p className="text-muted-foreground">
            Manage your brand identities and content preferences
          </p>
        </div>
        <Link href="/dashboard/brand/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Profile
          </Button>
        </Link>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Brand Profiles Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Create your first brand profile to define your content strategy, tone, and target audience for AI-powered news curation.
            </p>
            <Link href="/dashboard/brand/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {profile.description}
                    </CardDescription>
                  </div>
                  <Badge variant={profile.isActive ? "default" : "secondary"}>
                    {profile.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Target className="h-4 w-4 mr-2" />
                  {profile.industry}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {profile.targetAudience}
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.keywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {profile.keywords.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.keywords.length - 3} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/brand/${profile.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/brand/${profile.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{profiles.length}</div>
                <div className="text-xs text-muted-foreground">Total Profiles</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {profiles.filter(p => p.isActive).length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(profiles.map(p => p.industry)).size}
                </div>
                <div className="text-xs text-muted-foreground">Industries</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {profiles.reduce((acc, p) => acc + p.keywords.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Keywords</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}