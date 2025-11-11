# Product Specification: YouTube Video Downloader

## 1. Product Overview

### 1.1 Purpose
A web-based YouTube video downloader that allows users to download videos and audio from YouTube in various formats and qualities with real-time progress tracking.

### 1.2 Target Users
- Content creators needing offline access to reference materials
- Users with limited internet connectivity
- Educational institutions archiving educational content
- Researchers collecting video data

### 1.3 Core Value Proposition
- **Fast**: Real-time progress tracking with speed and ETA
- **Flexible**: Multiple format and quality options
- **Secure**: Automatic file cleanup and privacy-focused
- **Simple**: Intuitive single-page interface

## 2. Technical Architecture

### 2.1 Technology Stack

**Frontend**
- Framework: React 18 with TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS with custom design system
- State Management: React hooks (useState, useEffect)
- Routing: React Router v6
- UI Components: Radix UI primitives with shadcn/ui
- HTTP Client: Fetch API with EventSource for SSE

**Backend**
- Framework: FastAPI (Python 3.9+)
- Media Processing: yt-dlp library
- Async Runtime: asyncio
- CORS: FastAPI CORS middleware
- File Management: Python os/pathlib with background cleanup

### 2.2 System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  React Frontend │◄───────►│ FastAPI Backend │
│   (Port 5173)   │         │   (Port 8000)   │
│                 │         │                 │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │   yt-dlp Core   │
                            │                 │
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │  YouTube APIs   │
                            │                 │
                            └─────────────────┘
```

### 2.3 Data Flow

1. **URL Validation Flow**
   - User inputs URL → Frontend validates format → Backend validates with yt-dlp → Returns validation result

2. **Metadata Fetch Flow**
   - Valid URL → Backend extracts metadata → Returns title, duration, thumbnail, uploader, formats

3. **Download Flow**
   - User selects format/quality → Backend streams progress via SSE → Frontend updates progress bar → File ready for download

## 3. Features & Requirements

### 3.1 Functional Requirements

#### FR-1: URL Validation
- **Priority**: P0 (Critical)
- **Description**: Validate YouTube URLs before processing
- **Acceptance Criteria**:
  - Supports standard YouTube URLs (youtube.com/watch?v=)
  - Supports short URLs (youtu.be/)
  - Detects invalid URLs with clear error messages
  - Handles geo-restricted content
  - Detects private/removed videos
  - Response time < 2 seconds

#### FR-2: Video Metadata Display
- **Priority**: P0 (Critical)
- **Description**: Display video information before download
- **Acceptance Criteria**:
  - Shows video thumbnail (high quality)
  - Displays title (max 2 lines with ellipsis)
  - Shows uploader name
  - Displays duration in HH:MM:SS format
  - Loads within 3 seconds of valid URL submission

#### FR-3: Format Selection
- **Priority**: P0 (Critical)
- **Description**: Allow users to choose download format
- **Acceptance Criteria**:
  - Audio formats: MP3, AAC
  - Video formats: MP4, WebM
  - Video quality options: 1080p, 720p, 480p, 360p
  - Audio bitrate: 192kbps standard
  - Clear visual format selector with icons

#### FR-4: Real-Time Download Progress
- **Priority**: P0 (Critical)
- **Description**: Show live download progress
- **Acceptance Criteria**:
  - Progress bar (0-100%)
  - Current download speed (MB/s)
  - Estimated time remaining (ETA)
  - Updates every second
  - Handles progress for both audio and video
  - Clear completion state

#### FR-5: File Download
- **Priority**: P0 (Critical)
- **Description**: Deliver processed file to user
- **Acceptance Criteria**:
  - Automatic browser download on completion
  - Proper file naming (sanitized video title)
  - Correct file extension
  - Files stored temporarily on server
  - Download link expires after retrieval

#### FR-6: Error Handling
- **Priority**: P0 (Critical)
- **Description**: Graceful error handling with user feedback
- **Acceptance Criteria**:
  - Network timeout errors (> 30s)
  - Invalid URL errors
  - Geo-restriction errors
  - Private/removed video errors
  - Server errors (500)
  - Rate limiting errors
  - User-friendly error messages with toast notifications

#### FR-7: File Cleanup
- **Priority**: P1 (High)
- **Description**: Automatic server cleanup of old files
- **Acceptance Criteria**:
  - Files deleted after 1 hour
  - Cleanup runs every 30 minutes
  - Handles file system errors gracefully
  - Logs cleanup operations

#### FR-8: Reset/New Download
- **Priority**: P1 (High)
- **Description**: Allow users to start a new download
- **Acceptance Criteria**:
  - "New Download" button visible after video metadata loads
  - Clears current state
  - Returns to URL input screen
  - Cancels any in-progress downloads

### 3.2 Non-Functional Requirements

#### NFR-1: Performance
- Page load time: < 2 seconds
- URL validation: < 2 seconds
- Metadata fetch: < 3 seconds
- Download initiation: < 1 second
- Progress updates: Every 1 second

#### NFR-2: Scalability
- Support 10 concurrent downloads
- Handle videos up to 2GB
- Process queues for > 10 requests

#### NFR-3: Security
- No storage of user data
- Automatic file cleanup
- CORS configuration for production
- Input sanitization
- Rate limiting (10 requests/minute per IP)

#### NFR-4: Usability
- Mobile-responsive design
- Accessible (WCAG 2.1 AA)
- Clear visual feedback
- Intuitive single-page flow
- No registration required

#### NFR-5: Reliability
- 99% uptime target
- Graceful degradation
- Comprehensive error handling
- Automatic retry for transient failures

## 4. User Flows

### 4.1 Happy Path: Video Download

```
1. User lands on homepage
   ↓
