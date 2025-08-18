import OpenAI from 'openai';
import { Article, BrandProfile } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * Generate social media content using OpenAI
 */
export async function generateAIContent(options: ContentOptions): Promise<GeneratedContent> {
  const { article, brandProfile, platform, includeHashtags = true, includeLink = true } = options;
  
  // Build the prompt based on platform and brand profile
  const prompt = buildPrompt(options);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert social media content creator. Create engaging, authentic posts that drive engagement while maintaining brand voice and platform best practices."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: platform === 'twitter' ? 280 : 1000,
      temperature: 0.7,
    });

    const generatedText = response.choices[0]?.message?.content || '';
    
    // Extract hashtags if requested
    let hashtags: string[] = [];
    let finalText = generatedText;
    
    if (includeHashtags) {
      const hashtagMatches = generatedText.match(/#\w+/g);
      if (hashtagMatches) {
        hashtags = hashtagMatches;
        // Remove hashtags from text for cleaner separation
        finalText = generatedText.replace(/#\w+/g, '').trim();
      } else {
        // Generate hashtags separately if not included in text
        hashtags = await generateHashtags(article, brandProfile, platform);
      }
    }

    return {
      text: finalText,
      hashtags,
      platform
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template-based generation
    return await generateFallbackContent(options);
  }
}

/**
 * Generate multiple content variations using OpenAI
 */
export async function generateAIContentVariations(
  options: ContentOptions,
  count: number = 3
): Promise<GeneratedContent[]> {
  const variations: GeneratedContent[] = [];
  
  // Generate variations with slightly different prompts
  const toneVariations = ['professional', 'engaging', 'conversational'];
  
  for (let i = 0; i < count; i++) {
    const modifiedOptions = {
      ...options,
      customInstructions: `${options.customInstructions || ''} Use a ${toneVariations[i % toneVariations.length]} tone. Make this variation ${i + 1} unique from others.`
    };
    
    try {
      const content = await generateAIContent(modifiedOptions);
      variations.push(content);
    } catch (error) {
      console.error(`Error generating variation ${i + 1}:`, error);
      // Add fallback content for failed variations
      const fallback = await generateFallbackContent(modifiedOptions);
      variations.push(fallback);
    }
  }
  
  return variations;
}

/**
 * Build AI prompt based on content options
 */
function buildPrompt(options: ContentOptions): string {
  const { article, brandProfile, platform, tone, includeHashtags, includeLink, customInstructions } = options;
  
  const platformLimits = {
    twitter: '280 characters',
    linkedin: '1300 characters',
    facebook: '500 characters'
  };
  
  const brandTone = typeof brandProfile.voiceTone === 'string' 
    ? brandProfile.voiceTone.toLowerCase() 
    : 'professional';
  
  const industry = Array.isArray(brandProfile.industry) 
    ? brandProfile.industry.join(', ') 
    : 'general business';
  
  const keywords = Array.isArray(brandProfile.keywords) 
    ? brandProfile.keywords.join(', ') 
    : '';

  let prompt = `Create a ${platform} post about this article:

ARTICLE:
Title: ${article.title}
Summary: ${article.summary || 'No summary available'}
URL: ${article.url}

BRAND CONTEXT:
Industry: ${industry}
Voice/Tone: ${brandTone}
Keywords: ${keywords}

REQUIREMENTS:
- Platform: ${platform} (max ${platformLimits[platform]})
- Tone: ${tone || brandTone}
- Make it engaging and authentic
- Focus on value for the audience
- Don't sound like AI-generated content`;

  if (includeHashtags) {
    prompt += `
- Include 2-5 relevant hashtags`;
  }

  if (includeLink) {
    prompt += `
- Include the article URL: ${article.url}`;
  }

  if (platform === 'twitter') {
    prompt += `
- Keep under 280 characters total
- Make it punchy and shareable`;
  } else if (platform === 'linkedin') {
    prompt += `
- Professional tone appropriate for LinkedIn
- Can be longer and more detailed
- Encourage discussion and engagement`;
  } else if (platform === 'facebook') {
    prompt += `
- Conversational and accessible
- Encourage comments and sharing`;
  }

  if (customInstructions) {
    prompt += `

CUSTOM INSTRUCTIONS:
${customInstructions}`;
  }

  return prompt;
}

/**
 * Generate hashtags using AI
 */
async function generateHashtags(
  article: Article, 
  brandProfile: BrandProfile, 
  platform: string
): Promise<string[]> {
  const maxHashtags = platform === 'twitter' ? 3 : 5;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate relevant, trending hashtags for social media posts. Return only the hashtags, one per line, with # symbols."
        },
        {
          role: "user",
          content: `Generate ${maxHashtags} hashtags for this content:
          
Article: ${article.title}
Industry: ${Array.isArray(brandProfile.industry) ? brandProfile.industry.join(', ') : 'general'}
Platform: ${platform}

Focus on trending, relevant hashtags that will increase reach and engagement.`
        }
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const hashtagText = response.choices[0]?.message?.content || '';
    return hashtagText
      .split('\n')
      .filter(line => line.trim().startsWith('#'))
      .slice(0, maxHashtags);
  } catch (error) {
    console.error('Error generating hashtags:', error);
    return [];
  }
}

