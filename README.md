# Friendsy Data Words — Learn Data Basics (PWA)

A cozy word puzzle game to learn foundational data concepts. Guess the term from its definition, use hints sparingly, and earn streaks. The app is a ready-to-deploy PWA with offline support and install prompt. Background lo-fi is generated with the WebAudio API (no external files).

## Features
- 30+ essential data terms with concise definitions & hints
- Scrambled-letters display + type-to-guess flow
- Scoring with penalties for hints/skips and streak tracking
- Keyboard-first UX, mobile-friendly
- Procedural background music (no assets)
- Installable PWA (manifest + service worker)
- Icon set (64–512 PNG), dark cozy theme
- 100% offline after first load

## Run locally
Serve the folder with any static file server (required for service worker), e.g.:

```bash
python -m http.server 8080
# open http://localhost:8080
```

## Deploy
Upload the folder to any static host (Netlify, Vercel, GitHub Pages, S3 static hosting, etc.). The service worker precaches all core files.

Enjoy and keep learning! ☕📊
