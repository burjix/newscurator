"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Pause
} from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  platform: "twitter" | "linkedin" | "both";
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt?: string;
  publishedAt?: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  brandProfile: string;
  sourceArticle?: {
    title: string;
    url: string;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts([]);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || post.platform === platformFilter || post.platform === "both";
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled": return <Clock className="h-4 w-4 text-blue-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "draft": return <Pause className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-600";
      case "scheduled": return "text-blue-600";
      case "failed": return "text-red-600";
      case "draft": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "twitter": return <Badge variant="outline">Twitter</Badge>;
      case "linkedin": return <Badge variant="outline">LinkedIn</Badge>;
      case "both": return (
        <div className="flex gap-1">
          <Badge variant="outline">Twitter</Badge>
          <Badge variant="outline">LinkedIn</Badge>
        </div>
      );
      default: return null;
    }
  };

  const duplicatePost = async (postId: string) => {
    try {
      // TODO: API call to duplicate post
      console.log("Duplicating post:", postId);
    } catch (error) {
      console.error("Error duplicating post:", error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      // TODO: API call to delete post
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Manage your social media posts and content calendar
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Create your first social media post using AI-powered content generation or start from scratch.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/dashboard/posts/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  </Link>
                  <Link href="/dashboard/content">
                    <Button variant="outline">
                      Browse Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(post.status)}
                            <span className={`text-sm font-medium capitalize ${getStatusColor(post.status)}`}>
                              {post.status}
                            </span>
                          </div>
                          {getPlatformBadge(post.platform)}
                          <Badge variant="secondary">{post.brandProfile}</Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm line-clamp-3 whitespace-pre-wrap">
                            {post.content}
                          </p>
                        </div>

                        {post.sourceArticle && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Source:</span>
                            <a 
                              href={post.sourceArticle.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-foreground underline truncate"
                            >
                              {post.sourceArticle.title}
                            </a>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {post.scheduledAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                            </div>
                          )}
                          {post.publishedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Published: {new Date(post.publishedAt).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {post.status === "published" && (
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>❤️ {post.engagement.likes}</span>
                            <span>🔄 {post.engagement.shares}</span>
                            <span>💬 {post.engagement.comments}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col gap-2 lg:w-32">
                        <Link href={`/dashboard/posts/${post.id}/edit`} className="flex-1 lg:flex-none">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicatePost(post.id)}
                          className="flex-1 lg:flex-none"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                          className="flex-1 lg:flex-none text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tabs would filter the same posts array */}
        <TabsContent value="draft">
          <div>Drafts view (same as all but filtered)</div>
        </TabsContent>
        <TabsContent value="scheduled">
          <div>Scheduled view (same as all but filtered)</div>
        </TabsContent>
        <TabsContent value="published">
          <div>Published view (same as all but filtered)</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}