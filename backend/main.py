"""
YouTube Video Downloader Backend
FastAPI + yt-dlp for production-grade video downloading

Deploy this separately from the Lovable frontend.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional, Literal, AsyncGenerator
import yt_dlp
import asyncio
import os
import json
from pathlib import Path
from datetime import datetime, timedelta
import re

app = FastAPI(title="YouTube Downloader API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DOWNLOAD_DIR = Path("downloads")
DOWNLOAD_DIR.mkdir(exist_ok=True)
CLEANUP_INTERVAL = 3600  # 1 hour in seconds

# Models
class URLValidationRequest(BaseModel):
    url: str

class MetadataRequest(BaseModel):
    url: str

class URLValidationResponse(BaseModel):
    valid: bool
    message: Optional[str] = None

class VideoMetadata(BaseModel):
    title: str
    duration: int
    thumbnail: str
    uploader: str
    formats: list

# Utility functions
def validate_youtube_url(url: str) -> bool:
    """Validate if URL is a valid YouTube URL"""
    youtube_regex = r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+'
    return bool(re.match(youtube_regex, url))

def get_ydl_opts(output_path: str, format_type: str = "video", quality: str = "720") -> dict:
    """Get yt-dlp options based on download requirements"""
    base_opts = {
        'outtmpl': output_path,
        'quiet': False,
        'no_warnings': False,
        'ignoreerrors': False,
    }
    
    if format_type == "audio":
        base_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
    else:
        # Video download with quality selection
        format_string = f'bestvideo[height<={quality}]+bestaudio/best[height<={quality}]'
        base_opts.update({
            'format': format_string,
            'merge_output_format': 'mp4',
        })
    
    return base_opts

async def cleanup_old_files():
    """Background task to cleanup files older than 1 hour"""
    while True:
        try:
            current_time = datetime.now()
            for file_path in DOWNLOAD_DIR.glob("*"):
                if file_path.is_file():
                    file_age = current_time - datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_age > timedelta(seconds=CLEANUP_INTERVAL):
                        file_path.unlink()
                        print(f"Cleaned up: {file_path.name}")
        except Exception as e:
            print(f"Cleanup error: {e}")
        
        await asyncio.sleep(300)  # Check every 5 minutes

# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Start background cleanup task"""
    asyncio.create_task(cleanup_old_files())

@app.post("/api/validate", response_model=URLValidationResponse)
async def validate_url(request: URLValidationRequest):
    """Validate YouTube URL"""
    if not validate_youtube_url(request.url):
        return URLValidationResponse(
            valid=False,
            message="Invalid YouTube URL format"
        )
    
    try:
        # Quick validation using yt-dlp
        ydl_opts = {'quiet': True, 'no_warnings': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            if info is None:
                return URLValidationResponse(
                    valid=False,
                    message="Could not fetch video information"
                )
        
        return URLValidationResponse(valid=True)
    
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        if "geo" in error_msg.lower():
            message = "Video not available in your region"
        elif "private" in error_msg.lower():
            message = "Video is private"
        elif "removed" in error_msg.lower():
            message = "Video has been removed"
        else:
            message = "Could not access video"
        
        return URLValidationResponse(valid=False, message=message)
    
    except Exception as e:
        return URLValidationResponse(
            valid=False,
            message=f"Validation error: {str(e)}"
        )

@app.post("/api/metadata", response_model=VideoMetadata)
async def get_metadata(request: MetadataRequest):
    """Fetch video metadata"""
    if not validate_youtube_url(request.url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            
            if info is None:
                raise HTTPException(status_code=404, detail="Video not found")
            
            # Extract available formats
            formats = []
            for fmt in info.get('formats', []):
                if fmt.get('height'):
                    formats.append({
                        'format_id': fmt.get('format_id'),
                        'ext': fmt.get('ext'),
                        'resolution': f"{fmt.get('height')}p",
                        'filesize': fmt.get('filesize'),
                    })
            
            return VideoMetadata(
                title=info.get('title', 'Unknown'),
                duration=info.get('duration', 0),
                thumbnail=info.get('thumbnail', ''),
                uploader=info.get('uploader', 'Unknown'),
                formats=formats[:10],  # Limit to 10 formats
            )
    
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching metadata: {str(e)}")

@app.get("/api/download")
async def download_video(
    url: str = Query(..., description="YouTube video URL"),
    format: Literal["audio", "video"] = Query("video", description="Download format"),
    quality: Optional[str] = Query("720", description="Video quality (720, 1080, etc)"),
    audio_format: Optional[str] = Query("mp3", description="Audio format (mp3, aac)"),
    video_format: Optional[str] = Query("mp4", description="Video format (mp4, webm)"),
):
    """Download video with real-time progress via Server-Sent Events"""
    
    if not validate_youtube_url(url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    async def progress_generator() -> AsyncGenerator[str, None]:
        try:
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_template = str(DOWNLOAD_DIR / f"{timestamp}_%(title)s.%(ext)s")
            
            progress_data = {
                "percentage": 0,
                "speed": "",
                "eta": "",
                "status": "downloading",
            }
            
            def progress_hook(d):
                nonlocal progress_data
                if d['status'] == 'downloading':
                    try:
                        percentage = float(d.get('_percent_str', '0%').strip('%'))
                        progress_data = {
                            "percentage": percentage,
                            "speed": d.get('_speed_str', 'N/A'),
                            "eta": d.get('_eta_str', 'N/A'),
                            "status": "downloading",
                        }
                    except:
                        pass
                elif d['status'] == 'finished':
                    progress_data = {
                        "percentage": 100,
                        "speed": "",
                        "eta": "",
                        "status": "processing",
                        "message": "Processing video..."
                    }
            
            # Configure yt-dlp options
            ydl_opts = get_ydl_opts(output_template, format, quality)
            ydl_opts['progress_hooks'] = [progress_hook]
            
            # Start download in thread pool
            loop = asyncio.get_event_loop()
            
            async def download():
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    await loop.run_in_executor(None, ydl.download, [url])
            
            # Stream progress
            download_task = asyncio.create_task(download())
            
            while not download_task.done():
                yield f"data: {json.dumps(progress_data)}\n\n"
                await asyncio.sleep(0.5)
            
            # Check for errors
            if download_task.exception():
                raise download_task.exception()
            
            # Send completion
            completion_data = {
                "percentage": 100,
                "speed": "",
                "eta": "",
                "status": "complete",
                "message": "Download complete!"
            }
            yield f"data: {json.dumps(completion_data)}\n\n"
        
        except yt_dlp.utils.DownloadError as e:
            error_data = {
                "percentage": 0,
                "speed": "",
                "eta": "",
                "status": "error",
                "message": str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"
        
        except Exception as e:
            error_data = {
                "percentage": 0,
                "speed": "",
                "eta": "",
                "status": "error",
                "message": f"Download failed: {str(e)}"
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        progress_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
