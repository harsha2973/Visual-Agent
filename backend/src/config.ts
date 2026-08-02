export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  aiWorkerUrl: process.env.AI_WORKER_URL || 'http://localhost:8000',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
};
