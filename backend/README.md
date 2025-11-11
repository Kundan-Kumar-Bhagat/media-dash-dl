# YouTube Downloader Backend

Production-grade FastAPI backend for YouTube video downloading using yt-dlp.

## Features

- ✅ URL validation with detailed error messages
- ✅ Video metadata extraction (title, duration, thumbnail, formats)
- ✅ Real-time download progress via Server-Sent Events (SSE)
- ✅ Audio (MP3/AAC) and Video (MP4/WebM) format support
- ✅ Quality selection (1080p, 720p, 480p, 360p)
- ✅ Automatic file cleanup after 1 hour
- ✅ Robust error handling for geo-restrictions and network issues

## Installation

1. Install Python 3.9+ and create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Install FFmpeg (required for audio extraction and video merging):

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## Running the Server

Development mode:
```bash
python main.py
```

Production mode with Uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### POST /api/validate
Validate a YouTube URL

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "valid": true,
  "message": null
}
```

### POST /api/metadata
Fetch video metadata

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "title": "Video Title",
  "duration": 180,
  "thumbnail": "https://...",
  "uploader": "Channel Name",
  "formats": [...]
}
```

### GET /api/download
Download video with real-time progress (Server-Sent Events)

**Query Parameters:**
- `url` (required): YouTube video URL
- `format`: "audio" or "video" (default: "video")
- `quality`: Video quality - "1080", "720", "480", "360" (default: "720")
- `audio_format`: "mp3" or "aac" (default: "mp3")
- `video_format`: "mp4" or "webm" (default: "mp4")

**Example:**
```
GET /api/download?url=https://youtube.com/watch?v=...&format=video&quality=720
```

**SSE Response Stream:**
```json
data: {"percentage": 45.2, "speed": "2.5MB/s", "eta": "00:30", "status": "downloading"}

data: {"percentage": 100, "speed": "", "eta": "", "status": "complete", "message": "Download complete!"}
```

## Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t yt-downloader-backend .
docker run -p 8000:8000 -v $(pwd)/downloads:/app/downloads yt-downloader-backend
```

### Production Considerations

1. **CORS Configuration**: Update `allow_origins` in `main.py` to match your frontend domain
2. **File Storage**: Consider using object storage (S3, Google Cloud Storage) for large-scale deployments
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Authentication**: Add API authentication if needed
5. **Monitoring**: Set up logging and monitoring (e.g., Sentry, CloudWatch)
6. **Load Balancing**: Use multiple workers and a load balancer for high traffic

## Environment Variables

Optional configuration via environment variables:

```bash
export DOWNLOAD_DIR=/custom/download/path
export CLEANUP_INTERVAL=3600  # seconds
export MAX_WORKERS=4
```

## Frontend Integration

Update the frontend's `VITE_API_URL` environment variable:

```bash
# .env
VITE_API_URL=http://localhost:8000
```

For production:
```bash
VITE_API_URL=https://your-api-domain.com
```

## Troubleshooting

### FFmpeg not found
Make sure FFmpeg is installed and available in PATH.

### Download errors
- Check internet connectivity
- Verify YouTube URL is accessible
- Some videos may have geo-restrictions or be private

### Permission errors
Ensure the application has write permissions to the downloads directory.

## License

MIT License
