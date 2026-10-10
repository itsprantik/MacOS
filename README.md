# WebOS: a macOS-style desktop that runs in your browser (and as a desktop app)

A complete desktop environment built from scratch with **React + TypeScript**. It has a boot screen, a login screen, a menu bar, a magnifying Dock, draggable windows, widgets, a Control Center and a set of working apps (Finder, Music, Safari, News, Calendar, Terminal, Settings and more). You can run it in a web browser or as a real desktop program with **Electron**.

> This is an independent learning project. It is **not affiliated with Apple**. Apple, macOS, Safari and related names and logos are trademarks of Apple Inc.

---

## Table of contents

1. [What you get](#what-you-get)
2. [Quick start (copy and paste)](#quick-start-copy-and-paste)
3. [Step-by-step setup for complete beginners](#step-by-step-setup-for-complete-beginners)
4. [Running the app](#running-the-app)
5. [Add your own media (optional)](#add-your-own-media-optional)
6. [API keys (optional)](#api-keys-optional)
7. [Personalize it](#personalize-it)
8. [Features of every app](#features-of-every-app)
9. [Desktop features](#desktop-features)
10. [Project structure](#project-structure)
11. [How to add a new app](#how-to-add-a-new-app)
12. [Build and publish](#build-and-publish)
13. [Troubleshooting](#troubleshooting)
14. [Tech stack](#tech-stack)
15. [Credits](#credits)

---

## What you get

| Area | Highlights |
|---|---|
| **Startup** | Boot screen with progress bar, macOS-style lock screen, any password works (or set your own) |
| **Desktop** | Menu bar, Dock with magnification, wallpapers, right-click menu |
| **Windows** | Drag, resize, minimize, zoom, focus, open animation |
| **Widgets** | 12 widgets you can drag, snap, add and remove |
| **Control Center** | Toggles, brightness, volume, dark mode, now playing |
| **Apps** | Finder, Music, Safari, News, Calendar, Calculator, Clock, Terminal, Settings, About This Mac |
| **Saved data** | Files, widgets, wallpaper, calendar events and settings are remembered in your browser |

<!-- Add screenshots here once you have them, for example:
![Desktop](docs/desktop.png)
-->

---

## Quick start (copy and paste)

You need **Node.js** and **Git** installed (see the next section if you don't have them).

```bash
# 1. Download the project
git clone https://github.com/itsprantik/MacOS.git
cd MacOS

# 2. Install everything the project needs (this also installs Electron)
npm install

# 3a. Run it in your web browser
npm run dev

# 3b. OR run it as a desktop app (Electron)
npm run electron:dev
```

For 3a, open the address shown in the terminal, normally **http://localhost:5173**.

---

## Step-by-step setup for complete beginners

### Step 1: Install the tools

| Tool | What it is for | Download |
|---|---|---|
| **Node.js (LTS)** | Runs the project's tools. npm comes with it | https://nodejs.org |
| **Git** | Downloads the code | https://git-scm.com |
| **VS Code** (optional) | A friendly code editor | https://code.visualstudio.com |

After installing, **close and reopen your terminal**, then check:

```bash
node -v     # should print v20.19 or higher (v22 is ideal)
npm -v      # should print a number
git --version
```

> **How to open a terminal:** on Windows search for "PowerShell" or "Terminal". On Mac open "Terminal". In VS Code press Ctrl + ` (backtick).

**Windows only:** if `npm` says *"running scripts is disabled on this system"*, run this once in PowerShell, then try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Step 2: Download the project

```bash
git clone https://github.com/itsprantik/MacOS.git
cd MacOS
```

(`cd MacOS` means "go into the MacOS folder".)

### Step 3: Install the dependencies

```bash
npm install
```

This reads `package.json` and downloads everything into a `node_modules` folder. It can take a few minutes because Electron is about 100 MB. You only need to do this once.

<details>
<summary><b>Optional: the individual install commands (for reference)</b></summary>

You do **not** need these if `npm install` worked. They show what the project depends on, and they are what you would run if you were building the project from scratch.

```bash
# App libraries
npm install react react-dom zustand lucide-react

# Build tools
npm install -D vite @vitejs/plugin-react typescript tailwindcss @tailwindcss/vite

# Desktop app (Electron) tools
npm install -D electron concurrently wait-on

# Only if you want to build an installer (see "Build and publish")
npm install -D electron-builder
```

| Package | What it does |
|---|---|
| `react`, `react-dom` | The user-interface library |
| `zustand` | Small state manager (windows, widgets, settings) |
| `lucide-react` | Icon set |
| `vite` | Fast dev server and bundler |
| `typescript` | Typed JavaScript |
| `tailwindcss`, `@tailwindcss/vite` | Styling |
| `electron` | Turns the web app into a desktop program |
| `concurrently`, `wait-on` | Start Vite first, then open Electron |
| `electron-builder` | (Optional) creates an installer |

</details>

---

## Running the app

### Option A: In your web browser

```bash
npm run dev
```

Open **http://localhost:5173**. Stop the server with **Ctrl + C**.

### Option B: As a desktop app with Electron

```bash
npm run electron:dev
```

This starts the Vite dev server and opens an Electron window once it is ready. In the desktop app Safari becomes a **real built-in browser** (it can open sites like Google and YouTube that refuse to appear inside a normal web page).

### All commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (do this first, once) |
| `npm run dev` | Start the web version at http://localhost:5173 |
| `npm run electron:dev` | Start the desktop (Electron) version |
| `npm run build` | Check the code and create the production build in `dist/` |
| `npm run preview` | Serve the production build locally to test it |
| `npm run electron:build` | (Optional) create a desktop installer in `release/` |

### Make sure `package.json` has these

If a command above says *"missing script"*, add this to your `package.json`:

```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently -k \"vite\" \"wait-on tcp:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  }
}
```

and pin the dev port in `vite.config.ts` so Electron always finds it:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
})
```

---

## Add your own media (optional)

The OS **works without any of these**: missing icons become lettered tiles, a missing wallpaper falls back to a gradient, and missing covers show a red music tile. To make it look and sound complete, put your own files in the `public/` folder.

> Copyrighted images, icon packs and songs are not something you should publish on a public website. Use your own files or royalty-free ones for anything you share.

### Logo

`public/logo.png`: used on the boot screen and the menu bar. A black logo on a white or transparent background works (the app inverts it to white).

### Dock icons

Put one PNG per app in `public/icons/`. The file name must match exactly (lowercase):

```
finder.png     safari.png     messages.png   mail.png       maps.png
photos.png     facetime.png   calendar.png   contacts.png   reminders.png
notes.png      music.png      news.png       appstore.png   calculator.png
clock.png      terminal.png   settings.png   trash-empty.png
```

> Have `.ico` files instead? Convert them to PNG, or set `ICON_EXT = 'ico'` in `src/core/appRegistry.ts`.

### Wallpaper

`public/wallpapers/default.jpg`: the main wallpaper ("Tahoe"). Five more gradient wallpapers are built in. To add your own, drop an image in `public/wallpapers/` and add an entry to the list in `src/core/wallpaper.ts`.

### Music

Songs go in `public/music/` and album covers in `public/music/covers/`, with matching names:

```
public/music/sao-paulo.mp3          public/music/covers/sao-paulo.jpg
public/music/timeless.mp3           public/music/covers/timeless.jpg
... (blinding-lights, starboy, billie-jean, dracula,
     past-lives, attention, love-me-not, i-wanna-be-yours)
```

Using your own songs? Edit the list in **`src/apps/Music/tracks.ts`**: one line per song (file name, title, artist).

---

## API keys (optional)

Two features use free online services. Both are optional.

Create a file named **`.env.local`** in the project's main folder (next to `package.json`):

```
VITE_NEWS_API_KEY=your_newsapi_key
VITE_GOOGLE_CSE_ID=your_search_engine_id
```

| Key | Used by | How to get it (free) |
|---|---|---|
| `VITE_NEWS_API_KEY` | **News** app and the *Top Story* widget | Sign up at https://newsapi.org and copy your key |
| `VITE_GOOGLE_CSE_ID` | **Safari** search results inside the web version | At https://programmablesearchengine.google.com click **Add**, choose **Search the entire web**, create it, copy the **Search engine ID** |

**Restart the dev server** after changing `.env.local`.

> NewsAPI's free plan only works from `localhost`, so News works in `npm run dev` and in Electron during development, and needs a small server function if you deploy it online (see [Build and publish](#build-and-publish)). Never commit `.env.local` to GitHub.

Everything else (F1 schedule, GitHub releases, public holidays) uses free services that need **no key**.

---

## Personalize it

| What | Where |
|---|---|
| Your name, bio, GitHub username, "why I built this" | `src/config/creator.ts` (shown in **Settings → About the Creator**) |
| GitHub repos and holiday country for the Calendar | `src/config/calendar.ts` |
| Your display name | **Settings → General → Name** |
| Login password (any password works by default) | `PASSWORD` constant in `src/shell/LoginScreen.tsx` |
| Boot screen length | `BOOT_DURATION` in `src/shell/BootScreen.tsx` |
| Login avatar (emoji or image path) | `avatar` in `src/core/store/systemStore.ts` |
| Weather widget city and numbers | `CITY` and `WEATHER` in `src/widgets/index.tsx` |
| Widgets on the left instead of right | Move the default positions in `defaultWidgets()` in `src/core/store/widgetStore.ts` |

---

## Features of every app

### Finder
A file manager for a virtual file system saved in your browser.
- Sidebar: Home, Desktop, Documents, Downloads, Music, Pictures, Applications
- Grid and list views, back and forward buttons, search box, item count and path bar
- **New Folder** with inline rename, rename and delete from the right-click menu
- Double-click a folder to open it, a text file to preview it, a song to play it in Music, or an app to launch it
- The **Applications** folder lists every app, and the **Music** folder lists your songs
- Shares its files with the Terminal: a folder made in one shows up in the other

### Music
An Apple-Music-style player.
- Home page with "Top Picks" and "Recently Added" cover rows, plus a Songs list
- Search box that filters songs
- Floating player bar: play/pause, previous, next, shuffle, repeat (off, all, one), seek bar, volume
- Keeps playing when you close the window, and is controllable from Control Center and the *Now Playing* widget

### Safari
A browser with the macOS look.
- Address bar with favicon and lock, Back and Forward, reload, Share (copies the link), New Tab and Tab Overview
- Tab bar with several tabs
- Address-bar dropdown with **Top Hit**, **Switch to Tab** and **Google Suggestions**, usable with arrow keys
- Start page with **Favourites** (editable) and **Suggestions** from your history, and a sidebar with favourites and history
- **Desktop (Electron) version:** a real browser view. Google, YouTube and other big sites work, and links that open new windows become new tabs
- **Web version:** pages load in an iframe. Many big sites refuse this and show blank, but Wikipedia works and Google results work if you set `VITE_GOOGLE_CSE_ID`

### News
A News-style reader powered by NewsAPI.
- Categories: Today, Business, Technology, Science, Health, Sports, Entertainment
- Region picker (US, India, UK, Australia, Canada, Germany, France, Japan) and search
- Large lead story with a card grid, loading placeholders and clear error messages
- Click a story for a reader card with a link to the full article
- Results are cached for 10 minutes to save your free requests

### Calendar
A month calendar that **syncs** from the internet.
- Sources you can switch on and off in the sidebar: **My Events**, **Formula 1** (every practice, qualifying, sprint and race), **GitHub Releases** (React, Vite, Electron, Zustand, Tailwind, TypeScript by default) and **Public Holidays**
- Click a day to see its events, with links to the race or release page
- Add and delete your own events, with an optional time
- **Refresh** re-fetches the data (otherwise cached for 6 hours)

### Calculator
- Add, subtract, multiply, divide, percent, plus/minus, decimals, and chained operations
- Works with the **keyboard** too (digits, `+ - * /`, Enter, Backspace, Esc)

### Clock
- **Timer:** hours, minutes, seconds, quick presets, a progress ring, and three beeps when it ends. It keeps running if you close the window, and a countdown appears in the menu bar
- **Stopwatch:** start, stop, laps and reset

### Terminal
A practice terminal for learning Git and the command line.
- `git` lists every Git command in groups; `git commit`, `git push` and so on show usage and examples; `git workflow` shows the everyday routine
- `basics` is a cheat sheet of beginner commands (including Node and npm)
- Working commands: `ls`, `cd`, `pwd`, `mkdir`, `touch`, `cat`, `echo "text" > file`, `rm`, `open <app>`, `clear`, `history`, `whoami`, `date`, `neofetch`, `about`, `github`
- Up and down arrows recall earlier commands; **Ctrl + L** clears the screen
- It explains Git but does **not** run real Git

### Settings
- **Wi-Fi** and **Bluetooth** switches
- **Sound** (volume) and **Displays** (brightness)
- **Appearance:** Light, Dark or Auto
- **Wallpaper:** six wallpapers to choose from
- **General:** your name, version info, reset widgets, erase all saved data
- **About the Creator:** your photo from GitHub, live repo and follower counts, bio, and the story behind the project

### About This Mac
Open it from the Apple menu. It shows your **real computer's** specs when running in Electron (processor, cores, memory, graphics, display, system, battery, uptime). In a browser it shows what the browser allows.

### Not built yet
Messages, Mail, Maps, Photos, FaceTime, Contacts, Reminders, Notes and App Store open a "coming soon" window. They are placeholders ready to be turned into real apps.

---

## Desktop features

### Menu bar
- **Apple menu:** About This Mac, About the Creator, System Settings, Restart, Shut Down, Log Out
- Name of the active app, battery menu (real level and charging state in Chrome, Edge and Electron), Wi-Fi status, Control Center button, live clock
- A running timer shows its countdown here

### Dock
- Icons grow as your mouse moves over them, and neighbors move apart
- A dot under running apps, a bounce when an app launches, and name labels on hover

### Windows
- Drag by the top bar, resize from the bottom-right corner
- Red, yellow and green buttons for close, minimize and zoom (double-click the top bar to zoom)
- Click a window to bring it to the front

### Control Center
- Wi-Fi, Bluetooth, AirDrop and Focus toggles
- **Now Playing** tile with play, previous and next
- **Display** slider (really dims the screen) and **Sound** slider (changes music volume)
- Dark mode, Calculator and Timer shortcuts
- **Edit Controls** opens the widget gallery

### Widgets
Twelve widgets: **Today, Month, Up Next, Clock, Timer, Weather, Batteries, Now Playing, Top Story, Next Race (F1), Releases (GitHub), Day at a Glance**.
- **Drag** a widget anywhere. It snaps to a grid and nudges to a free spot
- **Remove** with a right-click → *Remove Widget*, or the **−** badge that appears when you hover over a widget or open the gallery
- **Add** with a right-click on the desktop → *Edit Widgets…* (or Control Center → *Edit Controls*)
- The gallery has a category sidebar and a search box. Positions are saved

### Dark mode
Switch in Control Center or **Settings → Appearance**. The newer apps are styled natively. Finder, Music and Settings use a color-inversion trick that works well but isn't perfect.

### Right-click menu
Right-click the desktop for *Edit Widgets…*, or right-click items inside Finder for Open, Rename and Delete.

---

## Project structure

```
MacOS/
├── electron/
│   ├── main.cjs            # Electron main process (window, embedded browser, system info)
│   └── preload.cjs         # Safe bridge between Electron and the app
├── api/
│   └── news.js             # Server function for News when hosted on Vercel
├── public/                 # Files served as-is
│   ├── logo.png
│   ├── icons/              # Dock icons (finder.png, safari.png, ...)
│   ├── wallpapers/         # default.jpg and your own
│   └── music/              # Songs and covers/
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Boot → Login → Desktop
│   ├── index.css           # Tailwind and global styles
│   ├── config/             # creator.ts, calendar.ts, keys.ts (your settings)
│   ├── core/
│   │   ├── appRegistry.ts  # List of apps (Dock, sizes, icons)
│   │   ├── wallpaper.ts    # Wallpaper list
│   │   ├── theme.ts        # Light / dark mode
│   │   ├── widgetGrid.ts   # Widget grid maths
│   │   ├── calendar/       # F1, GitHub and holiday data sources
│   │   ├── hooks/          # useBattery, useCalendarData
│   │   └── store/          # Saved state: system, windows, widgets, files, music, timer, calendar, ui
│   ├── components/         # Shared pieces (menus, switches, status icons)
│   ├── shell/              # BootScreen, LoginScreen, Desktop, MenuBar, Dock,
│   │                       # ControlCenter, ContextMenu, WidgetsLayer, WidgetGallery
│   ├── windowing/          # WindowManager, AppWindow, TitleBar
│   ├── widgets/            # All widgets and the widget registry
│   └── apps/               # One folder per app
│       ├── index.ts        # Maps app id → component
│       ├── Finder/  Music/  Safari/  News/  Calendar/
│       ├── Calculator/  Clock/  Terminal/  Settings/  About/
│       └── Placeholder.tsx # "Coming soon" window
├── index.html
├── package.json
└── vite.config.ts
```

(Your copy may differ slightly as the project grows.)

### How it works in one minute
- **Zustand stores** hold the state (which windows are open, widget positions, settings). Many are saved in `localStorage`, which is why your changes survive a refresh.
- **`appRegistry.ts`** is the single list of apps. The Dock, Finder's Applications folder and the Terminal's `open` command all read from it.
- **`AppWindow.tsx`** wraps any app in a draggable, resizable window frame.
- **Electron** loads the same website in a desktop window and adds extras, mainly the real browser inside Safari.

---

## How to add a new app

1. **Create the app:** `src/apps/Hello/index.tsx`

   ```tsx
   import type { AppProps } from '../../core/types'

   export default function Hello({ title }: AppProps) {
     return (
       <div className="w-full h-full flex items-center justify-center bg-white/90 text-neutral-900">
         Hello from {title}!
       </div>
     )
   }
   ```

2. **Register it** in `src/core/appRegistry.ts`:

   ```ts
   app('hello', 'Hello', { defaultSize: { width: 500, height: 350 } }),
   ```

3. **Connect the component** in `src/apps/index.ts`:

   ```ts
   import Hello from './Hello'
   // ...
   const appComponents = { /* ... */ hello: Hello }
   ```

4. *(Optional)* Add `public/icons/hello.png`. Without it the Dock shows a lettered tile.

Your app now appears in the Dock, in Finder's Applications folder and in the Terminal's `open hello`.

> Tip: the top 40 pixels of every window are the drag handle, and buttons and inputs inside it still work. Leave about 48 pixels of space at the top so your content doesn't sit under the red/yellow/green buttons.

---

## Build and publish

### Check that it builds

```bash
npm run build
npm run preview
```

`npm run build` also checks your TypeScript. Fix any errors it prints before publishing.

### Publish on the web (Vercel)

1. Push your code to GitHub.
2. Go to https://vercel.com → **Add New → Project** → import this repository.
3. Framework **Vite**, build command `npm run build`, output folder `dist` (the defaults).
4. Add environment variables: `VITE_GOOGLE_CSE_ID`, `NEWS_API_KEY` (read by `api/news.js`, so the key stays on the server) and `ELECTRON_SKIP_BINARY_DOWNLOAD=1` (makes the build faster).
5. Click **Deploy**. Every `git push` redeploys automatically.

Things to know for the live site:
- Don't publish copyrighted songs, icon packs or logos (keep `public/music/` out of Git with `.gitignore`).
- Safari uses the iframe fallback on the web, and many sites will show blank.
- Each visitor has their own saved files, widgets and settings.

### Build a desktop installer (optional)

```bash
npm install -D electron-builder
```

Add this to `package.json`:

```json
"build": {
  "appId": "com.example.webos",
  "files": ["dist/**", "electron/**", "package.json"],
  "directories": { "output": "release" },
  "win": { "target": "nsis" },
  "mac": { "target": "dmg" },
  "linux": { "target": "AppImage" }
}
```

Then:

```bash
npm run electron:build
```

The installer appears in the `release/` folder. (`output` must not be `dist`, because that is where the website build goes.)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `node` or `npm` "is not recognized" | Reinstall Node.js, then **close and reopen** the terminal |
| PowerShell: "running scripts is disabled" | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `npm install` fails or is stuck | Check your internet, delete the `node_modules` folder and run `npm install` again |
| "Port 5173 is already in use" | Close the other dev server (Ctrl + C in its terminal) and run again |
| Electron window is blank or says "refused to connect" | Use `npm run electron:dev`, which starts the dev server first. Don't run `electron .` alone |
| `Missing script: electron:dev` | Add the scripts from [Make sure package.json has these](#make-sure-packagejson-has-these) |
| Dock shows letters instead of icons | Add PNG icons to `public/icons/` with the exact names listed above |
| Music doesn't play | Check file names match `src/apps/Music/tracks.ts` exactly (lowercase, `.mp3`) |
| News says "Connect a news source" | Add `VITE_NEWS_API_KEY` to `.env.local` and restart `npm run dev` |
| News says the API key was rejected | Re-copy the key from newsapi.org |
| News works locally but not on the website | NewsAPI's free plan is localhost-only. Use the `api/news.js` function (see Build and publish) |
| Safari is blank in the browser | Most big sites block iframes. Use the Electron version for a real browser |
| Calendar says "failed" for GitHub | The free GitHub limit is 60 requests an hour. Wait a bit and press Refresh |
| Everything looks broken after an update | **Settings → General → Erase…** clears saved data (or clear the site's data in your browser) |
| Build error `error TS…` | Read the file and line it names. It is usually an unused import or a typo |

Still stuck? Open an issue on GitHub and include the **exact error text** and what you ran.

---

## Tech stack

| | |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand (with `persist` for saved data) |
| Icons | lucide-react |
| Desktop | Electron (embedded browser through `WebContentsView`) |
| Free data sources | Jolpica F1 API, GitHub API, Nager.Date holidays, NewsAPI (key needed) |

---

## Credits

Created by [@itsprantik](https://github.com/itsprantik).

Inspired by the look and feel of macOS. Built as a learning project to understand how a desktop interface works: windowing, state, animation and desktop packaging.