2. User enters YouTube URL
   ↓
3. System validates URL (2s)
   ↓
4. System fetches metadata (3s)
   ↓
5. User sees video preview
   ↓
6. User selects format (Video, MP4, 720p)
   ↓
7. User clicks "Start Download"
   ↓
8. Progress bar shows real-time progress
   ↓
9. Download completes
   ↓
10. File downloads to user's device
    ↓
11. User clicks "New Download" or closes tab
```

### 4.2 Error Path: Invalid URL

```
1. User enters invalid URL
   ↓
2. System validates URL
   ↓
3. Error toast appears: "Invalid URL"
   ↓
4. User corrects URL
   ↓
5. Continues to happy path
```

### 4.3 Error Path: Geo-Restricted Content

```
1. User enters valid URL
   ↓
2. System validates URL
   ↓
3. yt-dlp detects geo-restriction
   ↓
4. Error toast: "Video not available in your region"
   ↓
5. User tries different video
```

## 5. API Specification

### 5.1 Validate URL

**Endpoint**: `POST /api/validate`

**Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response (Success)**:
```json
{
  "valid": true,
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response (Error)**:
```json
{
  "valid": false,
  "message": "Invalid YouTube URL format"
}
```

**Status Codes**:
- 200: Valid URL
- 400: Invalid URL format
- 403: Geo-restricted or private
- 404: Video not found
- 500: Server error

### 5.2 Fetch Metadata

**Endpoint**: `POST /api/metadata`

**Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response**:
```json
{
  "title": "Rick Astley - Never Gonna Give You Up",
  "duration": 213,
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "uploader": "Rick Astley",
  "formats": {
    "video": ["1080p", "720p", "480p", "360p"],
    "audio": ["mp3", "aac"]
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request
- 500: Extraction failed

### 5.3 Download Media

**Endpoint**: `GET /api/download`

**Query Parameters**:
- `url` (required): YouTube video URL
- `format` (required): "audio" | "video"
- `quality` (optional): "1080" | "720" | "480" | "360"
- `audioFormat` (optional): "mp3" | "aac"
- `videoFormat` (optional): "mp4" | "webm"

**Response**: Server-Sent Events (SSE) stream

**Event Types**:

1. **Progress Event**:
```json
{
  "status": "downloading",
  "percentage": 45.2,
  "speed": "2.5 MB/s",
  "eta": "00:23"
}
```

2. **Complete Event**:
```json
{
  "status": "complete",
  "percentage": 100,
  "filename": "Rick_Astley_Never_Gonna_Give_You_Up.mp4",
  "download_url": "/downloads/abc123.mp4"
}
```

3. **Error Event**:
```json
{
  "status": "error",
  "message": "Download failed: Network timeout"
}
```

## 6. UI/UX Specifications

### 6.1 Design System

**Color Palette** (HSL values in CSS variables):
- Primary: Emerald/Teal gradient
- Background: Dark mode default
- Foreground: High contrast text
- Muted: Secondary text
- Accent: Interactive elements

**Typography**:
- Headings: Bold, large (5xl-6xl for hero)
- Body: Regular, readable (base-xl)
- Labels: Semibold, small

**Spacing**:
- Container: max-w-4xl centered
- Sections: py-12, space-y-8
- Components: p-6, gap-4

**Animations**:
- Page transitions: 0.3s ease
- Button hovers: opacity change
- Progress bar: smooth width transition

### 6.2 Responsive Breakpoints

- Mobile: < 640px (stacked layout)
- Tablet: 640px - 1024px (2-column where appropriate)
- Desktop: > 1024px (3-column features, full layout)

### 6.3 Component Specifications

#### Hero Section
- Full-width gradient background with grid pattern
- Centered heading with gradient text
- Subtitle explaining value proposition
- Prominent URL input below

#### Video Preview Card
- 16:9 aspect ratio thumbnail
- Gradient overlay with duration badge
- Title (2-line clamp)
- Uploader name
- Glassmorphism effect (backdrop-blur)

#### Format Selector
- Tab-style toggle (Audio/Video)
- Dropdown selects for formats
- Dropdown for quality options
- Clear visual hierarchy

#### Progress Display
- Large progress bar (full width)
- Percentage display (center or right)
- Speed and ETA below bar
- Pulsing animation during download

#### Feature Cards (Homepage)
- 3 columns on desktop
- Icon at top
- Bold heading
- Short description
- Consistent card height

## 7. Error Handling Matrix

| Error Type | User Message | Technical Action | HTTP Code |
|------------|--------------|------------------|-----------|
| Invalid URL format | "Please enter a valid YouTube URL" | Show inline error | 400 |
| Network timeout | "Connection timed out. Please try again" | Retry once, then fail | 408 |
| Geo-restricted | "Video not available in your region" | Log, show error | 403 |
| Private video | "This video is private or unavailable" | Show error toast | 404 |
| Removed video | "Video has been removed by uploader" | Show error toast | 404 |
| Server error | "Something went wrong. Please try again" | Log error, notify admin | 500 |
| Rate limit | "Too many requests. Please wait a moment" | Show countdown timer | 429 |
| File too large | "Video is too large (max 2GB)" | Check before download | 413 |
| Unsupported format | "Requested quality not available" | Offer alternatives | 400 |

## 8. Security Considerations

### 8.1 Input Validation
- Sanitize all URL inputs
- Whitelist YouTube domains only
- Prevent path traversal attacks
- Limit URL length (< 2048 chars)

### 8.2 Rate Limiting
- 10 requests per minute per IP
- 50 requests per hour per IP
- Implement exponential backoff

### 8.3 File Security
- Store files outside web root
- Generate random filenames
- Implement access tokens for downloads
- Automatic cleanup (1 hour max)
- No execution permissions on download directory

### 8.4 CORS Configuration
- Whitelist specific origins in production
- No credentials in CORS headers
- Restrict HTTP methods

### 8.5 Data Privacy
- No user tracking or analytics by default
- No storage of URLs or metadata
- No logging of user IPs in production
- Clear privacy policy

## 9. Performance Optimization

### 9.1 Frontend
- Code splitting by route
- Lazy load components
- Optimize images (thumbnail caching)
- Minimize bundle size (< 500KB)
- Use React.memo for expensive components

### 9.2 Backend
- Async/await for I/O operations
- Stream large files (chunked transfer)
- Connection pooling
- Caching for repeated URLs (5-minute TTL)
- Efficient file cleanup (batch operations)

### 9.3 Network
- CDN for static assets
- Compression (gzip/brotli)
- HTTP/2 support
- Efficient SSE connection management

## 10. Testing Strategy

### 10.1 Unit Tests
- URL validation logic
- Format selection logic
- Progress calculation
- Error handling functions
- File cleanup routine

### 10.2 Integration Tests
- API endpoint responses
- SSE streaming
- File download flow
- Error propagation
- Database/filesystem interactions

### 10.3 E2E Tests
- Complete download flow (audio)
- Complete download flow (video)
- Error scenarios
- Mobile responsive tests
- Accessibility tests

### 10.4 Performance Tests
- Load testing (10 concurrent users)
- Stress testing (50+ users)
- Large file downloads (2GB)
- Network latency simulation

## 11. Deployment

### 11.1 Frontend Deployment
- Platform: Lovable (default) or Vercel/Netlify
- Build command: `npm run build`
- Output directory: `dist/`
- Environment variables: `VITE_API_URL`

### 11.2 Backend Deployment
- Platform: Railway, Render, AWS EC2, or DigitalOcean
- Requirements: Python 3.9+, ffmpeg
- Environment: Production CORS settings
- Health check: `/health` endpoint
- Logging: Structured JSON logs

### 11.3 Infrastructure
```
Frontend (CDN) → API Gateway → Backend (FastAPI)
                                     ↓
                              Temp Storage (/downloads)
```

## 12. Monitoring & Analytics

### 12.1 Metrics to Track
- Downloads per day/week/month
- Average download time
- Error rate by type
- Most common video qualities
- Peak usage times
- Server resource usage (CPU, memory, disk)

### 12.2 Logging
- All API requests (URL sanitized)
- Download success/failure
- Error stack traces
- Cleanup operations
- Performance bottlenecks

### 12.3 Alerts
- Error rate > 5%
- Disk usage > 80%
- API response time > 5s
- Server downtime

## 13. Future Enhancements

### 13.1 Phase 2 Features (3-6 months)
- [ ] Playlist download support
- [ ] Subtitle download options
- [ ] Video preview before download
- [ ] Download history (optional user account)
- [ ] Batch download queue
- [ ] Custom quality selection (bitrate)

### 13.2 Phase 3 Features (6-12 months)
- [ ] Support for other platforms (Vimeo, Dailymotion)
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] User accounts with saved preferences
- [ ] Premium tier with higher limits

### 13.3 Technical Improvements
- [ ] Implement message queue (Celery/Redis)
- [ ] Horizontal scaling with load balancer
- [ ] CDN integration for faster downloads
- [ ] WebSocket alternative to SSE
- [ ] Progressive Web App (PWA)
- [ ] Dark/light mode toggle
- [ ] Internationalization (i18n)

## 14. Success Metrics

### 14.1 Launch Metrics (First 30 days)
- 1,000+ successful downloads
- < 5% error rate
- Average rating 4+ stars
- 99% uptime

### 14.2 Growth Metrics (First 90 days)
- 10,000+ total downloads
- 50% return user rate
- < 3% error rate
- Expansion to 3 deployment regions

## 15. Glossary

- **SSE**: Server-Sent Events, one-way communication from server to client
- **yt-dlp**: YouTube download library, fork of youtube-dl
- **Geo-restriction**: Content blocked in certain geographic regions
- **Bitrate**: Quality measurement for audio/video (higher = better quality)
- **Sanitization**: Cleaning user input to prevent security vulnerabilities
- **CDN**: Content Delivery Network for fast static asset delivery
- **Rate Limiting**: Restricting number of requests per time period

## 16. Appendix

### 16.1 Dependencies
**Frontend**:
- react: ^18.3.1
- react-router-dom: ^6.30.1
- tailwindcss: ^3.4.0
- lucide-react: ^0.462.0

**Backend**:
- fastapi: ^0.115.0
- yt-dlp: ^2024.10.7
- uvicorn: ^0.32.0
- python-multipart: ^0.0.12

### 16.2 Browser Support
- Chrome: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Edge: Last 2 versions

### 16.3 Legal Considerations
- Terms of Service compliance with YouTube
- Copyright and fair use notices
- DMCA compliance procedure
- User responsibility disclaimer

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-11  
**Owner**: Engineering Team  
**Status**: Draft → Review → Approved
