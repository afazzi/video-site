// Configuration file for API keys and settings
// ⚠️ SECURITY WARNING: Never commit this file with real API keys!

// Function to load environment variables from Cloudflare Workers
function loadConfig() {
    // For Cloudflare Workers environment
    if (typeof globalThis !== 'undefined' && globalThis.YOUTUBE_API_KEY) {
        return {
            YOUTUBE_API_KEY: globalThis.YOUTUBE_API_KEY,
            YOUTUBE_CHANNEL_ID: globalThis.YOUTUBE_CHANNEL_ID
        };
    }
    
    // For browser environment, try to load from environment variables
    // This will work when deployed to Cloudflare Workers
    if (typeof YOUTUBE_API_KEY !== 'undefined' && YOUTUBE_API_KEY !== 'your_youtube_api_key_here') {
        return {
            YOUTUBE_API_KEY: YOUTUBE_API_KEY,
            YOUTUBE_CHANNEL_ID: YOUTUBE_CHANNEL_ID
        };
    }
    
    // Fallback to placeholder values for development
    return {
        // ⚠️ IMPORTANT: Replace these with your actual API keys!
        // Get your YouTube API key from: https://console.developers.google.com/
        YOUTUBE_API_KEY: 'your_youtube_api_key_here',
        
        // Get your YouTube Channel ID from your channel URL or YouTube Studio
        YOUTUBE_CHANNEL_ID: 'your_channel_id_here'
    };
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = loadConfig();
} else {
    // Browser environment
    window.APP_CONFIG = loadConfig();
}
