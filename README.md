# 🖐️ Hand Connector

> A real-time, browser-based AR hand-tracking experience powered by **MediaPipe Hands** — no installs, no plugins, just your webcam.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-blue?style=flat)

---

## ✨ Features

- 🎥 **Live webcam hand tracking** — detects and syncs up to two hands in real time
- 🦴 **Full skeleton overlay** — landmarks and connectors drawn directly on a canvas
- 🎨 **4 visual themes** — switch between Cosmic, Boreal, Heat, and Monochrome
- 📊 **Live HUD** — shows hands synced, FPS, detected gesture/posture, and spatial variance
- ⚡ **Zero setup** — pure HTML + CSS + JS, runs entirely in the browser
- 📱 **Responsive** — works on both desktop and mobile browsers

---

## 🚀 Getting Started

### Option 1 — Open directly in browser

Just open `index.html` in any modern browser. No server required.

```bash
# Clone the repo
git clone https://github.com/aravinda-dev2004/hand-connector.git
cd hand-connector

# Open in browser
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

### Option 2 — Serve locally (recommended for camera access)

Some browsers restrict webcam access on `file://` URLs. Serve it with a simple local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

## 🕹️ How to Use

1. Open the app — you'll see the **Connector** start screen
2. Click **"Initialize Camera"** to grant webcam access
3. Hold your hand(s) up in front of the camera
4. Watch the AR skeleton track your fingers in real time
5. Use the **theme buttons** to switch visual styles

---

## 🎨 Themes

| Theme | Description |
|---|---|
| **Cosmic** | Deep purple and blue tones — the default |
| **Boreal** | Cool greens inspired by the Northern Lights |
| **Heat** | Warm reds and oranges |
| **Monochrome** | Clean black and white |

---

## 📁 Project Structure

```
hand-connector/
├── index.html    # App shell, UI layout, MediaPipe CDN imports
├── app.js        # Hand tracking logic, canvas rendering, gesture detection
└── style.css     # Styling, themes, animations
```

---

## 🛠️ Built With

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) — real-time hand landmark detection
- [MediaPipe Camera Utils](https://www.npmjs.com/package/@mediapipe/camera_utils) — webcam stream handling
- [MediaPipe Drawing Utils](https://www.npmjs.com/package/@mediapipe/drawing_utils) — landmark and connector rendering
- [Google Fonts — Outfit](https://fonts.google.com/specimen/Outfit) — clean modern typography

---

## 🌐 Browser Support

Works best in **Chrome** or **Edge**. Firefox and Safari may have limited support for MediaPipe's WebAssembly backend.

---

## 📜 License

This project is open source. Feel free to fork, remix, and build on it.

---

<p align="center">Made by <a href="https://github.com/aravinda-dev2004">aravinda-dev2004</a></p>
