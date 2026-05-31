# 👑 GODFATHER XMD - WhatsApp Multi-Device Bot

<p align="center">
  <img src="https://img.shields.io/badge/GODFATHER-XMD-red?style=for-the-badge&logo=whatsapp" alt="GODFATHER XMD">
  <img src="https://img.shields.io/badge/Created%20by-Soham-blue?style=for-the-badge" alt="Soham">
  <img src="https://img.shields.io/badge/Version-3.0.0-green?style=for-the-badge" alt="Version">
</p>

## ✨ Features

### 🔐 Authentication
- **Pair Code Generator** - Link without QR scanning
- **Session ID Generator** - Generate, export, and restore sessions
- **QR Code Authentication** - Traditional QR scan method

### 🤖 Bot Features (65+ Commands)
- 📋 **General** - Menu, ping, info, owner, runtime
- 🛠️ **Tools** - TTS, translate, calculator, weather, wiki, QR
- ⬇️ **Download** - YouTube, Instagram, TikTok, Facebook
- 👥 **Group** - Kick, add, promote, demote, mute, tagall, warn
- 🎮 **Fun** - Joke, quote, truth/dare, 8ball, ship, roast
- 🤖 **AI** - ChatGPT, Gemini, AI Image Generation
- 🔍 **Search** - Google, YouTube, lyrics, image, GitHub
- 🎨 **Sticker** - Image/video to sticker, sticker to image
- 🔄 **Converter** - Audio, video, voice note, GIF
- 🔒 **Owner** - Ban, broadcast, eval, exec, session management

### 🛡️ Protection
- Anti-Link detection & auto-kick
- Anti-Bad Word filter
- Anti-Call auto-reject
- Anti-Spam protection
- Warning system (3 strikes)

### 📊 Management
- Welcome/Goodbye messages with profile pictures
- User database & tracking
- Premium user system
- Ban/Unban system
- Multi-mode (public/private/group)

## 📦 Installation

### Prerequisites
- Node.js v16 or higher
- Git

### Steps

```bash
# Clone the repository
git clone https://github.com/soham/godfather-xmd.git

# Enter directory
cd godfather-xmd

# Install dependencies
npm install

# Configure (edit config.js with your details)
nano config.js

# Generate pair code (recommended)
npm run pair

# OR generate session ID
npm run session

# Start the bot
npm start