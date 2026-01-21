# Social Media Downloader - SARIM TOOLS

A powerful web application to download videos from social media platforms (TikTok, Instagram, YouTube) and transcribe them using AI.

## Features

- ✅ Download videos from TikTok, Instagram, YouTube, and more
- ✅ Extract audio from videos (WAV format)
- ✅ AI-powered transcription using Puter.ai
- ✅ Clean, simple UI with two-column layout
- ✅ Video captions/titles display
- ✅ Fast audio optimization for quicker transcription
- ✅ Real-time progress updates

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **APIs**: 
  - RapidAPI Social Media Downloader
  - Puter.ai Speech-to-Text
- **Deployment**: Vercel

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/social-media-downloader-sarim-tools.git
   cd social-media-downloader-sarim-tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Vercel Deployment

This project is configured for easy deployment on Vercel:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/social-media-downloader-sarim-tools.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Deploy!

3. **Update PROXY_URL**
   - After deployment, get your Vercel URL
   - Update `PROXY_URL` in `index.html` to your Vercel URL
   - Set `USE_PROXY = true` in `index.html`

## Project Structure

```
├── index.html          # Main application (HTML/CSS/JS)
├── server.js           # Backend proxy server (Express)
├── package.json        # Node.js dependencies
├── vercel.json         # Vercel configuration
└── README.md           # This file
```

## API Keys

The application uses:
- **RapidAPI Social Media Downloader** - For video download links
- **Puter.ai Speech-to-Text** - For audio transcription

API keys are embedded in the code. For production, consider using environment variables.

## How It Works

1. **Fetch Download Link** - Uses RapidAPI to get direct video download URL
2. **Download Video** - Downloads video via proxy (bypasses CORS)
3. **Extract Audio** - Converts video to WAV format using Web Audio API
4. **Transcribe** - Uses Puter.ai to convert audio to text
5. **Display** - Shows video, audio, caption, and transcription

## Supported Platforms

- ✅ TikTok
- ✅ Instagram
- ✅ YouTube
- ✅ And more via RapidAPI

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires Web Audio API support
- Requires JavaScript enabled

## License

MIT License

## Author

SARIM TOOLS
