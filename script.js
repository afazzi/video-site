// Configuration - Load from HTML script tag
const YOUTUBE_API_KEY = window.APP_CONFIG?.YOUTUBE_API_KEY || '';
const YOUTUBE_CHANNEL_ID = window.APP_CONFIG?.YOUTUBE_CHANNEL_ID || '';
const MAX_PLAYLIST_ITEMS = 20;

// Generic fallback video IDs (replace with your own if needed)
const fallbackVideoIds = [
    'dQw4w9WgXcQ', // Rick Roll (example)
    '9bZkp7q19f0', // Gangnam Style (example)
    'kJQP7kiw5Fk', // Despacito (example)
    'L_jWHffIxBSi4' // Baby Shark (example)
];

// Global variables
let videos = [];
let currentPlaylistId = null;
let videoGridManager = null;
let userPlaylists = [];

const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// YouTube API Service
class YouTubeAPIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    }

    getCachedResponse(key) {
        const cached = apiCache.get(key);
        return cached && Date.now() - cached.timestamp < CACHE_DURATION ? cached.data : null;
    }

    setCachedResponse(key, data) {
        apiCache.set(key, { data, timestamp: Date.now() });
    }

    async fetchPlaylistVideos(playlistId, maxResults = 20) {
        const cacheKey = `playlist_${playlistId}_${maxResults}`;
        const cached = this.getCachedResponse(cacheKey);
        if (cached) return cached;

        try {
            const playlistUrl = `${this.baseUrl}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${this.apiKey}`;
            const response = await fetch(playlistUrl);
            
            if (!response.ok) {
                if (response.status === 403) throw new Error('QUOTA_EXCEEDED');
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.items?.length) return this.fetchVideoDetails(fallbackVideoIds);
            
            const videoIds = data.items
                .filter(item => item.snippet?.resourceId?.videoId)
                .map(item => item.snippet.resourceId.videoId);
            
            const result = await this.fetchVideoDetails(videoIds);
            this.setCachedResponse(cacheKey, result);
            return result;
            
        } catch (error) {
            console.error('Playlist fetch error:', error);
            return this.fetchVideoDetails(fallbackVideoIds);
        }
    }

    async fetchVideoDetails(videoIds) {
        const cacheKey = `videos_${videoIds.join(',')}`;
        const cached = this.getCachedResponse(cacheKey);
        if (cached) return cached;

        try {
            const url = `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            const result = this.processVideoData(data.items);
            this.setCachedResponse(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Video fetch error:', error);
            return this.getFallbackData(videoIds);
        }
    }

    processVideoData(items) {
        return items.map((item, index) => ({
            id: index + 1,
            title: item.snippet.title,
            duration: this.formatDuration(item.contentDetails.duration),
            thumbnail: item.snippet.thumbnails.maxres?.url || 
                      item.snippet.thumbnails.high?.url || 
                      `https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`,
            videoId: item.id,
            channelTitle: item.snippet.channelTitle,
            description: item.snippet.description,
            uploadDate: this.formatUploadDate(item.snippet.publishedAt),
            viewCount: this.formatViewCount(item.statistics?.viewCount),
            likeCount: item.statistics?.likeCount,
            isYouTube: true
        }));
    }

    formatDuration(isoDuration) {
        if (!isoDuration) return '0:00';
        
        const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return '0:00';
        
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');
        
        if (hours) {
            return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        }
        return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
    }

    formatUploadDate(isoDate) {
        if (!isoDate) return 'Unknown';
        
        const date = new Date(isoDate);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }

    formatViewCount(viewCount) {
        if (!viewCount) return '0';
        
        const num = parseInt(viewCount);
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    }

    getFallbackData(videoIds) {
        return videoIds.map((id, index) => ({
            id: index + 1,
            title: `Sample Video ${index + 1}`,
            duration: '3:45',
            thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
            videoId: id,
            channelTitle: 'Sample Channel',
            description: 'This is a sample video description.',
            uploadDate: '2 days ago',
            viewCount: '1.2K',
            likeCount: '150',
            isYouTube: true
        }));
    }
}

// Video Grid Manager
class VideoGridManager {
    constructor() {
        this.videoGrid = document.getElementById('videoGrid');
        this.videos = [];
    }

    setVideos(videos) {
        this.videos = videos;
        this.render();
    }

    render() {
        if (!this.videoGrid || !this.videos.length) return;

        // Include all videos including the first one (even though it's in the hero)
        const gridVideos = this.videos;
        this.videoGrid.innerHTML = gridVideos.map(video => this.createVideoCard(video)).join('');
        this.bindEvents();
    }

    createVideoCard(video) {
        return `
            <div class="video-card" data-video-id="${video.videoId}">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" loading="lazy">
                <div class="video-info">
                    <h4 class="video-title">${video.title}</h4>
                    <div class="video-meta">
                        <span class="video-channel">${video.channelTitle}</span>
                        <span class="video-duration">${video.duration}</span>
                    </div>
                    <div class="video-stats">
                        <span>${video.viewCount} views</span>
                        <span>${video.uploadDate}</span>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const videoCards = this.videoGrid.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.dataset.videoId;
                this.playVideo(videoId);
            });
        });
    }

    playVideo(videoId) {
        // Open video in new tab or implement modal player
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
}

