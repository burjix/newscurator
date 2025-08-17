"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  BookmarkPlus, 
  ExternalLink, 
  Clock, 
  TrendingUp,
  Bookmark,
  Share,
  MoreVertical,
  RefreshCw
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  readTime: number;
  relevanceScore: number;
  isBookmarked: boolean;
  isUsed: boolean;
  sentiment: "positive" | "neutral" | "negative";
  keywords: string[];
}

export default function ContentLibraryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setArticles([]);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async () => {
    setRefreshing(true);
    try {
      // TODO: Call API to refresh content from sources
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error refreshing content:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleBookmark = async (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isBookmarked: !article.isBookmarked }
        : article
    ));
  };

  const generatePost = async (articleId: string) => {
    try {
      // TODO: Navigate to post composer with article data
      console.log("Generating post for article:", articleId);
    } catch (error) {
      console.error("Error generating post:", error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
          <h1 className="text-2xl sm:text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Discover and curate relevant news articles for your brand
          </p>
        </div>
        <Button 
          onClick={refreshContent}
          disabled={refreshing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? "Refreshing..." : "Refresh Content"}
        </Button>
      </div>

      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="used">Used</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="source">Source</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="discover" className="space-y-4">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Add news sources and create a brand profile to start discovering relevant content.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => window.location.href = '/dashboard/sources'}>
                    Add News Sources
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard/brand'}>
                    Setup Brand Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{article.category}</Badge>
                          <Badge variant="secondary">{article.source}</Badge>
                          <span className={`text-xs font-medium ${getRelevanceColor(article.relevanceScore)}`}>
                            {article.relevanceScore}% match
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {article.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min read
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span className={getSentimentColor(article.sentiment)}>
                              {article.sentiment}
                            </span>
                          </div>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {article.keywords.slice(0, 4).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {article.keywords.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.keywords.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2 lg:w-32">
                        <Button
                          variant={article.isBookmarked ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleBookmark(article.id)}
                          className="flex-1 lg:flex-none"
                        >
                          <Bookmark className="h-4 w-4 mr-2" />
                          {article.isBookmarked ? "Saved" : "Save"}
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => generatePost(article.id)}
                          className="flex-1 lg:flex-none"
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Generate Post
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(article.url, '_blank')}
                          className="flex-1 lg:flex-none"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarked" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Bookmarked Articles</h3>
              <p className="text-muted-foreground">
                Bookmark articles from the Discover tab to save them for later.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="used" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Share className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Posts Created Yet</h3>
              <p className="text-muted-foreground">
                Articles you use to create posts will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}