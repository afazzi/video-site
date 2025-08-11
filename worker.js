// Cloudflare Worker to serve static files with environment variable injection
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Debug: Log environment variables
    console.log('🔍 Worker environment variables:');
    console.log('🔑 YOUTUBE_API_KEY:', env.YOUTUBE_API_KEY ? 'SET' : 'NOT SET');
    console.log('📺 YOUTUBE_CHANNEL_ID:', env.YOUTUBE_CHANNEL_ID ? 'SET' : 'NOT SET');
    
    // Handle root path and inject environment variables
    if (path === '/' || path === '/index.html') {
      try {
        // Get the index.html content
        const response = await env.ASSETS.fetch('/index.html');
        let html = await response.text();
        
        // Inject environment variables
        const apiKey = env.YOUTUBE_API_KEY || 'your_youtube_api_key_here';
        const channelId = env.YOUTUBE_CHANNEL_ID || 'your_channel_id_here';
        
        console.log('🔍 Injecting variables:', { apiKey: apiKey.substring(0, 10) + '...', channelId });
        
        html = html.replace('{{YOUTUBE_API_KEY}}', apiKey);
        html = html.replace('{{YOUTUBE_CHANNEL_ID}}', channelId);
        
        // Return modified HTML
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          }
        });
      } catch (error) {
        console.error('❌ Error in Worker:', error);
        // Fallback to original index.html
        return env.ASSETS.fetch('/index.html');
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
      console.error('❌ Error serving static file:', error);
      // Fallback to index.html
      return env.ASSETS.fetch('/index.html');
    }
  }
};
