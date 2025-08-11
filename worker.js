// Cloudflare Worker to serve static files with environment variable injection
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Handle root path and inject environment variables
      if (path === '/' || path === '/index.html') {
        try {
          // Get the index.html content
          const response = await env.ASSETS.fetch('/index.html');
          let html = await response.text();
          
          // Check if environment variables are available
          if (!env.YOUTUBE_API_KEY || !env.YOUTUBE_CHANNEL_ID) {
            console.error('❌ Missing environment variables in Worker');
            console.error('❌ Available env keys:', Object.keys(env));
          }
          
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
    } catch (error) {
      console.error('❌ Fatal Worker error:', error);
      return new Response('Worker error: ' + error.message, { status: 500 });
    }
  }
};
