import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';
import { NewsSource, Article } from '@prisma/client';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'NewsCurator/1.0 (RSS Reader)',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
    ]
  }
});

interface ProcessedArticle {
  title: string;
  url: string;
  summary: string | null;
  content: string | null;
  author: string | null;
  publishedAt: Date;
  imageUrl: string | null;
  tags: string[];
  hash: string;
}

/**
 * Process RSS feed for a news source
 */
export async function processRssFeed(sourceId: string): Promise<number> {
  try {
    // Get the news source
    const source = await prisma.newsSource.findUnique({
      where: { id: sourceId },
      include: {
        brandProfile: {
          select: {
            keywords: true,
            excludedKeywords: true,
          }
        }
      }
    });

    if (!source || !source.isActive) {
      console.log(`Source ${sourceId} not found or inactive`);
      return 0;
    }

    // Parse the RSS feed
    const feed = await parser.parseURL(source.url);
    let processedCount = 0;

    // Process each item in the feed
    for (const item of feed.items) {
      try {
        const processed = await processArticle(item, source);
        
        if (processed) {
          // Check if article already exists (by URL hash)
          const existingArticle = await prisma.article.findUnique({
            where: { urlHash: processed.hash }
          });

          if (!existingArticle) {
            // Calculate relevance score based on brand keywords
            const relevanceScore = calculateRelevance(
              processed,
              source.brandProfile.keywords,
              source.brandProfile.excludedKeywords
            );

            // Only save articles with reasonable relevance
            if (relevanceScore > 0.2) {
              await prisma.article.create({
                data: {
                  title: processed.title,
                  url: processed.url,
                  urlHash: processed.hash,
                  summary: processed.summary,
                  content: processed.content,
                  author: processed.author,
                  publishedAt: processed.publishedAt,
                  imageUrl: processed.imageUrl,
                  tags: processed.tags,
                  relevanceScore,
                  sourceId: source.id,
                }
              });
              processedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`Error processing article from ${source.name}:`, error);
      }
    }

    // Update last checked timestamp
    await prisma.newsSource.update({
      where: { id: sourceId },
      data: { 
        lastChecked: new Date(),
        // Update reliability based on success
        reliability: Math.min(1, source.reliability + 0.01)
      }
    });

    return processedCount;
  } catch (error) {
    console.error(`Error processing RSS feed ${sourceId}:`, error);
    
    // Decrease reliability on failure
    await prisma.newsSource.update({
      where: { id: sourceId },
      data: { 
        lastChecked: new Date(),
        reliability: Math.max(0, (await prisma.newsSource.findUnique({
          where: { id: sourceId }
        }))?.reliability || 0.5 - 0.05)
      }
    });
    
    return 0;
  }
}

/**
 * Process a single RSS item into an article
 */
async function processArticle(item: any, source: NewsSource): Promise<ProcessedArticle | null> {
  if (!item.link) return null;

  // Generate URL hash for deduplication
  const urlHash = crypto.createHash('sha256').update(item.link).digest('hex');

  // Extract image URL from various possible fields
  let imageUrl = null;
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    imageUrl = item.enclosure.url;
  } else if (item.mediaContent?.$ && item.mediaContent.$.url) {
    imageUrl = item.mediaContent.$.url;
  } else if (item.mediaThumbnail?.$ && item.mediaThumbnail.$.url) {
    imageUrl = item.mediaThumbnail.$.url;
  }

  // Extract and clean content
  const content = item.contentSnippet || item.content || null;
  const summary = item.contentSnippet || 
    (content ? content.substring(0, 500) : null) ||
    item.title;

  // Extract tags from categories
  const tags: string[] = [];
  if (item.categories && Array.isArray(item.categories)) {
    tags.push(...item.categories.filter((cat: any) => typeof cat === 'string'));
  }

  return {
    title: item.title || 'Untitled',
    url: item.link,
    summary: summary ? summary.substring(0, 500) : null,
    content,
    author: item.creator || item.author || null,
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    imageUrl,
    tags,
    hash: urlHash,
  };
}

/**
 * Calculate relevance score based on keywords
 */
function calculateRelevance(
  article: ProcessedArticle,
  keywords: string[],
  excludedKeywords: string[]
): number {
  const text = `${article.title} ${article.summary || ''} ${article.content || ''}`.toLowerCase();
  
  // Check for excluded keywords (instant disqualification)
  for (const excluded of excludedKeywords) {
    if (text.includes(excluded.toLowerCase())) {
      return 0;
    }
  }

  // Calculate positive matches
  let matches = 0;
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    const occurrences = (text.match(new RegExp(keywordLower, 'g')) || []).length;
    matches += Math.min(occurrences, 3); // Cap at 3 matches per keyword
  }

  // Normalize score (0-1)
  const maxScore = keywords.length * 3;
  return maxScore > 0 ? Math.min(1, matches / maxScore) : 0.5;
}

/**
 * Process all active RSS feeds
 */
export async function processAllFeeds(): Promise<void> {
  const sources = await prisma.newsSource.findMany({
    where: {
      isActive: true,
      OR: [
        { lastChecked: null },
        { 
          lastChecked: {
            lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          }
        }
      ]
    },
    orderBy: [
      { reliability: 'desc' },
      { lastChecked: 'asc' }
    ],
    take: 10 // Process 10 feeds at a time
  });

  const results = await Promise.allSettled(
    sources.map(source => processRssFeed(source.id))
  );

  const totalProcessed = results.reduce((sum, result) => {
    if (result.status === 'fulfilled') {
      return sum + result.value;
    }
    return sum;
  }, 0);

  console.log(`Processed ${totalProcessed} articles from ${sources.length} sources`);
}

/**
 * Fetch latest articles for a brand profile
 */
export async function fetchLatestArticles(
  brandProfileId: string,
  limit: number = 20
): Promise<Article[]> {
  return await prisma.article.findMany({
    where: {
      source: {
        brandProfileId,
        isActive: true
      },
      relevanceScore: {
        gte: 0.3
      }
    },
    orderBy: [
      { relevanceScore: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: limit,
    include: {
      source: {
        select: {
          name: true,
          reliability: true
        }
      }
    }
  });
}