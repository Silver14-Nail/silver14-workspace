/**
 * PM2 ecosystem config for Silver14 API (non-Vercel / VPS deployment).
 *
 * Usage:
 *   pm2 start ecosystem.config.js            # start in fork mode
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload ecosystem.config.js           # zero-downtime reload
 *   pm2 logs silver14-api
 *
 * Build first: nx build api
 */

module.exports = {
  apps: [
    {
      name: 'silver14-api',

      // Nx places the compiled output here
      script: 'dist/apps/api/main.js',

      // Run from monorepo root so relative paths (e.g. .env) resolve correctly
      cwd: '.',

      // Single instance — change to 'cluster' + instances: 'max' for multi-core
      instances: 1,
      exec_mode: 'fork',

      // Restart automatically on crash
      autorestart: true,
      watch: false,

      // Restart if RSS exceeds 512 MB (guards against memory leaks)
      max_memory_restart: '512M',

      // Back-off: wait 4 s before each restart, give up after 10 successive crashes
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',

      // Graceful shutdown: send SIGINT, wait up to 5 s before SIGKILL
      kill_timeout: 5000,
      listen_timeout: 8000,

      // Log management
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
