const Fastify = require('fastify');
const fastify = Fastify({ logger: true });
fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/formbody'));

// simple in-memory store
let lastPlayers = [];

// health
fastify.get('/api/health', async (req, reply) => {
  return { status: 'ok' };
});

// start tournament
fastify.post('/api/start-tournament', async (req, reply) => {
  const { players } = req.body || {};
  if (!Array.isArray(players) || players.length < 2) {
    return reply.status(400).send({ error: 'Invalid players array (min 2)' });
  }
  lastPlayers = players;
  return { ok: true, players: lastPlayers };
});

fastify.get('/api/players', async (req, reply) => {
  return { players: lastPlayers };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Backend listening on 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
