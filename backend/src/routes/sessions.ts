import { FastifyInstance } from 'fastify';
import { sessionManager } from '../services/session-manager.js';
import { CreateSessionRequest } from '@visual-agent/shared';

export async function registerSessionRoutes(server: FastifyInstance) {
  server.post<{ Body: CreateSessionRequest }>('/api/v1/sessions', async (request, reply) => {
    const { goal, executionMode } = request.body || {};
    if (!goal) {
      return reply.status(400).send({
        success: false,
        error: 'Goal parameter is required.',
        timestamp: new Date().toISOString(),
      });
    }

    const session = sessionManager.createSession(goal, executionMode || 'IN_BROWSER');
    return reply.status(201).send({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  });

  server.get('/api/v1/sessions', async () => {
    return {
      success: true,
      data: sessionManager.getAllSessions(),
      timestamp: new Date().toISOString(),
    };
  });

  server.get<{ Params: { id: string } }>('/api/v1/sessions/:id', async (request, reply) => {
    const session = sessionManager.getSession(request.params.id);
    if (!session) {
      return reply.status(404).send({
        success: false,
        error: 'Session not found.',
        timestamp: new Date().toISOString(),
      });
    }
    return {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    };
  });
}