// Playlist switching functionality
function switchPlaylist(playlistId) {
    if (playlistId === currentPlaylistId) return;
    
    currentPlaylistId = playlistId;
    
    // Update active button
    document.querySelectorAll('.playlist-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.playlist === playlistId) {
            btn.classList.add('active');
        }
    });
    
    // Load new playlist
    loadPlaylist(playlistId);
}

// Load playlist function
async function loadPlaylist(playlistId) {
    try {
        const youtubeService = new YouTubeAPIService(YOUTUBE_API_KEY);
        videos = await youtubeService.fetchPlaylistVideos(playlistId, MAX_PLAYLIST_ITEMS);
        
        if (videos.length === 0) throw new Error('No videos loaded');
        
        // Update hero section with playlist info
        updateHeroSection(playlistId);
        
        // Update video grid
        if (videoGridManager) {
            videoGridManager.setVideos(videos);
        }
        
    } catch (error) {
        console.error('Error loading playlist:', error);
        // Try fallback data
        try {
            const youtubeService = new YouTubeAPIService(YOUTUBE_API_KEY);
            videos = youtubeService.getFallbackData(fallbackVideoIds);
            
            if (videos.length > 0) {
                updateHeroSection(playlistId);
                if (videoGridManager) {
                    videoGridManager.setVideos(videos);
                }
            } else {
                showErrorInGrid('Failed to load videos. Please check your API key and playlist ID.');
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            showErrorInGrid('Failed to load videos. Please check your API key and playlist ID.');
        }
    }
}

// Update hero section function
function updateHeroSection(playlistId) {
    const heroSection = document.getElementById('hero');
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const watchNowBtn = document.getElementById('watch-now-btn');
    
    // Find the current playlist
    const currentPlaylist = userPlaylists.find(playlist => playlist.id === playlistId);
    
    if (heroSection && currentPlaylist?.thumbnails) {
        // Use the highest resolution thumbnail available for the hero section
        const heroThumbnail = currentPlaylist.thumbnails.maxres?.url || 
                             currentPlaylist.thumbnails.standard?.url || 
                             currentPlaylist.thumbnails.high?.url || 
                             currentPlaylist.thumbnails.medium?.url || 
                             currentPlaylist.thumbnails.default?.url;
        
        if (heroThumbnail) {
            heroSection.style.backgroundImage = `url('${heroThumbnail}')`;
        }
    }
    
    if (heroTitle && currentPlaylist?.title) {
        heroTitle.textContent = currentPlaylist.title;
        adjustHeroTextSize();
    }
    
    if (heroSubtitle) {
        if (currentPlaylist?.description && currentPlaylist.description.trim()) {
            const maxLength = 150;
            const description = currentPlaylist.description.length > maxLength 
                ? currentPlaylist.description.substring(0, maxLength) + '...'
                : currentPlaylist.description;
            heroSubtitle.textContent = description;
            heroSubtitle.style.display = 'block';
        } else {
            // Hide subtitle if no description exists
            heroSubtitle.style.display = 'none';
        }
        adjustHeroTextSize();
    }
    
    // Update watch now button to link to the playlist
    if (watchNowBtn && currentPlaylist?.id) {
        watchNowBtn.href = `https://www.youtube.com/playlist?list=${currentPlaylist.id}`;
        watchNowBtn.target = '_blank';
        watchNowBtn.textContent = 'View Playlist';
    }
}

// Function to adjust hero text sizes to fit within the fixed height
function adjustHeroTextSize() {
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroContent = document.querySelector('.hero-content');
    
    if (!heroTitle || !heroSubtitle || !heroContent) return;
    
    // Reset to default sizes
    heroTitle.style.fontSize = '';
    heroSubtitle.style.fontSize = '';
    
    // Get the content height
    const contentHeight = heroContent.scrollHeight;
    const maxHeight = 300; // Maximum allowed height for content
    
    if (contentHeight > maxHeight) {
        // Calculate scale factor
        const scaleFactor = maxHeight / contentHeight;
        
        // Apply scaling to both title and subtitle
        const titleSize = parseFloat(getComputedStyle(heroTitle).fontSize);
        const subtitleSize = parseFloat(getComputedStyle(heroSubtitle).fontSize);
        
        heroTitle.style.fontSize = `${titleSize * scaleFactor}px`;
        heroSubtitle.style.fontSize = `${subtitleSize * scaleFactor}px`;
    }
}

// Show error in grid function
function showErrorInGrid(message) {
    const videoGrid = document.getElementById('videoGrid');
    if (videoGrid) {
        videoGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6c757d;">
                <h3>Failed to load videos</h3>
                <p>${message}</p>
                <button onclick="loadPlaylist(currentPlaylistId)" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007bff; border: none; border-radius: 4px; color: white; cursor: pointer;">Retry</button>
            </div>
        `;
    }
}

// Fetch user's playlists
async function fetchUserPlaylists() {
    try {
        // Fetch all playlists for the channel directly
        const playlistsResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`);
        
        if (!playlistsResponse.ok) {
            const errorText = await playlistsResponse.text();
            console.error('❌ Playlists API error:', playlistsResponse.status, errorText);
            
            if (playlistsResponse.status === 403) {
                throw new Error('API_QUOTA_EXCEEDED: YouTube API quota exceeded or API key invalid');
            } else if (playlistsResponse.status === 400) {
                throw new Error('API_BAD_REQUEST: Invalid channel ID or API key');
            } else if (playlistsResponse.status === 401) {
                throw new Error('API_UNAUTHORIZED: API key is invalid or expired');
            } else {
                throw new Error(`API_ERROR_${playlistsResponse.status}: ${errorText}`);
            }
        }
        
        const playlistsData = await playlistsResponse.json();
        
        if (!playlistsData.items || playlistsData.items.length === 0) {
            throw new Error('No playlists found for this channel');
        }
        
        userPlaylists = playlistsData.items.map(playlist => ({
            id: playlist.id,
            title: playlist.snippet.title,
            description: playlist.snippet.description,
            thumbnail: playlist.snippet.thumbnails?.medium?.url || playlist.snippet.thumbnails?.default?.url,
            thumbnails: playlist.snippet.thumbnails || {},
            videoCount: playlist.snippet.itemCount || 0
        }));
        
        return userPlaylists;
        
    } catch (error) {
        console.error('💥 Error fetching playlists:', error);
        
        // Show error message to user
        showPlaylistError(error.message);
        
        // Fallback to hardcoded playlists if API fails
        return getFallbackPlaylists();
    }
}

