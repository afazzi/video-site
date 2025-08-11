// Cloudflare Worker to serve static files with environment variable injection
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Debug: Log environment variable status
    console.log('🔍 Worker Debug:', {
      hasApiKey: !!env.YOUTUBE_API_KEY,
      hasChannelId: !!env.YOUTUBE_CHANNEL_ID,
      apiKeyLength: env.YOUTUBE_API_KEY?.length || 0,
      channelIdLength: env.YOUTUBE_CHANNEL_ID?.length || 0,
      path: path,
      hasAssets: !!env.ASSETS
    });
    
    // Handle root path and inject environment variables
    if (path === '/' || path === '/index.html') {
      try {
        // Get the index.html content
        const response = await env.ASSETS.fetch('/index.html');
        let html = await response.text();
        
        // Inject environment variables
        const apiKey = env.YOUTUBE_API_KEY || 'your_youtube_api_key_here';
        const channelId = env.YOUTUBE_CHANNEL_ID || 'your_channel_id_here';
        
        // Replace all instances of the placeholders
        html = html.replace(/{{YOUTUBE_API_KEY}}/g, apiKey);
        html = html.replace(/{{YOUTUBE_CHANNEL_ID}}/g, channelId);
        
        // Return modified HTML
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          }
        });
      } catch (error) {
        console.error('❌ Worker error:', error);
        
        // Return a simple HTML response with injected variables as fallback
        const apiKey = env.YOUTUBE_API_KEY || 'your_youtube_api_key_here';
        const channelId = env.YOUTUBE_CHANNEL_ID || 'your_channel_id_here';
        
        const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Fazzi's Backlog</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Environment Variables Test</h1>
    <p>API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET'}</p>
    <p>Channel ID: ${channelId || 'NOT SET'}</p>
    <p>API Key Length: ${apiKey ? apiKey.length : 0}</p>
    <p>Is Placeholder: ${apiKey === 'your_youtube_api_key_here' ? 'YES' : 'NO'}</p>
</body>
</html>`;
        
        return new Response(fallbackHtml, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          }
        });
      }
    }
    
    // Try to serve other static files
    try {
      const response = await env.ASSETS.fetch(path);
      if (response.status === 404) {
        // Fallback to index.html for SPA routing
        return env.ASSETS.fetch('/index.html');
      }
      return response;
    } catch (error) {
      console.error('❌ Static file error:', error);
      // Fallback to index.html
      return env.ASSETS.fetch('/index.html');
    }
  }
};
