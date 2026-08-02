import { FastifyInstance } from 'fastify';

export async function registerAuthRoutes(server: FastifyInstance) {
  server.post('/api/v1/auth/token', async (request, reply) => {
    // Basic mock OAuth2 token endpoint for extension PKCE authorization
    return reply.send({
      success: true,
      token: 'mock-jwt-token-visual-agent',
      expiresIn: 3600,
    });
  });
}
