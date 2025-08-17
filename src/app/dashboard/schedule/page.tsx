"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Twitter,
  Linkedin,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";

interface ScheduledPost {
  id: string;
  content: string;
  platform: "twitter" | "linkedin" | "both";
  scheduledAt: string;
  status: "scheduled" | "publishing" | "published" | "failed";
  brandProfile: string;
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts([]);
    } catch (error) {
      console.error("Error loading scheduled posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter": return <Twitter className="h-3 w-3" />;
      case "linkedin": return <Linkedin className="h-3 w-3" />;
      case "both": return (
        <div className="flex gap-1">
          <Twitter className="h-3 w-3" />
          <Linkedin className="h-3 w-3" />
        </div>
      );
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "publishing": return "bg-yellow-100 text-yellow-800";
      case "published": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Content Schedule</h1>
          <p className="text-muted-foreground">
            Plan and manage your social media posting schedule
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Post
          </Button>
        </Link>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[200px] text-center">
                  {viewMode === "week" 
                    ? `Week of ${currentDate.toLocaleDateString()}`
                    : currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })
                  }
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={viewMode} onValueChange={(value: "week" | "month") => setViewMode(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Scheduled Posts</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Schedule your first post to see it appear on the calendar. You can plan your content strategy and maintain a consistent posting schedule.
              </p>
              <Link href="/dashboard/posts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {viewMode === "week" ? (
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <div key={index} className="text-center font-medium text-sm p-2 border-b">
                      {day}
                    </div>
                  ))}
                  {getWeekDays().map((day, index) => {
                    const dayPosts = getPostsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[120px] p-2 border rounded-lg ${
                          isToday ? 'bg-primary/5 border-primary' : 'bg-background'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayPosts.map((post) => (
                            <div 
                              key={post.id} 
                              className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 ${getStatusColor(post.status)}`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {getPlatformIcon(post.platform)}
                                <span>{formatTime(post.scheduledAt)}</span>
                              </div>
                              <div className="line-clamp-2">{post.content.substring(0, 50)}...</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <div key={index} className="text-center font-medium text-sm p-2">
                      {day}
                    </div>
                  ))}
                  {getMonthDays().map((day, index) => {
                    const dayPosts = getPostsForDate(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[80px] p-1 border ${
                          !isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : 
                          isToday ? 'bg-primary/5 border-primary' : 'bg-background'
                        }`}
                      >
                        <div className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                          {day.getDate()}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayPosts.slice(0, 2).map((post) => (
                            <div 
                              key={post.id} 
                              className={`w-2 h-2 rounded-full ${getStatusColor(post.status).split(' ')[0]}`}
                            />
                          ))}
                          {dayPosts.length > 2 && (
                            <div className="text-xs">+{dayPosts.length - 2}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Posts</CardTitle>
          <CardDescription>Next posts in your schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No upcoming posts scheduled
            </p>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getPlatformIcon(post.platform)}
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.scheduledAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm truncate">{post.content}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}