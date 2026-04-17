# 🎵 Groovify - Premium Music Discovery

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Groovify is a state-of-the-art, Spotify-inspired music streaming application built for the modern web. It features a seamless, glassmorphic UI and integrates multiple music sources (Jamendo, SoundCloud, YouTube) into a single, unified experience.

![Groovify Preview](https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1200&q=80)

## ✨ Features

- **Unified Search Engine**: Discover millions of tracks across Jamendo and SoundCloud simultaneously.
- **Smart Import**: Paste any YouTube or SoundCloud link to instantly add and play tracks.
- **Discovery & Trending**: Live-synced trending feeds powered by the Jamendo API.
- **Cinematic Player**: A high-performance playback engine with glassmorphic visuals and full metadata support.
- **Personal Library**: Create playlists and "Like" tracks with local persistence.
- **Responsive & Premium**: Fully fluid design optimized for high-resolution displays.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Playback**: [React Player](https://github.com/cookpete/react-player)

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PRINCESTR/Groovify.git
   cd Groovify
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your API credentials:
   ```env
   VITE_JAMENDO_CLIENT_ID=your_id_here
   VITE_JAMENDO_CLIENT_SECRET=your_secret_here
   VITE_SOUNDCLOUD_CLIENT_ID=your_sc_id_here
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 📦 Deployment on Vercel

### 1. Push to GitHub
Ensure all your changes are pushed to your repository.

### 2. Connect to Vercel
- Go to the [Vercel Dashboard](https://vercel.com/).
- Click **New Project** and import your `Groovify` repository.

### 3. Add Environment Variables
In the Vercel project settings, add the following variables:
- `VITE_JAMENDO_CLIENT_ID`
- `VITE_JAMENDO_CLIENT_SECRET`
- `VITE_SOUNDCLOUD_CLIENT_ID` (Optional)

### 4. Deploy
Click **Deploy**. Vercel will automatically detect the Vite setup and handle the rest!

## 📜 License

This project is for personal use and educational purposes.

---

Built with ❤️ by [PRINCESTR](https://github.com/PRINCESTR)
