# VideoHub - Modern Video Website

A beautiful, responsive video website featuring a hero video section and an interactive card carousel for browsing videos.

## 🎥 Features

### Hero Section
- **Featured Video**: Prominent hero video with custom controls
- **Interactive Overlay**: Hover effects and play button overlay
- **Responsive Design**: Adapts to all screen sizes
- **Smooth Animations**: Fade-in animations and hover effects

### Video Carousel
- **Card-based Layout**: Beautiful video cards with thumbnails
- **Smooth Navigation**: Previous/Next buttons and dot indicators
- **Touch Support**: Swipe gestures for mobile devices
- **Keyboard Navigation**: Arrow keys for desktop users
- **Modal Playback**: Click any video card to play in a modal

### Additional Features
- **Modern Navigation**: Fixed navbar with smooth scrolling
- **Responsive Design**: Mobile-first approach
- **Performance Optimized**: Efficient animations and transitions
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required - pure HTML, CSS, and JavaScript

### Installation
1. Clone or download the project files
2. **Set up your API keys** (see Configuration section below)
3. Open `index.html` in your web browser
4. That's it! The website is ready to use

### 🔐 Configuration & Security

#### **⚠️ IMPORTANT SECURITY NOTES:**
- **NEVER commit API keys to Git repositories**
- **NEVER share your API keys publicly**
- **Use environment variables for local development**
- **Restrict API keys to specific domains/IPs when possible**

#### **For Development (Local Use):**
1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```
2. Edit `.env` with your actual API keys:
   ```bash
   YOUTUBE_API_KEY=your_actual_youtube_api_key
   YOUTUBE_CHANNEL_ID=your_actual_channel_id
   ```
3. **Never commit the `.env` file** - it's already in `.gitignore`

#### **For Production (GitHub Pages, etc.):**
Since GitHub Pages doesn't support environment variables, you have two options:

**Option 1: Manual Configuration (⚠️ NOT RECOMMENDED for public repos)**
1. Edit `config.js` and replace the placeholder values with your actual API keys
2. **⚠️ WARNING**: This exposes your API keys in the code (not recommended for public repos)
3. **Consider making your repository private** if you must use this method

**Option 2: Use a Build Process (RECOMMENDED)**
1. Set up a build tool (Webpack, Vite, etc.)
2. Use environment variables during build
3. Deploy the built files
4. Keep source code private

#### **Getting Your API Keys:**

**YouTube API Key:**
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. **IMPORTANT**: Restrict the API key to:
   - YouTube Data API v3 only
   - Specific domains/IPs where possible
   - Set usage quotas to prevent abuse

**YouTube Channel ID:**
1. Go to your YouTube channel
2. The channel ID is in the URL: `youtube.com/channel/CHANNEL_ID_HERE`
3. Or find it in YouTube Studio → Settings → Advanced



### File Structure
```
video-site/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
├── config.js           # Configuration template (⚠️ Don't commit with real keys!)
├── env.example         # Example environment variables
├── .gitignore          # Git ignore rules (includes config.js)
└── README.md           # This file
```

## 🎨 Design Features

### Color Scheme
- **Primary Blue**: #2563eb (Modern, trustworthy)
- **Gradient Background**: Purple to blue gradient for hero section
- **Neutral Grays**: Clean, professional appearance
- **White Space**: Generous spacing for readability

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive Sizing**: Scales appropriately on all devices

### Animations
- **Fade-in Effects**: Elements animate in as you scroll
- **Hover Transitions**: Smooth hover effects on interactive elements
- **Carousel Transitions**: Smooth sliding animations
- **Loading Animation**: Page fade-in on load

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1024px and above (3 cards visible)
- **Tablet**: 768px - 1023px (2 cards visible)
- **Mobile**: Below 768px (1 card visible)

### Mobile Features
- **Hamburger Menu**: Collapsible navigation
- **Touch Gestures**: Swipe to navigate carousel
- **Optimized Layout**: Stacked content for small screens

## 🎯 Interactive Elements

### Video Carousel
- **Navigation**: Arrow buttons and dot indicators
- **Auto-play**: Videos start automatically in modal
- **Close Options**: Click outside, close button, or ESC key
- **Smooth Scrolling**: Smooth transitions between slides

### Hero Video
- **Play/Pause**: Click overlay or video controls
- **CTA Button**: Scrolls to video section
- **Hover Effects**: Scale and shadow animations

### Navigation
- **Smooth Scrolling**: Animated scroll to sections
- **Active States**: Visual feedback for current section
- **Mobile Menu**: Collapsible hamburger menu

## 🔧 Customization

### Adding Videos
To add more videos, edit the `videos` array in `script.js`:

```javascript
const videos = [
    {
        id: 9,
        title: "Your Video Title",
        duration: "5:30",
        thumbnail: "path/to/thumbnail.jpg",
        videoUrl: "path/to/video.mp4"
    }
    // Add more videos here
];
```

### Changing Colors
Modify the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1d4ed8;
    --text-color: #1e293b;
    --background-color: #f8fafc;
}
```

### Styling Modifications
- **Hero Section**: Modify `.hero` class for background changes
- **Carousel**: Adjust `.carousel-container` for layout changes
- **Cards**: Customize `.video-card` for card styling

## 🌟 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔒 Security Best Practices

### For Developers:
- Use environment variables for all sensitive data
- Never hardcode API keys in source code
- Use `.gitignore` to exclude configuration files
- Consider using secret management services for production

### For Users:
- Keep your API keys private
- Monitor API usage and set appropriate quotas
- Regularly rotate API keys
- Report any security issues immediately

## 📞 Support

If you have any questions or need help with customization, please open an issue on the project repository.

---

**Built with ❤️ using HTML, CSS, and JavaScript**

