export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeApp } = await import('@/lib/app-init');
    await initializeApp();
  }
}