// Configuration file for API keys and settings
// ⚠️ SECURITY WARNING: Never commit this file with real API keys!

// Function to load environment variables
function loadConfig() {
    // Try to load from environment variables (for production)
    if (typeof process !== 'undefined' && process.env) {
        return {
            YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
            YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID
        };
    }
    
    // For browser environment, try to load from .env file or use defaults
    // You can also manually set these values here for development
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
