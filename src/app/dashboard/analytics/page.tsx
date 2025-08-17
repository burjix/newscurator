"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  MessageCircle, 
  Share, 
  Eye,
  Users,
  Calendar,
  BarChart3,
  Twitter,
  Linkedin
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalImpressions: number;
    totalEngagement: number;
    totalFollowers: number;
    engagementRate: number;
    trends: {
      impressions: number;
      engagement: number;
      followers: number;
      engagementRate: number;
    };
  };
  platforms: {
    twitter: {
      followers: number;
      posts: number;
      avgEngagement: number;
      topPost: string;
    };
    linkedin: {
      followers: number;
      posts: number;
      avgEngagement: number;
      topPost: string;
    };
  };
  topPosts: Array<{
    id: string;
    content: string;
    platform: string;
    metrics: {
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
    };
    date: string;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedPlatform]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({
        overview: {
          totalImpressions: 45000,
          totalEngagement: 2800,
          totalFollowers: 1250,
          engagementRate: 6.2,
          trends: {
            impressions: 12.5,
            engagement: 8.3,
            followers: 5.1,
            engagementRate: -2.1
          }
        },
        platforms: {
          twitter: {
            followers: 750,
            posts: 28,
            avgEngagement: 3.8,
            topPost: "Our latest AI breakthrough is changing everything..."
          },
          linkedin: {
            followers: 500,
            posts: 15,
            avgEngagement: 7.2,
            topPost: "5 lessons learned from building a SaaS startup..."
          }
        },
        topPosts: [
          {
            id: "1",
            content: "🚀 Excited to share our latest product update! The new AI features are game-changing. What do you think?",
            platform: "twitter",
            metrics: { likes: 124, shares: 23, comments: 18, impressions: 2850 },
            date: "2025-08-15"
          },
          {
            id: "2",
            content: "Building a startup teaches you resilience like nothing else. Here are 5 key lessons from our journey...",
            platform: "linkedin",
            metrics: { likes: 89, shares: 45, comments: 32, impressions: 1920 },
            date: "2025-08-12"
          }
        ]
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">
            Start posting content to see your analytics dashboard
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your social media performance and engagement
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalImpressions)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(data.overview.trends.impressions)}
              <span className={getTrendColor(data.overview.trends.impressions)}>
                {Math.abs(data.overview.trends.impressions)}%
              </span>
              <span>vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalEngagement)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(data.overview.trends.engagement)}
              <span className={getTrendColor(data.overview.trends.engagement)}>
                {Math.abs(data.overview.trends.engagement)}%
              </span>
              <span>vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalFollowers)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(data.overview.trends.followers)}
              <span className={getTrendColor(data.overview.trends.followers)}>
                {Math.abs(data.overview.trends.followers)}%
              </span>
              <span>vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.engagementRate}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(data.overview.trends.engagementRate)}
              <span className={getTrendColor(data.overview.trends.engagementRate)}>
                {Math.abs(data.overview.trends.engagementRate)}%
              </span>
              <span>vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5" />
              Twitter Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{formatNumber(data.platforms.twitter.followers)}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.platforms.twitter.posts}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{data.platforms.twitter.avgEngagement}%</div>
              <div className="text-xs text-muted-foreground">Avg Engagement Rate</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Top Post</div>
              <p className="text-xs text-muted-foreground">{data.platforms.twitter.topPost}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5" />
              LinkedIn Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{formatNumber(data.platforms.linkedin.followers)}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.platforms.linkedin.posts}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{data.platforms.linkedin.avgEngagement}%</div>
              <div className="text-xs text-muted-foreground">Avg Engagement Rate</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Top Post</div>
              <p className="text-xs text-muted-foreground">{data.platforms.linkedin.topPost}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Your best content from the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.platform === "twitter" ? (
                        <Twitter className="h-4 w-4" />
                      ) : (
                        <Linkedin className="h-4 w-4" />
                      )}
                      <Badge variant="outline" className="capitalize">
                        {post.platform}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mb-3 line-clamp-2">{post.content}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.metrics.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share className="h-3 w-3" />
                        {post.metrics.shares}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.metrics.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(post.metrics.impressions)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {((post.metrics.likes + post.metrics.shares + post.metrics.comments) / post.metrics.impressions * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}