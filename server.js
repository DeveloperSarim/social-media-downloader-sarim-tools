/**
 * Backend Proxy Server for Social Media Video Processor
 * 
 * This server acts as a proxy to handle CORS issues when calling:
 * 1. RapidAPI Social Media Downloader
 * 2. RapidAPI SplitBeat Vocal Remover API
 * 
 * To run this server:
 * 1. Install dependencies: npm install
 * 2. Start server: node server.js
 * 3. Update USE_PROXY to true in index.html
 * 4. Access the app at http://localhost:3000
 * 
 * For deployment:
 * - Deploy to platforms like Heroku, Vercel, Railway, or Render
 * - Set environment variables for API keys (if needed for security)
 * - Update PROXY_URL in index.html to your deployed server URL
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Parse URL-encoded bodies (for base64 audio) - MUST be before multer
app.use(express.static(__dirname)); // Serve static files (index.html)

// API Keys (from index.html - in production, use environment variables)
const RAPID_API_KEY = process.env.RAPID_API_KEY || 'e0e359e518msh92ca86be7eeba3fp1025d7jsn1a0c267e66fa';
const RAPID_API_HOST = 'social-download-all-in-one.p.rapidapi.com';
const RAPID_API_URL = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';

const VOCAL_REMOVER_API_KEY = process.env.VOCAL_REMOVER_API_KEY || 'dc33d9e007msh84b8f56173f09ecp187f5cjsncb3b69b5c8bc';
const VOCAL_REMOVER_API_HOST = 'splitbeat-vocal-remover-music-splitter.p.rapidapi.com';
const VOCAL_REMOVER_API_URL = 'https://splitbeat-vocal-remover-music-splitter.p.rapidapi.com/Upload_audio';

const SPEECH_RECOGNITION_API_KEY = process.env.SPEECH_RECOGNITION_API_KEY || 'dc33d9e007msh84b8f56173f09ecp187f5cjsncb3b69b5c8bc';
const SPEECH_RECOGNITION_API_HOST = 'api-real-time-speech-processing.p.rapidapi.com';
const SPEECH_RECOGNITION_API_URL = 'https://api-real-time-speech-processing.p.rapidapi.com/asr';

// ============================================================================
// PROXY ENDPOINT: Social Media Download Link
// ============================================================================

/**
 * POST /api/download
 * Proxies requests to RapidAPI Social Media Downloader
 * Body: { "url": "<video_url>" }
 */
