import { Article, BrandProfile } from '@prisma/client';

interface GeneratedContent {
  text: string;
  hashtags: string[];
  platform: 'twitter' | 'linkedin' | 'facebook';
}

interface ContentOptions {
  article: Article;
  brandProfile: BrandProfile;
  platform: 'twitter' | 'linkedin' | 'facebook';
  tone?: string;
  includeHashtags?: boolean;
  includeLink?: boolean;
  customInstructions?: string;
}

/**
 * Generate social media content from an article using AI or templates
 */
export async function generateContent(options: ContentOptions): Promise<GeneratedContent> {
  const { article, brandProfile, platform, includeHashtags = true, includeLink = true } = options;
  
  // For now, use template-based generation
  // In production, this would integrate with OpenAI/Anthropic API
  
  let content = '';
  let hashtags: string[] = [];
  
  switch (platform) {
    case 'twitter':
      content = generateTwitterContent(article, brandProfile, includeLink);
      if (includeHashtags) {
        hashtags = generateHashtags(article, brandProfile, 3); // Max 3 for Twitter
      }
      break;
      
    case 'linkedin':
      content = generateLinkedInContent(article, brandProfile, includeLink);
      if (includeHashtags) {
        hashtags = generateHashtags(article, brandProfile, 5); // More for LinkedIn
      }
      break;
      
    case 'facebook':
      content = generateFacebookContent(article, brandProfile, includeLink);
      if (includeHashtags) {
        hashtags = generateHashtags(article, brandProfile, 5);
      }
      break;
  }
  
  return {
    text: content,
    hashtags,
    platform
  };
}

/**
 * Generate Twitter-optimized content (280 chars)
 */
function generateTwitterContent(
  article: any,
  profile: BrandProfile,
  includeLink: boolean
): string {
  const toneTemplates = {
    PROFESSIONAL: [
      `${truncateForTwitter(article.title, 200)}\n\n${includeLink ? article.url : ''}`,
      `Industry insight: ${truncateForTwitter(article.summary || article.title, 180)}\n\n${includeLink ? article.url : ''}`,
      `New development in ${profile.industry}: ${truncateForTwitter(article.title, 160)}\n\n${includeLink ? article.url : ''}`
    ],
    CASUAL: [
      `Check this out! ${truncateForTwitter(article.title, 180)} 👀\n\n${includeLink ? article.url : ''}`,
      `Interesting: ${truncateForTwitter(article.summary || article.title, 180)}\n\n${includeLink ? article.url : ''}`,
      `Worth reading: ${truncateForTwitter(article.title, 180)}\n\n${includeLink ? article.url : ''}`
    ],
    FORMAL: [
      `${truncateForTwitter(article.title, 200)}\n\nSource: ${article.source?.name || 'Industry News'}\n${includeLink ? article.url : ''}`,
      `Recent report: ${truncateForTwitter(article.title, 180)}\n\n${includeLink ? article.url : ''}`
    ],
    HUMOROUS: [
      `Plot twist in ${profile.industry}! 🎭\n\n${truncateForTwitter(article.title, 160)}\n\n${includeLink ? article.url : ''}`,
      `Well, this is interesting... ${truncateForTwitter(article.title, 160)}\n\n${includeLink ? article.url : ''}`
    ]
  };
  
  const tone = (profile.voiceTone || 'PROFESSIONAL') as keyof typeof toneTemplates;
  const templates = toneTemplates[tone] || toneTemplates.PROFESSIONAL;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template.trim();
}

/**
 * Generate LinkedIn-optimized content (longer form)
 */
function generateLinkedInContent(
  article: any,
  profile: BrandProfile,
  includeLink: boolean
): string {
  const intro = getLinkedInIntro(article, profile);
  const keyPoints = extractKeyPoints(article, 3);
  const conclusion = getLinkedInConclusion(profile);
  
  let content = `${intro}\n\n`;
  
  if (keyPoints.length > 0) {
    content += `Key takeaways:\n`;
    keyPoints.forEach((point, i) => {
      content += `${i + 1}. ${point}\n`;
    });
    content += '\n';
  }
  
  content += conclusion;
  
  if (includeLink) {
    content += `\n\nRead more: ${article.url}`;
  }
  
  return content.trim();
}

/**
 * Generate Facebook-optimized content
 */
function generateFacebookContent(
  article: any,
  profile: BrandProfile,
  includeLink: boolean
): string {
  const intro = getFacebookIntro(article, profile);
  const summary = article.summary || article.title;
  
  let content = `${intro}\n\n${summary}`;
  
  if (profile.voiceTone === 'CASUAL' || profile.voiceTone === 'HUMOROUS') {
    content += `\n\nWhat are your thoughts on this?`;
  } else {
    content += `\n\nYour insights on this topic would be valuable.`;
  }
  
  if (includeLink) {
    content += `\n\n${article.url}`;
  }
  
  return content.trim();
}

