export function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  // In development, allow localhost origins
  const isAllowed =
    origin === allowedOrigin || origin.startsWith('http://localhost:');

  if (!isAllowed) return {};

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleOptions(request: Request, allowedOrigin: string): Response {
  const origin = request.headers.get('Origin') ?? '';
  const headers = corsHeaders(origin, allowedOrigin);

  if (Object.keys(headers).length === 0) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, { status: 204, headers });
}
