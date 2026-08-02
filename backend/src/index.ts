import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from './config.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerSessionRoutes } from './routes/sessions.js';
import { registerAuthRoutes } from './routes/auth.js';
import { wsGateway } from './services/ws-gateway.js';
import { redisQueue } from './services/redis-queue.js';

const server = Fastify({ logger: true });

async function main() {
  await server.register(cors, { origin: true });
  await server.register(websocket);

  await registerHealthRoutes(server);
  await registerSessionRoutes(server);
  await registerAuthRoutes(server);

  server.get('/ws/v1', { websocket: true }, (socket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId') || `anon_${Date.now()}`;
    wsGateway.registerClient(sessionId, socket);
  });

  await redisQueue.connect();

  try {
    await server.listen({ port: config.port, host: config.host });
    console.info(`[Backend Gateway] Server listening at http://${config.host}:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