app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                error: 'Missing required field: url' 
            });
        }

        console.log(`[Proxy] Fetching download link for: ${url}`);

        const response = await fetch(RAPID_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] RapidAPI error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ 
                error: `RapidAPI error: ${errorText}` 
            });
        }

        const data = await response.json();
        console.log('[Proxy] RapidAPI response received');
        
        res.json(data);

    } catch (error) {
        console.error('[Proxy] Download link fetch error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// ============================================================================
// PROXY ENDPOINT: Video Download (for CORS issues)
// ============================================================================

/**
 * GET /api/video-download
 * Proxies video downloads to bypass CORS restrictions
 * Query param: url - the video URL to download
 */
app.get('/api/video-download', async (req, res) => {
    try {
        const videoUrl = req.query.url;
        
        if (!videoUrl) {
            return res.status(400).json({ 
                error: 'Missing required query parameter: url' 
            });
        }

        console.log(`[Proxy] Downloading video from: ${videoUrl.substring(0, 100)}...`);

        // Determine referer based on video source
        let referer = 'https://www.youtube.com/';
        if (videoUrl.includes('tiktok') || videoUrl.includes('musical.ly')) {
            referer = 'https://www.tiktok.com/';
        } else if (videoUrl.includes('instagram')) {
            referer = 'https://www.instagram.com/';
        } else if (videoUrl.includes('youtube') || videoUrl.includes('googlevideo.com')) {
            referer = 'https://www.youtube.com/';
        }

        // Prepare headers for video download
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': referer,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'identity', // Don't compress, we need the raw video
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'video',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site'
        };

        // For YouTube videos, add Range header support
        if (videoUrl.includes('googlevideo.com') || videoUrl.includes('youtube')) {
            headers['Range'] = req.headers.range || 'bytes=0-';
        }

        // Fetch the video from the source
        const response = await fetch(videoUrl, {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Video download error: ${response.status} - ${errorText.substring(0, 200)}`);
            return res.status(response.status).json({ 
                error: `Video download failed: ${response.status}`,
                details: errorText.substring(0, 500)
            });
        }

        // Get content type and other headers
        const contentType = response.headers.get('content-type') || 'video/mp4';
        const contentLength = response.headers.get('content-length');
        const contentRange = response.headers.get('content-range');
        
        // Set appropriate response headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
        
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        }
        if (contentRange) {
            res.setHeader('Content-Range', contentRange);
            res.status(206); // Partial content
        }

        // Stream the video to the client
        const videoBuffer = await response.arrayBuffer();
        res.send(Buffer.from(videoBuffer));

        console.log('[Proxy] Video downloaded and sent successfully');

    } catch (error) {
        console.error('[Proxy] Video download error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// ============================================================================
// PROXY ENDPOINT: Vocal Remover
// ============================================================================

/**
 * POST /api/vocal-remover
 * Proxies requests to RapidAPI SplitBeat Vocal Remover API
 * Body: FormData with 'file' field or URLSearchParams with base64 audio
 */
app.post('/api/vocal-remover', upload.any(), async (req, res) => {
    try {
        // Get file from upload
        const file = req.files && req.files.length > 0 && req.files.find(f => 
            f.fieldname === 'file' || 
            f.fieldname === 'audio' || 
            f.fieldname === 'audio_file' || 
            f.fieldname === 'upload'
        );
        
        if (!file) {
            console.error('[Proxy] No file found in upload:', {
                contentType: req.headers['content-type'],
                hasFiles: req.files ? req.files.length : 0,
                fileNames: req.files ? req.files.map(f => f.fieldname) : []
            });
            return res.status(400).json({ 
                error: 'Missing audio file. Expected multipart/form-data with "file" or "audio" field.' 
            });
        }

        console.log(`[Proxy] Forwarding vocal remover request to SplitBeat API (file: ${file.originalname || 'audio.wav'}, size: ${file.size} bytes)`);

        // Create FormData to forward to SplitBeat API (they expect multipart/form-data)
        const formData = new FormData();
        // Try different field names that the API might expect
        formData.append('file', file.buffer, {
            filename: file.originalname || 'audio.wav',
            contentType: file.mimetype || 'audio/wav'
        });
        formData.append('audio', file.buffer, {
            filename: file.originalname || 'audio.wav',
            contentType: file.mimetype || 'audio/wav'
        });
        formData.append('audio_file', file.buffer, {
            filename: file.originalname || 'audio.wav',
            contentType: file.mimetype || 'audio/wav'
        });

        // Forward to SplitBeat API
        const response = await fetch(VOCAL_REMOVER_API_URL, {
            method: 'POST',
            headers: {
                'x-rapidapi-key': VOCAL_REMOVER_API_KEY,
                'x-rapidapi-host': VOCAL_REMOVER_API_HOST
                // Don't set Content-Type - FormData will set it with boundary
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] SplitBeat API error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ 
                error: `SplitBeat API error: ${errorText}` 
            });
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('[Proxy] SplitBeat API response received (JSON)');
            res.json(data);
        } else {
            const text = await response.text();
            console.log('[Proxy] SplitBeat API response received (text)');
            // Try to parse as JSON, otherwise return as text
            try {
                const jsonData = JSON.parse(text);
                res.json(jsonData);
            } catch (e) {
                res.setHeader('Content-Type', 'text/plain');
                res.send(text);
            }
        }

    } catch (error) {
        console.error('[Proxy] Vocal remover error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// ============================================================================
// PROXY ENDPOINT: Speech Recognition / Transcription
// ============================================================================

/**
 * POST /api/transcribe
 * Proxies requests to RapidAPI Speech Recognition API
 * Body: FormData with 'file' or 'audio' field
 */
app.post('/api/transcribe', upload.any(), async (req, res) => {
    try {
        // Get query parameters from URL
        const queryParams = req.query;
        const language = queryParams.language || 'en';
        
        // Get file from either 'file' or 'audio' field, or get base64 from body
        let file = req.files && req.files.find(f => f.fieldname === 'file' || f.fieldname === 'audio');
        let base64Audio = null;
        
        // Check if audio is sent as base64 in body (urlencoded)
        if (!file && req.body) {
            base64Audio = req.body.audio || req.body.file || req.body.audio_data || req.body.data;
        }
        
        // If we have a file, convert to base64
        if (file && !base64Audio) {
            base64Audio = file.buffer.toString('base64');
        }
        
        if (!file && !base64Audio) {
            return res.status(400).json({ 
                error: 'Missing audio data. Expected multipart/form-data with "file" or "audio" field, or base64 audio in body.' 
            });
        }

        console.log(`[Proxy] Forwarding transcription request (language: ${language})`);

        // Use Real-time Speech Processing API
        // Build URL with query parameters
        const apiUrl = `${SPEECH_RECOGNITION_API_URL}?word_timestamps=false&task=transcribe&output=txt&language=${language}&encode=true`;
        
        // Create URLSearchParams with audio data
        const urlParams = new URLSearchParams();
        // Try different parameter names
        if (base64Audio) {
            urlParams.append('audio', base64Audio);
            urlParams.append('file', base64Audio);
            urlParams.append('audio_data', base64Audio);
            urlParams.append('data', base64Audio);
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'x-rapidapi-key': SPEECH_RECOGNITION_API_KEY,
                    'x-rapidapi-host': SPEECH_RECOGNITION_API_HOST,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: urlParams.toString()
            });

            if (response.ok) {
                const result = await response.text();
                console.log(`[Proxy] Transcription successful`);
                // Return as text since API returns text (output=txt)
                res.setHeader('Content-Type', 'text/plain');
                return res.send(result);
            } else {
                const errorText = await response.text();
                console.error(`[Proxy] Transcription failed: ${response.status} - ${errorText}`);
                return res.status(response.status).json({ 
                    error: 'Transcription API error',
                    message: errorText 
                });
            }
        } catch (error) {
            console.error('[Proxy] Transcription API error:', error);
            return res.status(500).json({ 
                error: 'Failed to connect to transcription API',
                message: error.message 
            });
        }

    } catch (error) {
        console.error('[Proxy] Transcription error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// ============================================================================
// ROOT ENDPOINT
// ============================================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${__dirname}`);
    console.log(`🔧 CORS enabled for all origins`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  POST /api/download - Proxy to RapidAPI`);
    console.log(`  GET  /api/video-download - Proxy video downloads (bypass CORS)`);
    console.log(`  POST /api/vocal-remover - Proxy to SplitBeat Vocal Remover`);
    console.log(`  POST /api/transcribe - Proxy to RapidAPI Speech Recognition`);
    console.log(`  GET  / - Serve index.html`);
    console.log('');
    console.log('✅ Multer configured for file uploads');
});
