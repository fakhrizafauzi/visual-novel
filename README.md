# 🌸 Antigravity: Cinematic Visual Novel Engine

![Hero Image](./public/Main%20Menu.png)

A high-performance, aesthetically-driven visual novel platform built for modern web browsers. Featuring a dual-choice branching narrative system, scoped theme isolation, and a comprehensive story library.

## ✨ Features

- **🎬 Cinematic Narrative Engine**: Supports complex branching paths (`Intro` → `Choice` → `Resolution` → `Choice` → `Ending`).
- **🎨 Scoped Aesthethic Themes**: Dynamic primary colors and kawaii-inspired UI tokens, scoped per story to prevent theme leakage.
- **📱 Responsive Layout**: Fully optimized for Desktop and Mobile (Portrait/Landscape) with fluid scaling.
- **⚙️ Admin Command Center**: Real-time story editor, asset management, and global branding configuration.
- **🔊 Audio Integration**: Seamless BGM cross-fading and per-scene audio controls.
- **🛡️ Secure Persistence**: Firestore-powered data storage with local checkpoint saves.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase Account (for Database/Auth)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/visual-novel.git
   cd visual-novel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   Create a `.env.local` file and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start development:
   ```bash
   npm run dev
   ```

## 📦 Deployment (GitHub Pages)

This project is ready for GitHub Pages. 

1. Build and Deploy:
   ```bash
   npm run deploy
   ```

---
Built with ❤️ by Antigravity Team
