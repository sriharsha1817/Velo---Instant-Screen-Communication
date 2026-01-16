
# VELO - Instant Screen Communication

Velo is a high-velocity screen recording and sharing platform designed to replace meetings with clear, concise video messages. Built for teams that move fast, it allows users to capture their screen and camera, refine the message, and share it instantly.

## ✨ High-Velocity Features

- **Turbo Recording**: Instant screen + camera + mic capture with a signature floating webcam bubble.
- **Precision Trimmer**: Interface for isolating the most valuable parts of your message.
- **Velo Share**: Instant public URL generation for immediate asynchronous feedback.
- **Insights Dashboard**: Real-time analytics tracking views and audience retention.
- **Zero-Latency Persistence**: Local-first architecture for the fastest possible user experience.

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Edge, or Brave recommended for full `getDisplayMedia` support).
- Node.js (if running in a local dev environment).

### Setup Instructions
1. **Clone the project** into your local directory.
2. **Install dependencies** (if using a package manager):
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Permissions**: When prompted, allow **Camera** and **Microphone** access. When clicking "Start Recording," select the screen or window you wish to capture.

---

## 🏗️ Architecture Decisions

The Velo MVP is designed with a **modular, service-oriented frontend architecture** to ensure scalability and separation of concerns:

### 1. State Machine Routing
Instead of a heavy routing library, Velo uses a **Hash-based State Machine** (`AppState`). This ensures that the app remains a single-page experience while allowing "Public Links" (e.g., `#view=xyz`) to be shared and resolved instantly without server-side routing logic.

### 2. Local-First Persistence (`storageService.ts`)
To achieve "Zero-Latency," the application utilizes a service layer wrapping `localStorage`. This allows for:
- Instant saving/loading of video metadata.
- Persistence across sessions without requiring an initial backend setup.
- De-coupling the UI components from the underlying storage implementation.

### 3. Composite Media Handling
The `Recorder` component handles complex stream orchestration:
- It requests separate `DisplayMedia` (screen) and `UserMedia` (mic/cam) streams.
- It provides a real-time "Picture-in-Picture" webcam preview.
- It synchronizes tracks into a single `MediaRecorder` instance using the `VP9` codec for high-quality, low-bandwidth WebM files.

### 4. Reactive Analytics Engine
Engagement tracking is handled passively within the `VideoPlayer`. It monitors the `onTimeUpdate` events to calculate "Max Progress," which is then reported back to the storage service to generate retention metrics without user intervention.

---

## 📈 Production Roadmap & Improvements

While this MVP represents a "real slice" of the product, the following improvements would be prioritized for a production-scale rollout:

### 1. Backend & Cloud Storage
- **Migration**: Move from `localStorage` to a distributed database (PostgreSQL/Supabase).
- **Video Hosting**: Integrate AWS S3 or Cloudflare R2 for reliable video blob storage.
- **CDN**: Use a Content Delivery Network (like Cloudfront) for global, low-latency video playback.

### 2. Advanced Video Processing
- **Server-Side Trimming**: Implement `FFmpeg` on the backend or use `ffmpeg.wasm` for true client-side frame-accurate clipping.
- **Transcoding**: Automatically generate multiple resolutions (720p, 1080p) and formats (MP4/HLS) for cross-device compatibility.

### 3. AI-Powered Intelligence
- **Transcriptions**: Integrate Gemini API or Whisper to provide automatic captions and searchable transcripts.
- **Auto-Summaries**: Generate TL;DR summaries and "Chapters" based on the video content.

### 4. Collaboration Layer
- **Interactive Comments**: Allow viewers to leave time-stamped comments and emoji reactions.
- **Workspaces**: Implement Team/Organization structures with Role-Based Access Control (RBAC).

---

*Move faster. Stay clear. Use Velo.*