// Show playlist error message
function showPlaylistError(errorMessage) {
    const playlistButtonsContainer = document.querySelector('.playlist-buttons');
    if (!playlistButtonsContainer) return;
    
    playlistButtonsContainer.innerHTML = `
        <div class="playlist-error">
            <h3>⚠️ Playlist Loading Error</h3>
            <p>${errorMessage}</p>
            <button onclick="retryPlaylistFetch()" class="retry-btn">🔄 Retry</button>
        </div>
    `;
}

// Retry playlist fetch
async function retryPlaylistFetch() {
    const playlists = await fetchUserPlaylists();
    createPlaylistButtons(playlists);
}

// Initialize playlist scrolling functionality
function initializePlaylistScrolling() {
    const playlistContainer = document.querySelector('.playlist-buttons');
    if (!playlistContainer) return;
    
    // Add mouse wheel support for horizontal scrolling
    playlistContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        // Increase scroll speed by multiplying deltaY by a factor
        playlistContainer.scrollLeft += e.deltaY * 4;
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('.playlist-buttons')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                playlistContainer.scrollLeft -= 300;
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                playlistContainer.scrollLeft += 300;
            }
        }
    });
    
    // Add touch support for mobile devices
    let isScrolling = false;
    let startX = 0;
    let scrollLeft = 0;
    
    playlistContainer.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - playlistContainer.offsetLeft;
        scrollLeft = playlistContainer.scrollLeft;
    });
    
    playlistContainer.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.touches[0].pageX - playlistContainer.offsetLeft;
        const walk = (x - startX) * 2;
        playlistContainer.scrollLeft = scrollLeft - walk;
    });
    
    playlistContainer.addEventListener('touchend', () => {
        isScrolling = false;
    });
    
    // Update gradient visibility based on scroll position
    function updateGradients() {
        const playlistSection = document.querySelector('.playlist-selection');
        if (!playlistSection) return;
        
        const isAtStart = playlistContainer.scrollLeft <= 0;
        const isAtEnd = playlistContainer.scrollLeft >= playlistContainer.scrollWidth - playlistContainer.clientWidth;
        
        playlistSection.style.setProperty('--show-left-gradient', isAtStart ? '0' : '1');
        playlistSection.style.setProperty('--show-right-gradient', isAtEnd ? '0' : '1');
    }
    
    // Listen for scroll events
    playlistContainer.addEventListener('scroll', updateGradients);
    
    // Initial gradient update
    updateGradients();
    
    // Add window resize listener for hero text adjustment
    window.addEventListener('resize', () => {
        setTimeout(adjustHeroTextSize, 100);
    });
}

