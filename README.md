# F.R.I.D.A.Y. Deck

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://hardihuang.github.io/peter/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **F**emale **R**eplacement **I**ntelligent **D**igital **A**ssistant **Y**outh

A retro-futuristic, cyberpunk-themed personal dashboard and mini-app collection designed for 7-inch touchscreen displays (800×480). Built with pure HTML/CSS/JavaScript - no frameworks, no dependencies.

![F.R.I.D.A.Y. Deck Screenshot](https://via.placeholder.com/800x480/000000/00ff00?text=F.R.I.D.A.Y.+Deck)

## 🎮 Live Demo

**[https://hardihuang.github.io/peter/](https://hardihuang.github.io/peter/)**

Open in any modern browser. Optimized for Chrome/Chromium on Linux-based SBCs (Orange Pi, Raspberry Pi, etc.).

---

## ✨ Features

### 🖥️ Main Dashboard
- **Real-time system monitoring** - CPU load, memory usage, uptime, public IP
- **Agent status panel** - Visual representation of AI sub-agents
- **Application launcher** - Grid-based app menu
- **Live clock** - CST (China Standard Time) with date
- **Typing animation** - Retro terminal boot effect
- **Scanline effect** - Authentic CRT monitor aesthetic
- **Click sound effects** - Web Audio API generated sounds

### 🎨 Visual Design
- **Cyberpunk green terminal theme** (`#0f0` on `#000`)
- **Fixed 800×480 resolution** - No scrolling, perfect for small touchscreens
- **CSS Grid layouts** - Responsive within fixed viewport
- **Monospace typography** - Courier New for authentic terminal feel
- **CRT scanline animation** - Nostalgic monitor effect
- **Hover states** - Visual feedback on all interactive elements

---

## 📱 Applications

### 1. ⚙️ Settings
**File:** `settings.html`

System configuration panel with 5 tabs:

| Tab | Features |
|-----|----------|
| **SYSTEM** | SSH toggle, NTP sync, auto-start, hostname editor |
| **DISPLAY** | Brightness slider (CSS filter), screen timeout, resolution selector |
| **AUDIO** | Master volume, output device selector (HDMI/3.5mm/Bluetooth), system sounds toggle |
| **THEME** | 6 color themes (Green/Blue/Amber/Red/Purple/Cyan) - *CSS variable based* |
| **POWER** | Save settings, reset defaults, reboot, shutdown, quick actions |

**Technical highlights:**
- All settings persist to `localStorage`
- Real-time brightness adjustment via CSS `filter: brightness()`
- Theme system using CSS custom properties

---

### 2. 🍅 Pomodoro Timer
**File:** `pomodoro.html`

Professional productivity timer with ambient soundscapes.

**Features:**
- **3 timer modes:** Work (default 25min), Short Break (5min), Long Break (15min)
- **Session tracking** - Visual dots show completed work sessions
- **Auto-switching** - Automatically cycles between work and breaks
- **Customizable durations** - Edit times for all 3 modes
- **Sound options:**
  - TICK 1 - Dragon studio clock ticking
  - TICK 2 - Alternative clock ticking
  - WATER - Flowing water (ambient)
  - FIRE - Campfire in night forest (ambient)
- **Volume control** - Slider with persistence
- **Pause/Resume** - Full control during sessions

**Technical highlights:**
- Web Audio API for seamless looping
- `localStorage` for preferences
- CSS animations for visual feedback

---

### 3. 🧮 Calculator
**File:** `calculator.html`

Scientific calculator with 3 modes.

**Modes:**
- **BASIC** - Standard arithmetic (+, −, ×, ÷)
- **SCIENTIFIC** - sin, cos, tan, log, ln, √, π, e, powers
- **PROGRAMMER** - HEX/BIN/OCT/DEC conversion, bitwise operations (AND, OR, XOR, NOT)

**Features:**
- Expression display with history
- Keyboard support
- Error handling
- Mode switching without losing current value

---

### 4. 🔢 Sudoku
**File:** `sudoku.html`

Classic number puzzle game.

**Features:**
- **3 difficulties:** Easy, Medium, Hard
- **Random generation** - New puzzle every time
- **Drag-and-drop** or **click-to-select** input methods
- **Hint system** - Reveals one correct cell
- **Error checking** - Validates current state
- **Timer** - Tracks solve time
- **Session persistence** - Saves progress

**How to play:**
1. Click a cell to select it
2. Click a number (1-9) to fill
3. Or select a number first, then click multiple cells

---

### 5. 💣 Minesweeper
**File:** `minesweeper.html`

Classic mine-clearing puzzle.

**Features:**
- **3 difficulties:**
  - Easy: 9×9, 10 mines
  - Medium: 16×16, 40 mines
  - Hard: 20×20, 80 mines
- **3 action modes:**
  - 🔍 **REVEAL** - Open cells
  - ⚑ **FLAG** - Mark suspected mines
  - ✕ **DELETE** - Remove flags
- **First-click safe** - Never hits a mine on first move
- **Auto-reveal** - Clears empty adjacent areas
- **Timer & mine counter**
- **Color-coded numbers** - Each number 1-8 has distinct color

---

## 🎮 Games (Additional)

### ⚔️ The Arena
**File:** `games/the-arena.html`

*Description coming soon*

### 👊 Pixel Smash
**File:** `games/pixel-smash.html`

*Description coming soon*

### 🐍 Snake
**File:** `games/snake.html`

*Description coming soon*

---

## 🏗️ Technical Architecture

### Project Structure
```
peter/
├── index.html              # Main dashboard
├── settings.html           # Settings panel
├── pomodoro.html          # Pomodoro timer
├── calculator.html        # Scientific calculator
├── sudoku.html            # Sudoku game
├── minesweeper.html       # Minesweeper game
├── sounds/                # Audio assets
│   ├── tick.mp3          # Clock ticking 1
│   ├── tick2.mp3         # Clock ticking 2
│   ├── water.mp3         # Flowing water
│   └── forest.mp3        # Campfire/forest
├── games/                 # Additional games
│   ├── the-arena.html
│   ├── pixel-smash.html
│   └── snake.html
├── friday-backups/        # Development backups
├── docs/                  # Documentation
└── web-tools/             # Utility tools
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla HTML5, CSS3, ES6+ JavaScript |
| **Styling** | CSS Grid, Flexbox, CSS Variables (theming) |
| **Audio** | Web Audio API, HTML5 Audio |
| **Storage** | localStorage (settings persistence) |
| **Deployment** | GitHub Pages |

### Design Principles

1. **Zero Dependencies** - No frameworks, no build step
2. **Fixed Resolution** - 800×480 viewport, no responsive breakpoints needed
3. **Touch-First** - All interactions work with mouse and touch
4. **Retro Aesthetic** - Terminal/cyberpunk visual language
5. **Performance** - Minimal DOM manipulation, efficient algorithms

### Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full (iOS 13+) |
| Chromium (ARM) | ✅ Optimized for SBCs |

---

## 🚀 Deployment

### GitHub Pages (Recommended)
1. Fork/clone this repository
2. Go to Settings → Pages
3. Select source: `main` branch
4. Your site will be at `https://YOURUSERNAME.github.io/peter/`

### Local Development
```bash
# Clone the repository
git clone https://github.com/hardihuang/peter.git

# Open in browser (no server required)
open peter/index.html

# Or serve locally for testing
python3 -m http.server 8000
# Then visit http://localhost:8000/peter/
```

### Orange Pi / Raspberry Pi
```bash
# Install Chromium (if not present)
sudo apt install chromium-browser

# Launch in kiosk mode
chromium-browser --kiosk --app=http://localhost:8000/peter/
```

---

## 🛠️ Development

### Adding a New App

1. Create `your-app.html` in root directory
2. Follow the template structure:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=800, height=480">
       <title>F.R.I.D.A.Y. - App Name</title>
       <style>
           /* 800x480 fixed layout */
           body { width: 800px; height: 480px; overflow: hidden; }
       </style>
   </head>
   <body>
       <!-- Your app content -->
   </body>
   </html>
   ```
3. Add to `index.html` app grid:
   ```html
   <div class="app-item" onclick="window.location.href='your-app.html'">
       <div class="app-icon">🎮</div>
       <div class="app-name">YOUR APP</div>
   </div>
   ```

### Code Style Guidelines

- **CSS:** Use CSS Grid for layouts, Flexbox for components
- **Colors:** Stick to the green terminal palette (`#0f0`, `#0a0`, `#050`)
- **Fonts:** Use `'Courier New', monospace` for consistency
- **No external dependencies** - Everything must work offline

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| **Total Files** | 10+ HTML pages |
| **Total Size** | ~500KB (without audio) |
| **Dependencies** | 0 |
| **Build Time** | 0 seconds |
| **Load Time** | <1s on local network |

---

## 📝 Changelog

### 2026-04-03
- ✅ Added Minesweeper game with 3 difficulties
- ✅ Added Sudoku puzzle game
- ✅ Added Pomodoro timer with ambient sounds
- ✅ Added Settings panel with 5 tabs
- ✅ Added Calculator with 3 modes
- ✅ Fixed 800×480 layout for all apps
- ✅ Removed auto-playing audio bug

### 2026-04-02
- ✅ Initial dashboard release
- ✅ Main interface with system monitoring
- ✅ App launcher grid
- ✅ Click sound effects

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Ensure your app fits 800×480
4. Test on touch devices
5. Submit a pull request

---

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- Inspired by Tony Stark's F.R.I.D.A.Y. AI from Marvel
- Terminal aesthetic inspired by classic CRT monitors
- Sound effects from various royalty-free sources

---

<p align="center">
  <b>F.R.I.D.A.Y. Deck</b><br>
  <i>Your personal cyberpunk dashboard</i><br>
  <a href="https://hardihuang.github.io/peter/">Live Demo</a>
</p>

---

## 🛠️ Development

### Adding a New App

1. Create `your-app.html` in root directory
2. Follow the template structure:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=800, height=480">
       <title>F.R.I.D.A.Y. - App Name</title>
       <style>
           /* 800x480 fixed layout */
           body { width: 800px; height: 480px; overflow: hidden; }
       </style