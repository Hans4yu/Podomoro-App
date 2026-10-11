# Podomoro 🍅

A modern, minimal Pomodoro productivity app built with React, TypeScript, Vite, and Tailwind CSS.

![Podomoro App](https://img.shields.io/badge/Podomoro-v1.0.0-4c6b4c?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)

---

## Features

### 🎯 Focus Timer
- Three timer modes: **Focus** (25 min), **Short Break** (5 min), **Long Break** (15 min)
- Start, pause, resume, reset, and skip session controls
- Timestamp-based countdown — remains accurate when the browser tab is inactive
- Circular progress indicator with smooth animation
- Session dot indicators showing progress toward long break
- Automatic long break after every 4 completed focus sessions (configurable)
- Document title updates with remaining time
- Web Audio API sound notifications (no external files)
- Browser push notifications (when permission granted)
- Timer state persisted across page refreshes via LocalStorage

### ✅ Task Management
- Add tasks with title and estimated Pomodoro count
- Edit and delete tasks with confirmation
- Mark tasks as complete/incomplete
- Track completed Pomodoros per task
- Select the active task to link with focus sessions
- Task quick-select panel in the Focus view
- Persisted in LocalStorage

### 📊 Statistics
- Total focus time (all-time and today)
- Total completed sessions
- Completed tasks count
- Current daily focus streak
- Weekly focus bar chart (Recharts)
- Recent sessions list
- Empty state for new users — no fake data

### ⚙️ Settings
- Configurable durations for all timer modes (1–120 min)
- Long break interval (2–8 sessions)
- Auto-start breaks and/or focus sessions
- Sound notifications toggle
- Browser notification toggle
- Light / Dark / System theme
- All settings persisted in LocalStorage
- Reset session data option

### 🎨 Design
- Minimal, distraction-free interface
- Light and dark mode with smooth transitions
- Responsive: desktop sidebar + mobile bottom navigation
- No horizontal overflow on small screens
- Inter font via Google Fonts
- Accessible: keyboard-navigable, ARIA labels, visible focus rings
- Framer Motion micro-animations

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 8.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Lucide React | latest | Icons |
| Recharts | latest | Statistics charts |
| Framer Motion | latest | Animations |

---

## Installation

### Prerequisites
- Node.js 18+ and npm

### Steps

```bash
# Clone the repository
git clone <repo-url>
cd podomoro

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory. Preview the production build with:

```bash
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── CircularProgress.tsx   # SVG circular timer ring
│   └── Navigation.tsx         # Sidebar (desktop) + bottom nav (mobile)
├── contexts/
│   └── ThemeContext.tsx        # Theme provider (light/dark/system)
├── features/
│   ├── timer/
│   │   └── Timer.tsx           # Timer UI (mode tabs, controls, session dots)
│   ├── tasks/
│   │   └── Tasks.tsx           # Task list, add/edit/delete/complete
│   ├── statistics/
│   │   └── Statistics.tsx      # Stats cards + Recharts weekly chart
│   └── settings/
│       └── Settings.tsx        # Settings page (durations, theme, toggles)
├── hooks/
│   ├── useLocalStorage.ts      # Generic localStorage hook with cross-tab sync
│   ├── useTimer.ts             # Core timer logic (timestamp-accurate)
│   └── useSound.ts             # Web Audio API tone generator
├── lib/
│   ├── timer.ts                # Duration helpers, formatting, mode transitions
│   ├── statistics.ts           # Streak, weekly stats, daily totals
│   └── notifications.ts        # Browser notification helpers
├── types/
│   └── index.ts                # All TypeScript interfaces & types
├── App.tsx                     # Root layout, state, routing
└── main.tsx                    # React entry point
```

---

## Timer Accuracy

The timer uses **epoch timestamps** rather than relying solely on `setInterval` counting:

- When started, a `startedAt` timestamp is recorded
- On each tick, `remaining = duration - (now - startedAt - totalPausedMs)`
- When paused, `pausedAt` is recorded and accumulated into `totalPausedMs` on resume
- This means the countdown is accurate even when the browser tab is backgrounded, throttled, or the device sleeps
- The full timer state is serialised to LocalStorage, so refreshing the page restores a running timer to the correct remaining time

---

## Known Limitations

- **Single user / local only**: all data is stored in the browser's LocalStorage. There is no sync or backup.
- **Audio may require a user gesture**: the Web Audio API is blocked until the user interacts with the page (browser security policy). Clicking Start counts as a gesture, so sounds work normally.
- **No undo**: deleting tasks or resetting sessions is permanent.
- **Bundle size**: the Recharts library contributes ~500 KB minified. Code splitting (lazy-loading the Statistics view) would reduce initial load time for a production deployment.

---

## License

MIT
