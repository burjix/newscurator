import { prisma } from '@/lib/prisma';

/**
 * Cleanup old articles to manage database size
 */
export async function cleanupOldArticles(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete articles older than 30 days with low relevance
    const deletedLowRelevance = await prisma.article.deleteMany({
      where: {
        publishedAt: {
          lt: thirtyDaysAgo
        },
        relevanceScore: {
          lt: 0.3
        },
        posts: {
          none: {} // Not used in any posts
        }
      }
    });

    console.log(`Deleted ${deletedLowRelevance.count} low-relevance articles`);

    // Delete articles older than 90 days regardless of relevance (unless used in posts)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedOld = await prisma.article.deleteMany({
      where: {
        publishedAt: {
          lt: ninetyDaysAgo
        },
        posts: {
          none: {} // Not used in any posts
        }
      }
    });

    console.log(`Deleted ${deletedOld.count} old articles`);

    // Cleanup orphaned data
    await cleanupOrphanedData();
    
    // Optimize database (if needed)
    await optimizeDatabase();

  } catch (error) {
    console.error('Error cleaning up articles:', error);
    throw error;
  }
}

/**
 * Cleanup orphaned data
 */
async function cleanupOrphanedData(): Promise<void> {
  try {
    // Delete social accounts without users
    const orphanedAccounts = await prisma.socialAccount.deleteMany({
      where: {
        user: {
          is: null
        }
      }
    });

    if (orphanedAccounts.count > 0) {
      console.log(`Deleted ${orphanedAccounts.count} orphaned social accounts`);
    }

    // Delete brand profiles without users
    const orphanedProfiles = await prisma.brandProfile.deleteMany({
      where: {
        user: {
          is: null
        }
      }
    });

    if (orphanedProfiles.count > 0) {
      console.log(`Deleted ${orphanedProfiles.count} orphaned brand profiles`);
    }

  } catch (error) {
    console.error('Error cleaning up orphaned data:', error);
  }
}

/**
 * Optimize database performance
 */
async function optimizeDatabase(): Promise<void> {
  try {
    // Run ANALYZE to update statistics
    await prisma.$executeRawUnsafe('ANALYZE;');
    
    console.log('Database optimization completed');
  } catch (error) {
    console.error('Error optimizing database:', error);
  }
}

/**
 * Cleanup failed posts older than 7 days
 */
export async function cleanupFailedPosts(): Promise<void> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deleted = await prisma.post.deleteMany({
      where: {
        status: 'FAILED',
        createdAt: {
          lt: sevenDaysAgo
        }
      }
    });

    if (deleted.count > 0) {
      console.log(`Deleted ${deleted.count} failed posts`);
    }
  } catch (error) {
    console.error('Error cleaning up failed posts:', error);
  }
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const deleted = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });

    if (deleted.count > 0) {
      console.log(`Deleted ${deleted.count} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}