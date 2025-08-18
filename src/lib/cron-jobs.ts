import { processAllFeeds } from '@/lib/rss-processor';
import { generateScheduledPosts } from '@/lib/post-scheduler';
import { cleanupOldArticles } from '@/lib/cleanup';

interface CronJob {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  isRunning: boolean;
}

class CronManager {
  private jobs: Map<string, CronJob> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeJobs();
  }

  private initializeJobs() {
    // Process RSS feeds every 30 minutes
    this.addJob({
      name: 'process-rss-feeds',
      schedule: '*/30 * * * *', // Every 30 minutes
      handler: async () => {
        console.log('[CRON] Starting RSS feed processing...');
        try {
          await processAllFeeds();
          console.log('[CRON] RSS feed processing completed');
        } catch (error) {
          console.error('[CRON] RSS feed processing failed:', error);
        }
      },
      isRunning: false
    });

    // Generate scheduled posts every hour
    this.addJob({
      name: 'generate-scheduled-posts',
      schedule: '0 * * * *', // Every hour
      handler: async () => {
        console.log('[CRON] Starting scheduled post generation...');
        try {
          await generateScheduledPosts();
          console.log('[CRON] Scheduled post generation completed');
        } catch (error) {
          console.error('[CRON] Scheduled post generation failed:', error);
        }
      },
      isRunning: false
    });

    // Cleanup old articles daily at 3 AM
    this.addJob({
      name: 'cleanup-old-articles',
      schedule: '0 3 * * *', // Daily at 3 AM
      handler: async () => {
        console.log('[CRON] Starting article cleanup...');
        try {
          await cleanupOldArticles();
          console.log('[CRON] Article cleanup completed');
        } catch (error) {
          console.error('[CRON] Article cleanup failed:', error);
        }
      },
      isRunning: false
    });
  }

  private addJob(job: CronJob) {
    this.jobs.set(job.name, job);
  }

  /**
   * Start all cron jobs
   */
  public start() {
    // RSS feed processing - every 30 minutes
    const rssJob = this.jobs.get('process-rss-feeds');
    if (rssJob && !rssJob.isRunning) {
      const interval = setInterval(() => {
        if (!rssJob.isRunning) {
          rssJob.isRunning = true;
          rssJob.handler().finally(() => {
            rssJob.isRunning = false;
          });
        }
      }, 30 * 60 * 1000); // 30 minutes
      
      this.intervals.set('process-rss-feeds', interval);
      
      // Run immediately on start
      rssJob.handler();
    }

    // Scheduled posts - every hour
    const postsJob = this.jobs.get('generate-scheduled-posts');
    if (postsJob && !postsJob.isRunning) {
      const interval = setInterval(() => {
        if (!postsJob.isRunning) {
          postsJob.isRunning = true;
          postsJob.handler().finally(() => {
            postsJob.isRunning = false;
          });
        }
      }, 60 * 60 * 1000); // 1 hour
      
      this.intervals.set('generate-scheduled-posts', interval);
    }

    // Cleanup - daily
    const cleanupJob = this.jobs.get('cleanup-old-articles');
    if (cleanupJob && !cleanupJob.isRunning) {
      const interval = setInterval(() => {
        const now = new Date();
        if (now.getHours() === 3 && now.getMinutes() === 0) {
          if (!cleanupJob.isRunning) {
            cleanupJob.isRunning = true;
            cleanupJob.handler().finally(() => {
              cleanupJob.isRunning = false;
            });
          }
        }
      }, 60 * 1000); // Check every minute
      
      this.intervals.set('cleanup-old-articles', interval);
    }

    console.log('[CRON] All jobs started');
  }

  /**
   * Stop all cron jobs
   */
  public stop() {
    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval);
      console.log(`[CRON] Stopped job: ${name}`);
    }
    this.intervals.clear();
  }

  /**
   * Get status of all jobs
   */
  public getStatus() {
    const status: Record<string, any> = {};
    for (const [name, job] of this.jobs.entries()) {
      status[name] = {
        schedule: job.schedule,
        isRunning: job.isRunning
      };
    }
    return status;
  }

  /**
   * Manually trigger a job
   */
  public async triggerJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }
    
    if (job.isRunning) {
      throw new Error(`Job ${jobName} is already running`);
    }

    job.isRunning = true;
    try {
      await job.handler();
    } finally {
      job.isRunning = false;
    }
  }
}

// Export singleton instance
export const cronManager = new CronManager();