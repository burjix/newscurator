"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Twitter, 
  Linkedin, 
  Plus, 
  Settings, 
  Unlink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: "twitter" | "linkedin";
  username: string;
  displayName: string;
  profileImage: string;
  isConnected: boolean;
  isActive: boolean;
  followers: number;
  lastSync: string;
  permissions: string[];
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setAccounts([]);
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: "twitter" | "linkedin") => {
    setConnecting(platform);
    try {
      // TODO: Implement OAuth flow
      // For now, simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAccount: SocialAccount = {
        id: `${platform}_${Date.now()}`,
        platform,
        username: platform === "twitter" ? "@yourhandle" : "your-name",
        displayName: platform === "twitter" ? "Your Twitter" : "Your LinkedIn",
        profileImage: "/placeholder-avatar.png",
        isConnected: true,
        isActive: true,
        followers: platform === "twitter" ? 1250 : 800,
        lastSync: new Date().toISOString(),
        permissions: ["read", "write"]
      };
      
      setAccounts(prev => [...prev, newAccount]);
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      // TODO: API call to disconnect account
      setAccounts(prev => prev.filter(account => account.id !== accountId));
    } catch (error) {
      console.error("Error disconnecting account:", error);
    }
  };

  const toggleAccountStatus = async (accountId: string) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, isActive: !account.isActive }
        : account
    ));
  };

  const refreshAccount = async (accountId: string) => {
    try {
      // TODO: API call to refresh account data
      setAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, lastSync: new Date().toISOString() }
          : account
      ));
    } catch (error) {
      console.error("Error refreshing account:", error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter": return <Twitter className="h-5 w-5" />;
      case "linkedin": return <Linkedin className="h-5 w-5" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "twitter": return "border-blue-200 bg-blue-50";
      case "linkedin": return "border-blue-300 bg-blue-100";
      default: return "border-gray-200 bg-gray-50";
    }
  };

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Social Accounts</h1>
        <p className="text-muted-foreground">
          Connect and manage your social media accounts for posting
        </p>
      </div>

      {/* Available Platforms */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`transition-all hover:shadow-md ${
          accounts.some(a => a.platform === "twitter" && a.isConnected) 
            ? getPlatformColor("twitter") 
            : "border-dashed hover:border-solid"
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Twitter className="h-6 w-6" />
              Twitter
            </CardTitle>
            <CardDescription>
              Post and engage with your Twitter/X audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.find(a => a.platform === "twitter" && a.isConnected) ? (
              <div className="space-y-4">
                {accounts
                  .filter(account => account.platform === "twitter")
                  .map(account => (
                    <div key={account.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Twitter className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{account.displayName}</div>
                            <div className="text-sm text-muted-foreground">{account.username}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {account.isConnected ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-medium">{account.followers.toLocaleString()}</div>
                          <div className="text-muted-foreground">Followers</div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {new Date(account.lastSync).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">Last Sync</div>
                        </div>
                        <div>
                          <div className="font-medium">{account.permissions.length}</div>
                          <div className="text-muted-foreground">Permissions</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={account.isActive ? "secondary" : "default"}
                          size="sm"
                          onClick={() => toggleAccountStatus(account.id)}
                          className="flex-1"
                        >
                          {account.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refreshAccount(account.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectAccount(account.id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  Connect your Twitter account to start posting automatically
                </div>
                <Button 
                  onClick={() => connectAccount("twitter")}
                  disabled={connecting === "twitter"}
                  className="w-full"
                >
                  {connecting === "twitter" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Twitter
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`transition-all hover:shadow-md ${
          accounts.some(a => a.platform === "linkedin" && a.isConnected) 
            ? getPlatformColor("linkedin") 
            : "border-dashed hover:border-solid"
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Linkedin className="h-6 w-6" />
              LinkedIn
            </CardTitle>
            <CardDescription>
              Share professional content with your LinkedIn network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.find(a => a.platform === "linkedin" && a.isConnected) ? (
              <div className="space-y-4">
                {accounts
                  .filter(account => account.platform === "linkedin")
                  .map(account => (
                    <div key={account.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Linkedin className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{account.displayName}</div>
                            <div className="text-sm text-muted-foreground">{account.username}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {account.isConnected ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-medium">{account.followers.toLocaleString()}</div>
                          <div className="text-muted-foreground">Connections</div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {new Date(account.lastSync).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">Last Sync</div>
                        </div>
                        <div>
                          <div className="font-medium">{account.permissions.length}</div>
                          <div className="text-muted-foreground">Permissions</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={account.isActive ? "secondary" : "default"}
                          size="sm"
                          onClick={() => toggleAccountStatus(account.id)}
                          className="flex-1"
                        >
                          {account.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refreshAccount(account.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectAccount(account.id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  Connect your LinkedIn account to share professional content
                </div>
                <Button 
                  onClick={() => connectAccount("linkedin")}
                  disabled={connecting === "linkedin"}
                  className="w-full"
                >
                  {connecting === "linkedin" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Accounts Connected</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Connect your social media accounts to start automating your content posting and grow your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => connectAccount("twitter")}>
                <Twitter className="h-4 w-4 mr-2" />
                Connect Twitter
              </Button>
              <Button variant="outline" onClick={() => connectAccount("linkedin")}>
                <Linkedin className="h-4 w-4 mr-2" />
                Connect LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage how your connected accounts are used for posting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Default Posting Behavior</Label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Auto-post to active accounts</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Cross-post to all platforms</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Sync account data daily</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}