/**
 * Generate relevant hashtags
 */
function generateHashtags(
  article: any,
  profile: BrandProfile,
  maxCount: number
): string[] {
  const hashtags: string[] = [];
  
  // Add industry hashtag
  if (profile.industry) {
    hashtags.push(profile.industry.toLowerCase().replace(/\s+/g, ''));
  }
  
  // Add niche hashtag
  if (profile.niche) {
    hashtags.push(profile.niche.toLowerCase().replace(/\s+/g, ''));
  }
  
  // Extract hashtags from article tags
  if (article.tags && Array.isArray(article.tags)) {
    const articleTags = article.tags
      .slice(0, maxCount - hashtags.length)
      .map((tag: string) => tag.toLowerCase().replace(/\s+/g, ''));
    hashtags.push(...articleTags);
  }
  
  // Add topic-based hashtags
  if (article.topics && Array.isArray(article.topics)) {
    const topicTags = article.topics
      .slice(0, maxCount - hashtags.length)
      .map((topic: string) => topic.toLowerCase().replace(/\s+/g, ''));
    hashtags.push(...topicTags);
  }
  
  // Ensure uniqueness and format
  return [...new Set(hashtags)]
    .slice(0, maxCount)
    .map(tag => `#${tag}`);
}

/**
 * Helper functions
 */
function truncateForTwitter(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function extractKeyPoints(article: any, maxPoints: number): string[] {
  const content = article.summary || article.content || '';
  const sentences = content.split('. ').filter((s: string) => s.length > 20);
  return sentences.slice(0, maxPoints);
}

function getLinkedInIntro(article: any, profile: BrandProfile): string {
  const intros = [
    `Sharing an important development in ${profile.industry}:`,
    `This caught my attention and I thought it might interest you:`,
    `Latest insights from the ${profile.industry} sector:`,
    `Worth discussing with the community:`,
  ];
  return intros[Math.floor(Math.random() * intros.length)];
}

function getLinkedInConclusion(profile: BrandProfile): string {
  const conclusions = [
    `What's your perspective on this?`,
    `I'd love to hear your thoughts.`,
    `How do you see this impacting ${profile.industry}?`,
    `Share your insights below.`,
  ];
  return conclusions[Math.floor(Math.random() * conclusions.length)];
}

function getFacebookIntro(article: any, profile: BrandProfile): string {
  const tone = profile.voiceTone || 'PROFESSIONAL';
  
  const intros = {
    PROFESSIONAL: [
      `Important update for those following ${profile.industry} trends:`,
      `Sharing this relevant article:`,
    ],
    CASUAL: [
      `Hey everyone! Found this interesting piece:`,
      `Thought you might find this useful:`,
    ],
    FORMAL: [
      `For your consideration:`,
      `Industry update:`,
    ],
    HUMOROUS: [
      `Well, this is something! 😄`,
      `You might want to see this:`,
    ]
  };
  
  const toneIntros = intros[tone as keyof typeof intros] || intros.PROFESSIONAL;
  return toneIntros[Math.floor(Math.random() * toneIntros.length)];
}

/**
 * Generate multiple content variations
 */
export async function generateContentVariations(
  options: ContentOptions,
  count: number = 3
): Promise<GeneratedContent[]> {
  const variations: GeneratedContent[] = [];
  
  for (let i = 0; i < count; i++) {
    const content = await generateContent(options);
    variations.push(content);
  }
  
  return variations;
}

/**
 * Score content quality
 */
export function scoreContent(content: string, platform: string): number {
  let score = 0;
  
  // Length optimization
  if (platform === 'twitter') {
    if (content.length > 100 && content.length < 250) score += 0.3;
  } else if (platform === 'linkedin') {
    if (content.length > 500 && content.length < 1500) score += 0.3;
  }
  
  // Engagement elements
  if (content.includes('?')) score += 0.2; // Questions encourage engagement
  if (content.match(/\d\./)) score += 0.1; // Numbered lists
  if (content.includes('\n')) score += 0.1; // Good formatting
  
  // Call to action
  const ctaPhrases = ['thoughts', 'perspective', 'insights', 'discuss', 'share'];
  if (ctaPhrases.some(phrase => content.toLowerCase().includes(phrase))) {
    score += 0.2;
  }
  
  // Hashtags (if present)
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (hashtagCount > 0 && hashtagCount <= 5) score += 0.1;
  
  return Math.min(1, score);
}