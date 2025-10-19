# Welcome to your Dyad app - Music Player

This application is a React/Vite project designed to demonstrate a music player with synchronized lyric display, powered by a Cloudflare Worker and R2 storage for serving audio and lyric files.

## 1. Frontend Setup and Deployment

The frontend is a standard Vite application.

### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.

### Building for Production

1.  **Build the static files:**
    ```bash
    npm run build
    ```
    The output files will be placed in the `dist` directory.

### Frontend Deployment (Vercel/Netlify/Cloudflare Pages)

The `dist` folder contains all necessary static assets. You can deploy this folder to any static hosting service (e.g., Vercel, Netlify, Cloudflare Pages).

**Important Environment Variable:**

The frontend needs to know the URL of your deployed Cloudflare Worker API.

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_WORKER_API_URL` | The public URL of your deployed Cloudflare Worker. | `https://your-worker-name.your-username.workers.dev/` |

Ensure this variable is set in your hosting provider's environment settings.

---

## 2. Cloudflare R2 and Worker Setup (Backend API)

This application relies on a Cloudflare Worker to serve a list of tracks and their associated lyrics from an R2 bucket.

### A. Cloudflare R2 Setup

1.  **Create an R2 Bucket:**
    *   Go to your Cloudflare Dashboard.
    *   Navigate to R2 and create a new bucket (e.g., `music-bucket`).
2.  **Upload Files:**
    *   Upload your music files (e.g., `Song Title - Artist.flac`) and their corresponding lyric files (e.g., `Song Title - Artist.lrc`) to the bucket.
    *   The Worker expects the FLAC and LRC files to share the same base name.
3.  **Get Public URL:**
    *   In the R2 bucket settings, ensure you have a **Public Access URL** configured (e.g., `https://pub-xxxx.r2.dev/`). This is your `R2_PUBLIC_URL_PREFIX`.

### B. Cloudflare Worker Deployment

The Worker code is provided in `src/workers/r2-track-api.js`.

1.  **Create a new Worker:**
    *   In the Cloudflare Dashboard, create a new Worker service (e.g., `music-api`).
2.  **Configure Worker Bindings:**
    *   In the Worker settings, go to **Settings -> Variables**.
    *   **R2 Bucket Bindings:** Add an R2 Bucket binding.
        *   Variable Name: `BUCKET`
        *   R2 Bucket: Select the bucket you created (e.g., `music-bucket`).
    *   **Environment Variables:** Add a standard environment variable.
        *   Variable Name: `R2_PUBLIC_URL_PREFIX`
        *   Value: The Public Access URL of your R2 bucket (e.g., `https://pub-xxxx.r2.dev`).
3.  **Deploy the Worker Code:**
    *   Copy the content of `src/workers/r2-track-api.js` into your Cloudflare Worker script editor and deploy it.
    *   The deployed Worker URL (e.g., `https://music-api.your-username.workers.dev/`) is the value you need for the frontend's `VITE_WORKER_API_URL`.

This setup ensures the frontend fetches track metadata and lyrics from the Worker, and the audio files are served directly from the R2 public URL.