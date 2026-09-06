# MightyClipper — Frontend

MightyClipper is an AI-powered video clipping tool designed to help creators turn long-form videos into short, shareable clips.

The frontend provides the creator-facing experience for uploading videos, monitoring AI processing, reviewing suggested clips, generating selected clips, and previewing or downloading the final results.

## ✨ Features

- Upload long-form video files
- Drag-and-drop video upload
- AI-powered transcription
- AI analysis of video content
- AI-generated clip suggestions
- Clip scoring and ranking
- Selective clip rendering
- Rendered video previews
- Clip downloads
- Processing status and progress feedback
- Responsive creator-focused interface

## 🧩 Product Flow

MightyClipper follows a simple three-stage workflow:

### 01 — Analyze

Upload a video and let AI understand its content.

### 02 — Discover

MightyClipper analyzes the transcript and visual information to identify moments that may work well as short-form content.

### 03 — Clip

Choose the suggested moments you want to keep and generate ready-to-share video clips.

```text
Upload video
     ↓
Transcription
     ↓
Visual analysis
     ↓
AI clip discovery
     ↓
Review suggestions
     ↓
Generate selected clips
     ↓
Preview / Download
```

## 🛠 Tech Stack

- **Next.js 16**
- **React**
- **JavaScript**
- **Tailwind CSS**
- **Next.js App Router**
- **Cloudflare Workers**
- **Cloudflare R2**
- **Cloudflare Workers AI**

The frontend is intentionally built with JavaScript rather than TypeScript.

## 📁 Project Structure

```text
ai-clip-generator-frontend/
│
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── components/
│   ├── ClipCard.js
│   ├── ClipResultsGrid.js
│   ├── ErrorBanner.js
│   ├── LogoButton.js
│   ├── PreviewModal.js
│   ├── ProcessingPanel.js
│   ├── ScoreMeter.js
│   ├── TopBar.js
│   └── UploadZone.js
│
├── lib/
│   ├── api.js
│   ├── format.js
│   └── media.js
│
├── app/
│   └── favicon.ico
│
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

### Main Components

- **`UploadZone.js`** — Handles video selection and drag-and-drop uploads.
- **`ProcessingPanel.js`** — Displays the current stage of the AI processing pipeline.
- **`ClipResultsGrid.js`** — Displays the AI-generated clip suggestions.
- **`ClipCard.js`** — Displays individual clip information, scores, timestamps and rendering state.
- **`PreviewModal.js`** — Provides a larger preview of generated clips.
- **`ScoreMeter.js`** — Displays the AI-generated clip score.
- **`TopBar.js`** — Contains the MightyClipper branding and header.
- **`LogoButton.js`** — Provides the layered video-frame brand mark used in the header.

### API Layer

- **`lib/api.js`** — Handles communication between the frontend and the production backend/workers.
- **`lib/media.js`** — Contains frontend media-related helpers.
- **`lib/format.js`** — Contains formatting utilities used throughout the interface.

Keeping the API and media logic separate from the UI components helps maintain a clear separation between presentation and application logic.

## 🔌 Backend Integration

The frontend communicates with a separate backend repository.

### Backend Repository

`ai-clip-generator-mvp`

The backend is deployed using Cloudflare Workers/OpenNext.

The main processing pipeline is:

```text
Frontend
   │
   ├── Upload URL API
   │       ↓
   │      R2
   │
   ├── Transcription API
   │       ↓
   │   Workers AI / Whisper
   │
   ├── Visual Analysis Worker
   │       ↓
   │   Cloudflare Media
   │
   ├── Transcript Analysis API
   │       ↓
   │   AI clip suggestions
   │
   └── Clip Worker
           ↓
          R2
           ↓
      Preview / Download
```

The backend is maintained separately from this repository.

## ⚙️ Local Development

### Requirements

- Node.js
- npm
- Access to the MightyClipper backend

### Installation

Clone the repository:

```bash
git clone https://github.com/frirsta/ai-clip-generator-frontend.git
```

Enter the project directory:

```bash
cd ai-clip-generator-frontend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_BACKEND_URL=https://ai-clip-generator-mvp.ai-clip-generator-mvp.workers.dev
```

### Start the Development Server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 🏗 Production Build

Create a production build:

```bash
npm run build
```

Run the production build locally:

```bash
npm start
```

## 🎨 Design Direction

MightyClipper uses a dark, premium creator-focused visual identity built around the principle:

> **Luxury through restraint.**

The interface emphasizes:

- Minimal visual noise
- Strong typography hierarchy
- Dark neutral surfaces
- Restrained use of Mighty Blue
- Clear processing states
- Creator-focused workflows
- Compact metadata and timecode presentation
- Responsive layouts

## 📱 Responsive Design

The interface is designed for both desktop and mobile use.

The primary desktop design target is approximately:

```text
1366 × 768
```

The upload workflow, processing states, clip cards and preview interface adapt to smaller screens.

## 🚧 Current MVP Status

The current MVP supports the core end-to-end workflow:

- Video upload
- Transcription
- Visual analysis
- AI clip discovery
- Clip selection
- Clip rendering
- Preview
- Download

The frontend currently focuses on validating the core creator workflow before expanding into a larger SaaS product.

### Planned Development

Future areas include:

- Automatic captions
- Vertical 9:16 clips
- Smart subject/face cropping
- Improved AI clip ranking
- Caption styling
- Creator branding
- Project history
- User accounts
- Usage limits and subscriptions

## 🔗 Related Repository

**Backend:** `ai-clip-generator-mvp`

The frontend and backend are maintained as separate repositories.

## 📄 License

This project is currently under development and is not yet licensed for redistribution.

## 🎨 Attribution

The project favicon uses a video player icon from Flaticon:

[Video player icons created by Ahmad Roaayala - Flaticon](https://www.flaticon.com/free-icons/video-player)
