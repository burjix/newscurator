"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, 
  Save, 
  Calendar, 
  Send, 
  Twitter, 
  Linkedin, 
  RotateCcw,
  Lightbulb,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

interface PostData {
  content: string;
  platform: "twitter" | "linkedin" | "both";
  brandProfile: string;
  scheduledAt?: string;
  isDraft: boolean;
}

export default function NewPostPage() {
  const router = useRouter();
  const [postData, setPostData] = useState<PostData>({
    content: "",
    platform: "both",
    brandProfile: "",
    isDraft: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const maxChars = postData.platform === "twitter" ? 280 : 3000;

  const handleContentChange = (content: string) => {
    setPostData(prev => ({ ...prev, content }));
    setCharacterCount(content.length);
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      // TODO: Call AI API to generate content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent = "🚀 The future of AI is here! Exciting developments in machine learning are transforming how we work and innovate. What trends are you most excited about? #AI #Innovation #Tech";
      setPostData(prev => ({ ...prev, content: generatedContent }));
      setCharacterCount(generatedContent.length);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const improvWithAI = async () => {
    if (!postData.content.trim()) return;
    
    setIsGenerating(true);
    try {
      // TODO: Call AI API to improve existing content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const improvedContent = postData.content + "\n\nWhat's your take on this? 💭";
      setPostData(prev => ({ ...prev, content: improvedContent }));
      setCharacterCount(improvedContent.length);
    } catch (error) {
      console.error("Error improving content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      // TODO: Call AI API for suggestions
      setSuggestions([
        "Add relevant hashtags",
        "Include a call-to-action",
        "Mention industry trends",
        "Add emojis for engagement",
        "Include a question for audience interaction"
      ]);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  const savePost = async (publish = false) => {
    setIsSaving(true);
    try {
      // TODO: Call API to save/publish post
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (publish) {
        router.push("/dashboard/posts?published=true");
      } else {
        router.push("/dashboard/posts?saved=true");
      }
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const schedulePost = async () => {
    if (!postData.scheduledAt) return;
    
    setIsSaving(true);
    try {
      // TODO: Call API to schedule post
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push("/dashboard/posts?scheduled=true");
    } catch (error) {
      console.error("Error scheduling post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create Post</h1>
        <p className="text-muted-foreground">
          Craft engaging social media content with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Post Content
              </CardTitle>
              <CardDescription>
                Write your post or use AI to generate content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content">Content</Label>
                  <span className={`text-sm ${characterCount > maxChars ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {characterCount}/{maxChars}
                  </span>
                </div>
                <Textarea
                  id="content"
                  placeholder="What's on your mind? Use AI to help generate engaging content..."
                  value={postData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={maxChars}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateWithAI}
                  disabled={isGenerating}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
                
                {postData.content && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={improvWithAI}
                    disabled={isGenerating}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Improve with AI
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSuggestions}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Suggestions
                </Button>
              </div>

              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <Label>AI Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-accent">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select 
                    value={postData.platform} 
                    onValueChange={(value: "twitter" | "linkedin" | "both") => 
                      setPostData(prev => ({ ...prev, platform: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          <Linkedin className="h-4 w-4" />
                          Both
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand Profile</Label>
                  <Select 
                    value={postData.brandProfile} 
                    onValueChange={(value) => setPostData(prev => ({ ...prev, brandProfile: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Brand</SelectItem>
                      <SelectItem value="company">Company Profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Schedule Post (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={postData.scheduledAt || ""}
                  onChange={(e) => setPostData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => savePost(false)}
                disabled={!postData.content.trim() || isSaving}
                className="w-full"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              
              {postData.scheduledAt ? (
                <Button 
                  onClick={schedulePost}
                  disabled={!postData.content.trim() || !postData.brandProfile || isSaving}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Post
                </Button>
              ) : (
                <Button 
                  onClick={() => savePost(true)}
                  disabled={!postData.content.trim() || !postData.brandProfile || isSaving}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {postData.content ? (
                <div className="space-y-3">
                  <div className="border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      {postData.platform === "twitter" && <Twitter className="h-4 w-4" />}
                      {postData.platform === "linkedin" && <Linkedin className="h-4 w-4" />}
                      {postData.platform === "both" && (
                        <>
                          <Twitter className="h-4 w-4" />
                          <Linkedin className="h-4 w-4" />
                        </>
                      )}
                      <span className="text-sm font-medium">Preview</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{postData.content}</p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Characters: {characterCount}/{maxChars}</div>
                    {postData.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(postData.scheduledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Start writing to see a preview of your post
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Tag relevant people or brands</span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Use trending hashtags</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Ask questions to boost engagement</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}