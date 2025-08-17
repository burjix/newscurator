"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Globe, Rss, X, ExternalLink, Settings } from "lucide-react";

interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: "rss" | "website" | "social";
  category: string;
  isActive: boolean;
  lastFetched: string;
  articlesCount: number;
  reliability: number;
}

const SUGGESTED_SOURCES = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "Technology", type: "rss" as const },
  { name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews", category: "Business", type: "rss" as const },
  { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", category: "General", type: "rss" as const },
  { name: "Harvard Business Review", url: "https://feeds.hbr.org/harvardbusiness", category: "Business", type: "rss" as const },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "Technology", type: "rss" as const },
  { name: "Fast Company", url: "https://www.fastcompany.com/latest/rss", category: "Business", type: "rss" as const }
];

export default function NewsSourcesPage() {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [addingSource, setAddingSource] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setSources([]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || source.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addSuggestedSource = async (suggested: typeof SUGGESTED_SOURCES[0]) => {
    try {
      // TODO: Replace with actual API call
      console.log("Adding source:", suggested);
      // Simulate adding source
    } catch (error) {
      console.error("Error adding source:", error);
    }
  };

  const addCustomSource = async () => {
    if (!newSourceUrl.trim()) return;
    
    setAddingSource(true);
    try {
      // TODO: Replace with actual API call to validate and add source
      console.log("Adding custom source:", newSourceUrl);
      setNewSourceUrl("");
    } catch (error) {
      console.error("Error adding custom source:", error);
    } finally {
      setAddingSource(false);
    }
  };

  const toggleSourceStatus = async (sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, isActive: !source.isActive }
        : source
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          <div className="h-24 bg-muted rounded animate-pulse" />
          <div className="h-24 bg-muted rounded animate-pulse" />
          <div className="h-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">News Sources</h1>
        <p className="text-muted-foreground">
          Manage RSS feeds and news sources for content discovery
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Sources</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="custom">Add Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {sources.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Rss className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No News Sources Yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Add RSS feeds and news sources to start discovering relevant content for your brand.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => {
                    const tab = document.querySelector('[data-state="inactive"][value="discover"]') as HTMLElement;
                    tab?.click();
                  }}>
                    Browse Suggested Sources
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const tab = document.querySelector('[data-state="inactive"][value="custom"]') as HTMLElement;
                    tab?.click();
                  }}>
                    Add Custom Source
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredSources.map((source) => (
                  <Card key={source.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{source.name}</h3>
                            <Badge variant={source.isActive ? "default" : "secondary"}>
                              {source.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{source.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Articles: {source.articlesCount}</span>
                            <span>Last fetched: {source.lastFetched}</span>
                            <span>Reliability: {source.reliability}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(source.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={source.isActive ? "secondary" : "default"}
                            size="sm"
                            onClick={() => toggleSourceStatus(source.id)}
                          >
                            {source.isActive ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suggested News Sources</CardTitle>
              <CardDescription>
                Popular and reliable news sources across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {SUGGESTED_SOURCES.map((source, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{source.name}</h4>
                        <Badge variant="outline">{source.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => addSuggestedSource(source)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Source</CardTitle>
              <CardDescription>
                Add your own RSS feeds or news sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter RSS feed URL or website..."
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={addCustomSource}
                  disabled={!newSourceUrl.trim() || addingSource}
                >
                  {addingSource ? "Adding..." : "Add Source"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Supported formats:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>RSS feeds (.xml, .rss)</li>
                  <li>Atom feeds</li>
                  <li>JSON feeds</li>
                  <li>Website URLs (we'll try to find RSS feeds automatically)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}