// Test API key validity
async function testAPIKey() {
    try {
        // Test with a simple search query
        const testResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${YOUTUBE_API_KEY}`);
        
        if (!testResponse.ok) {
            const errorText = await testResponse.text();
            console.error('❌ API key test failed:', testResponse.status, errorText);
            return false;
        }
        
        const testData = await testResponse.json();
        return true;
        
    } catch (error) {
        console.error('💥 API key test error:', error);
        return false;
    }
}

// Fallback playlists if API fails
function getFallbackPlaylists() {
    return [
        { id: 'PL_EXAMPLE_1', title: 'Sample Playlist 1', description: 'Fallback playlist', thumbnail: null, videoCount: 0 },
        { id: 'PL_EXAMPLE_2', title: 'Sample Playlist 2', description: 'Fallback playlist', thumbnail: null, videoCount: 0 },
        { id: 'PL_EXAMPLE_3', title: 'Sample Playlist 3', description: 'Fallback playlist', thumbnail: null, videoCount: 0 },
        { id: 'PL_EXAMPLE_4', title: 'Sample Playlist 4', description: 'Fallback playlist', thumbnail: null, videoCount: 0 },
        { id: 'PL_EXAMPLE_5', title: 'Sample Playlist 5', description: 'Fallback playlist', thumbnail: null, videoCount: 0 }
    ];
}

// Create playlist buttons dynamically
function createPlaylistButtons(playlists) {
    const playlistButtonsContainer = document.querySelector('.playlist-buttons');
    if (!playlistButtonsContainer) return;
    
    playlistButtonsContainer.innerHTML = '';
    
    playlists.forEach((playlist, index) => {
        const button = document.createElement('button');
        button.className = 'playlist-btn';
        button.dataset.playlist = playlist.id;
        button.dataset.index = index;
        
        // Create button content with thumbnail and title
        const thumbnail = playlist.thumbnail ? `<img src="${playlist.thumbnail}" alt="${playlist.title}" class="playlist-thumbnail">` : '';
        const videoCount = playlist.videoCount > 0 ? `<span class="playlist-count">${playlist.videoCount} videos</span>` : '';
        
        button.innerHTML = `
            ${thumbnail}
            <div class="playlist-info">
                <span class="playlist-title">${playlist.title}</span>
                ${videoCount}
            </div>
        `;
        
        // Add click event
        button.addEventListener('click', () => {
            switchPlaylist(playlist.id);
            
            // Scroll to the selected playlist to ensure it's visible
            setTimeout(() => {
                button.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }, 100);
        });
        
        playlistButtonsContainer.appendChild(button);
    });
    
    // Set first playlist as active and load it
    if (playlists.length > 0) {
        const firstButton = playlistButtonsContainer.querySelector('.playlist-btn');
        firstButton.classList.add('active');
        currentPlaylistId = playlists[0].id;
        loadPlaylist(playlists[0].id);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Check if configuration is loaded
    if (!window.APP_CONFIG) {
        console.error('❌ Configuration not loaded. Make sure environment variables are properly set in Cloudflare Workers');
        showPlaylistError('Configuration not loaded. Please check that environment variables are properly set.');
        return;
    }
    
    // Check if API keys are configured
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
        console.error('❌ YouTube API key not configured');
        showPlaylistError('YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable in Cloudflare Workers.');
        return;
    }
    
    if (!YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID === 'your_channel_id_here') {
        console.error('❌ YouTube Channel ID not configured');
        showPlaylistError('YouTube Channel ID not configured. Please set YOUTUBE_CHANNEL_ID environment variable in Cloudflare Workers.');
        return;
    }
    
    try {
        // First, test API key validity
        const apiKeyValid = await testAPIKey();
        if (!apiKeyValid) {
            console.error('❌ API key validation failed');
            showPlaylistError('YouTube API key is invalid or expired. Please check your API key configuration.');
            return;
        }
        
        // Fetch user's playlists
        const playlists = await fetchUserPlaylists();
        
        // Create playlist buttons dynamically
        createPlaylistButtons(playlists);
        
        // Initialize video grid manager (will be populated when first playlist loads)
        videoGridManager = new VideoGridManager();
        
        // Initialize playlist scrolling functionality
        initializePlaylistScrolling();
        
        // Initial hero text size adjustment
        setTimeout(adjustHeroTextSize, 100);
        
    } catch (error) {
        console.error('💥 Error during initialization:', error);
        // Try to create fallback buttons
        const fallbackPlaylists = getFallbackPlaylists();
        createPlaylistButtons(fallbackPlaylists);
        videoGridManager = new VideoGridManager();
        
        // Initialize playlist scrolling functionality even with fallback
        initializePlaylistScrolling();
        
        // Initial hero text size adjustment even with fallback
        setTimeout(adjustHeroTextSize, 100);
    }
});

