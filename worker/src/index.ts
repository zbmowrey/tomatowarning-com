import type { Env } from './types';
import { corsHeaders, handleOptions } from './cors';
import { handleSubscribe } from './handlers/subscribe';
import { handlePress } from './handlers/press';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env.ALLOWED_ORIGIN);
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      let response: Response;

      switch (url.pathname) {
        case '/subscribe':
          response = await handleSubscribe(request, env);
          break;
        case '/press':
          response = await handlePress(request, env);
          break;
        default:
          response = Response.json({ error: 'Not found' }, { status: 404 });
      }

      // Attach CORS headers to every response
      const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);
      for (const [key, value] of Object.entries(cors)) {
        response.headers.set(key, value);
      }

      return response;
    } catch (err) {
      console.error('Worker error:', err);
      const errorResponse = Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);
      for (const [key, value] of Object.entries(cors)) {
        errorResponse.headers.set(key, value);
      }
      return errorResponse;
    }
  },
} satisfies ExportedHandler<Env>;