/**
 * Fallback to template-based generation
 */
async function generateFallbackContent(options: ContentOptions): Promise<GeneratedContent> {
  // Import the template-based generator
  const { generateContent } = await import('./ai-content-generator');
  return await generateContent(options);
}

/**
 * Analyze content engagement potential
 */
export async function analyzeContentEngagement(content: string, platform: string): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a social media engagement expert. Analyze content and predict its engagement potential on a scale of 0-1."
        },
        {
          role: "user",
          content: `Analyze this ${platform} post for engagement potential:

"${content}"

Rate from 0-1 based on:
- Call to action presence
- Emotional appeal
- Relevance and value
- Platform optimization
- Shareability factor

Return only the numeric score (e.g., 0.85).`
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const scoreText = response.choices[0]?.message?.content?.trim() || '0.5';
    return Math.max(0, Math.min(1, parseFloat(scoreText) || 0.5));
  } catch (error) {
    console.error('Error analyzing engagement:', error);
    return 0.5;
  }
}

/**
 * Optimize posting time using AI insights
 */
export async function getOptimalPostingTime(
  platform: string, 
  industry: string, 
  timezone: string = 'UTC'
): Promise<Date> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a social media timing expert. Suggest optimal posting times based on platform algorithms and audience behavior."
        },
        {
          role: "user",
          content: `What's the optimal posting time for:
Platform: ${platform}
Industry: ${industry}
Timezone: ${timezone}

Current time: ${new Date().toISOString()}

Return the optimal posting time in ISO format for the next 48 hours.`
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    const timeText = response.choices[0]?.message?.content?.trim() || '';
    const suggestedTime = new Date(timeText);
    
    // Validate the suggested time
    if (isNaN(suggestedTime.getTime()) || suggestedTime < new Date()) {
      // Fallback to standard optimal times
      return getStandardOptimalTime(platform);
    }
    
    return suggestedTime;
  } catch (error) {
    console.error('Error getting optimal posting time:', error);
    return getStandardOptimalTime(platform);
  }
}

/**
 * Standard optimal posting times as fallback
 */
function getStandardOptimalTime(platform: string): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const optimalHours = {
    twitter: [9, 12, 15, 18],
    linkedin: [8, 12, 17, 19],
    facebook: [9, 13, 15]
  };
  
  const hours = optimalHours[platform as keyof typeof optimalHours] || [9, 12, 15];
  const randomHour = hours[Math.floor(Math.random() * hours.length)];
  
  tomorrow.setHours(randomHour, 0, 0, 0);
  return tomorrow;
}