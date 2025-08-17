"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "E-commerce", "Education", "Real Estate",
  "Marketing", "Manufacturing", "Food & Beverage", "Travel", "Fashion", "Sports",
  "Entertainment", "Automotive", "Energy", "Legal", "Non-profit", "Other"
];

const TONES = [
  { value: "professional", label: "Professional", description: "Formal and business-focused" },
  { value: "casual", label: "Casual", description: "Friendly and conversational" },
  { value: "authoritative", label: "Authoritative", description: "Expert and informative" },
  { value: "playful", label: "Playful", description: "Fun and engaging" },
  { value: "inspirational", label: "Inspirational", description: "Motivational and uplifting" },
  { value: "educational", label: "Educational", description: "Informative and teaching-focused" }
];

const TARGET_AUDIENCES = [
  "Business Professionals", "Entrepreneurs", "Small Business Owners", "Marketing Professionals",
  "Tech Enthusiasts", "Students", "Consumers", "Industry Experts", "General Public",
  "Decision Makers", "Startups", "Enterprise", "Freelancers", "Investors"
];

export default function NewBrandProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    targetAudience: "",
    tone: "",
    keywords: [] as string[],
    contentTypes: [] as string[],
    postingFrequency: "daily",
    autoPosting: true
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Brand name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.targetAudience) newErrors.targetAudience = "Target audience is required";
    if (!formData.tone) newErrors.tone = "Brand tone is required";
    if (formData.keywords.length < 3) newErrors.keywords = "At least 3 keywords are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      router.push("/dashboard/brand?created=true");
    } catch (error) {
      console.error("Error creating brand profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create Brand Profile</h1>
        <p className="text-muted-foreground">
          Define your brand identity for AI-powered content curation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Start with the fundamentals of your brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                placeholder="e.g., TechCorp, My Personal Brand"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what your brand does and its mission..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? "border-destructive" : ""}
                rows={3}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-destructive">{errors.industry}</p>}
              </div>

              <div className="space-y-2">
                <Label>Target Audience *</Label>
                <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                  <SelectTrigger className={errors.targetAudience ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_AUDIENCES.map((audience) => (
                      <SelectItem key={audience} value={audience.toLowerCase()}>
                        {audience}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.targetAudience && <p className="text-sm text-destructive">{errors.targetAudience}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand Voice & Tone</CardTitle>
            <CardDescription>
              Define how your brand communicates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Brand Tone *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TONES.map((tone) => (
                  <div
                    key={tone.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.tone === tone.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, tone: tone.value }))}
                  >
                    <div className="font-medium">{tone.label}</div>
                    <div className="text-sm text-muted-foreground">{tone.description}</div>
                  </div>
                ))}
              </div>
              {errors.tone && <p className="text-sm text-destructive">{errors.tone}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
            <CardDescription>
              Help AI understand what content to find for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Keywords & Topics *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword or topic"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                />
                <Button type="button" onClick={addKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {formData.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
              {errors.keywords && <p className="text-sm text-destructive">{errors.keywords}</p>}
              <p className="text-sm text-muted-foreground">
                Add relevant keywords, topics, or industry terms ({formData.keywords.length}/∞)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Creating..." : "Create Brand Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}