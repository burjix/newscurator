import { cronManager } from '@/lib/cron-jobs';

let initialized = false;

/**
 * Initialize app services and background jobs
 */
export async function initializeApp() {
  if (initialized) {
    console.log('[INIT] App already initialized');
    return;
  }

  try {
    console.log('[INIT] Starting application initialization...');

    // Start cron jobs
    if (process.env.NODE_ENV === 'production') {
      console.log('[INIT] Starting cron jobs...');
      cronManager.start();
      console.log('[INIT] Cron jobs started successfully');
    } else {
      console.log('[INIT] Skipping cron jobs in development mode');
    }

    // Initialize other services here as needed
    // - Cache warming
    // - Database connection pooling
    // - External service connections
    // - Monitoring setup

    initialized = true;
    console.log('[INIT] Application initialized successfully');
  } catch (error) {
    console.error('[INIT] Failed to initialize application:', error);
    throw error;
  }
}

/**
 * Cleanup app services
 */
export async function cleanupApp() {
  try {
    console.log('[CLEANUP] Starting application cleanup...');

    // Stop cron jobs
    cronManager.stop();

    // Cleanup other services here

    initialized = false;
    console.log('[CLEANUP] Application cleanup completed');
  } catch (error) {
    console.error('[CLEANUP] Error during cleanup:', error);
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('[PROCESS] SIGTERM received, cleaning up...');
  await cleanupApp();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[PROCESS] SIGINT received, cleaning up...');
  await cleanupApp();
  process.exit(0);
});