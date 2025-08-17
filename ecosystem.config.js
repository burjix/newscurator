module.exports = {
  apps: [
    {
      name: 'newscurator',
      script: 'npm',
      args: 'start',
      cwd: '/home/claude/projects/newscurator',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};