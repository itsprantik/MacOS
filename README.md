# WebOS

A desktop that looks like macOS that runs inside a browser and also as a desktop app using Electron. I made it myself in my time while studying, mostly to understand how a desktop interface actually works from the inside: windows, state, animation, everything.

It has a boot screen, a login screen, a menu bar, a Dock that expands, windows, widgets, a Control Center and a few apps that actually work (Finder, Music, Safari, News, Calendar, Calculator, Clock, Terminal, Settings, About This Mac).

This is a learning project. It is not connected to Apple. Apple, macOS, Safari and related names and logos belong to Apple Inc.

---

## Why I made this

I wanted a project that was bigger than a to-do app. I had been using React for a while. Only ever built small pages and I kept wondering about how things like a window manager work. Who decides which window is on top? How does a Dock icon know how big to be when the mouse is near it? So I decided to try building one.

I did it in the evenings and on weekends around classes so it took a lot longer than I planned. The first version was a gray rectangle you could drag around. Everything else grew from that.

## How it went (the honest version)

Some of the things that took the time:

**Windows and focus.** Moving a div is easy. Moving it without it jumping keeping the one on top and making resize and minimize work together was not. I rewrote the window store least twice before I stopped fighting it. Keeping all window state in Zustand of inside components is what finally made it make sense.

**The Dock expansion.** I thought this would be a CSS thing. It is not. The icons need to grow based on distance from the cursor. The neighbors have to move apart smoothly without the whole row shaking. I got the math wrong times before it felt right.

**Safari in the browser.** I built a Safari app then found out that big sites (Google, YouTube and many others) refuse to load inside an iframe. For a while I thought my code was broken. It was not the sites block it on purpose. The fix was Electron, where I can use an embedded browser view. In the web version Safari still only works well with sites that allow iframes, like Wikipedia.

**NewsAPI.** The free plan only works from localhost. News worked perfectly on my machine. Then failed as soon as I deployed it. I had to move the request into a server function (`api/news.js`) so the key stays on the server and the request does not come from the browser.

**GitHub rate limits.** The Calendar pulls release dates from GitHub. I kept hitting the 60 requests per hour limit while testing. That is why results are cached now.

**Dark mode.** The newer apps are styled for mode properly. Finder, Music and Settings use a color inversion trick because I did not want to restyle them. It works enough but it is not perfect and I know it.

**. Media.** I originally had icons as `.ico` files and nothing showed up until I converted them to PNG. I also learned that I should not publish copyrighted songs or icon packs in a repo so the media folders are optional and the app falls back to lettered tiles and gradients when files are missing.

**Tailwind. Typescript.** Tailwind v4 changed how it is set up compared to every tutorial I found so I lost some time there. TypeScript errors during `npm run build` also taught me to stop leaving imports around.

There are still parts. Some apps are placeholders the Terminal only pretends to run Git. I am sure there are bugs I have not found yet.

---

## What is in it

| Area | Details |

|---|---|

Startup | Boot screen with a progress bar, lock screen. Any password works unless you set your |

| Desktop | Menu bar Dock with expansion, wallpapers, right-click menu |

| Windows | Drag, resize, minimize, zoom focus, open animation |

| Widgets | 12 widgets you can drag, snap, add and remove |

| Control Center | Toggles, brightness, volume, dark mode now playing |

| Apps | Finder, Music, Safari, News, Calendar, Calculator, Clock, Terminal, Settings, About This Mac |

Saved data | Files, widgets, wallpaper, calendar events and settings are stored in your browser |

---

## Getting it running

You need Node.js (version 20.19 or higher 22 is best) and Git.

```bash

git clone https://github.com/itsprantik/MacOS.git

cd MacOS

npm install

```

`npm install` can take a minutes because Electron is around 100 MB.

Then pick one:

```bash

# in the browser

npm run dev

# as a desktop app

npm run electron:dev

```

For the browser version open the address printed in the terminal, http://localhost:5173.

### If you are new to all this

1. Install Node.js (LTS) from https://nodejs.org and Git from https://git-scm.com. VS Code is optional.

2. Close and reopen your terminal after installing otherwise it will not find the commands.

3. Check that it worked:

```bash

node -v

npm -v

git --version

```

4. On Windows if PowerShell says running scripts is disabled run this once. Try again:

```powershell

Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

```

### Commands

| Command | What it does

|---|---|

| `npm install` | Install dependencies (once) |

| `npm run dev` | Web version at http://localhost:5173 |

| `npm run electron:dev` | Desktop version |

| `npm run build` | Type-check and build into `dist/` |

| `npm run preview` | Serve the production build locally |

| `npm run electron:build` | Make a desktop installer in `release/` |

If you get "missing script" make sure your `package.json` has this:

```json

{

"main": "electron/main.cjs"

"scripts": {

"dev": "vite"

"build": "tsc -b && vite build"

"preview": "vite preview"

"electron:dev": "concurrently -k \"vite\" \"wait-on tcp:5173 && electron.\""

"electron:build": "npm run build && electron-builder"

}

}

```

and pin the port in `vite.config.ts` so Electron can always find the dev server:

```ts

export default defineConfig({

plugins: [react() tailwindcss()]

server: { port: 5173 strictPort:

})

```

---

## Adding your own media (optional)

Everything works without these. Missing icons become tiles a missing wallpaper becomes a gradient and missing covers become a red music tile. Put your files in `public/`.

Please use your files or royalty-free ones. Do not push copyrighted songs or icon packs to a repo.

- **Logo:** `/logo.png`. A logo on white or transparent works the app inverts it.

- **Dock icons:** one PNG per app in `/icons/` lowercase names that match exactly:

`finder.png` `safari.png` `messages.png` `mail.png` `maps.png` `photos.png` `facetime.png` `calendar.png` `contacts.png` `reminders.png` `notes.png` `music.png` `news.png` `appstore.png` `calculator.png` `clock.png` `terminal.png` `settings.png` `trash-empty.png`.

If you have `.ico` files convert them or set `ICON_EXT = 'ico'` in `src/core/appRegistry.ts`.

- **Wallpaper:** `/wallpapers/default.jpg`. Five gradient wallpapers are built in. To add one drop an image in the folder. Add it to the list in `src/core/wallpaper.ts`.

- **Music:** songs in `/music/` covers in `public/music/covers/` with matching names (for example `sao-paulo.mp3` and `covers/sao-paulo.jpg`). To use your songs, edit `src/apps/Music/tracks.ts` one line per song.

---

## API keys (optional)

Two features use online services. Create a file called `.env.local` next to `package.json`:

```

VITE_NEWS_API_KEY=your_newsapi_key

VITE_GOOGLE_CSE_ID=your_search_engine_id

```

| Key | Used by | Where to get it |

|---|---|---|

| `VITE_NEWS_API_KEY` News app and the Top Story widget | Sign up at https://newsapi.org |

| `VITE_GOOGLE_CSE_ID` | Safari search, in the web version | https://programmablesearchengine.google.com add a search engine that searches the entire web copy the ID |

Restart the dev server after making changes to the file and never add that file to the commit. The F1 schedule, GitHub releases and public holidays do not need a key.

---

## Changing things to make it yours

| What | Where |

|---|---|

| Name, bio GitHub username | src/config/creator.ts |

Calendar repos and holiday country | src/config/calendar.ts |

| Display name | Settings, General, Name |

| Login password | PASSWORD in src/shell/LoginScreen.tsx |

| Boot screen length | BOOT_DURATION in src/shell/BootScreen.tsx |

| Login avatar | avatar in src/core/store/systemStore.ts |

| Weather widget city and numbers | CITY and WEATHER in src/widgets/index.tsx |

| Widget positions | defaultWidgets() in src/core/store/widgetStore.ts |

---

## The apps

Finder. A file manager for a file system stored in your browser. Sidebar with Home, Desktop, Documents, Downloads, Music, Pictures and Applications. Grid and list views, back and forward search, new folder, rename, delete. Double-click opens folders previews text files plays songs in Music and launches apps. It shares files with the Terminal so a folder made in one shows up in the other.

Music. An Apple Music style player with Top Picks Recently Added and a song list. Search, play and pause, previous and next shuffle, repeat (off, all one) seek bar and volume. It keeps playing when you close the window and can be controlled from Control Center and the Now Playing widget.

Safari. Address bar, tabs, back and forward reload share, tab overview, a start page with favourites and suggestions from your history and a sidebar. In Electron it is a browser view so Google and YouTube work and links that open new windows become new tabs. In the browser it uses an iframe many big sites show blank.

News. A reader powered by NewsAPI. Categories, a region picker (US, India, UK, Australia, Canada, Germany, France, Japan) search, a lead story with a card grid and results cached for 10 minutes to save requests.

Calendar. A month view that pulls data from the internet. You can switch on and off My Events, Formula 1 GitHub Releases (React, Vite, Electron, Zustand, Tailwind, TypeScript by default). Public Holidays.. Delete your own events. Data is cached for 6 hours. Refresh re-fetches it.

Calculator. The. Percent, plus/minus, decimals and chained operations. Works with the keyboard.

Clock. A timer with presets a progress ring and three beeps at the end which keeps running if you close the window and shows a countdown in the menu bar. Also a stopwatch with laps.

Terminal. A practice terminal for learning Git and the command line. Git lists commands, git commit and others show usage git workflow shows the routine basics is a cheat sheet. Working commands include ls, cd, pwd, mkdir, touch, cat echo "text" > file, rm, open <app> clear, history, whoami, date, neofetch, about and github. It explains Git. Does not run real Git.

Settings. Wi-Fi and Bluetooth switches, volume, brightness, Light/Dark/Auto, six wallpapers, your name, reset widgets erase all saved data and an About the Creator page.

About This Mac. Shows your computers specs in Electron and whatever the browser allows on the web.

Not built yet. Messages, Mail, Maps, Photos, FaceTime, Contacts, Reminders, Notes and App Store open a "coming window. They are placeholders I want to turn into apps.

---

## Desktop features

- Menu bar: Apple menu (About This Mac, About the Creator, System Settings, Restart Shut Down Log Out) app name, battery, Wi-Fi, Control Center button, clock.

- Dock: icons grow near the cursor a dot shows running apps icons bounce on launch labels show on hover.

- Windows: drag by the top bar resize from the bottom-right corner, red/yellow/green buttons double-click the top bar to zoom click to bring to front.

- Control Center: toggles, Now Playing, display and sound sliders (the display slider really dims the screen) dark mode, shortcuts and Edit Controls for the widget gallery.

- Widgets: Today, Month, Up Clock, Timer, Weather, Batteries, Now Playing, Top Story, Next Race, Releases and Day at a Glance. Drag to move (they snap to a grid) right-click to remove, right-click the desktop and choose Edit Widgets to add more.

---

## Project structure

MacOS/

├── electron/

│ ├── main.cjs # Electron process

│ └── preload.cjs # Bridge between Electron and the app

├── api/

│ └── news.js # Server function for News on Vercel

├── public/ # Logo, icons, wallpapers, music

├── src/

│ ├── main.tsx

│ ├── App.tsx # Boot, then Login, then Desktop

│ ├── index.css

│ ├── config/ # creator.ts, calendar.ts keys.ts

│ ├── core/ # appRegistry, wallpaper, theme, widgetGrid

│ │ # calendar sources, hooks, stores

│ ├── components/ # Shared pieces

│ ├── shell/ # BootScreen, LoginScreen, Desktop, MenuBar, Dock,

│ │ # ControlCenter, ContextMenu, WidgetsLayer, WidgetGallery

│ ├── windowing/ # WindowManager, AppWindow TitleBar

│ ├── widgets/

│ └── apps/ # One folder per app

├── index.html

├── package.json

└── vite.config.ts

Your copy may differ a little as the project changes.

The short version of how it works: Zustand stores hold all the state ( windows, widget positions, settings) and many are saved to localStorage, which is why things survive a refresh. AppRegistry.ts is the one list of apps and the Dock, Finder and the Terminals open command all read from it. AppWindow.tsx wraps any app in a resizable frame. Electron just loads the site in a desktop window and adds a few extras, mainly the real browser inside Safari.

---

## Adding an app

1. Create src/apps/Hello/index.tsx:

```tsx

import type { AppProps } from '../../core/types

export default function Hello({ title }: AppProps) {

return (

<div className="w-full h-full items-center justify-center bg-white/90 text-neutral-900">

Hello from {title}!

</div>

)

}

```

2. Register it in src/core/appRegistry.ts:

```ts

app('hello' 'Hello' { defaultSize: { width: 500 height: 350 } })

```

3. Connect it in src/apps/index.ts:

```ts

import Hello from './Hello'

//...

const appComponents = { /*... */ Hello: Hello }

```

4. Optionally add /icons/hello.png. Without it the Dock shows a tile.

It will then show up in the Dock in Finders Applications folder and in the Terminals hello.

One thing that tripped me up: the top 40 pixels of every window are the drag handle. Buttons and inputs inside it still work,. Leave about 48 pixels at the top so your content does not sit under the red/yellow/green buttons.

---

## Building and publishing

Check that it builds first:

```bash

npm run build

npm run preview

```

npm run build also type-checks so fix any error TS... It prints.

### Web (Vercel)

1. Push the code to GitHub.

2. On https://vercel.com choose Add New, Project and import the repo.

3. Framework Vite, build command npm run build, output folder dist.

4. Add environment variables: VITE_GOOGLE_CSE_ID, NEWS_API_KEY (read by api/news.js so the key stays, on the server) and ELECTRON_SKIP_BINARY_DOWNLOAD=1 to make the build faster.

5. Deploy. Every push redeploys.

On the site make sure to keep copyrighted songs, icon packs and logos out of Git (add `public/music/` to `.gitignore`). Safari uses the fallback and many sites will be blank. Each visitor has their saved files, widgets and settings.

### Desktop installer (optional)

```bash

npm install -D electron-builder

```

Add to `package.json`:

```json

"build": {

"appId": "com.example.webos"

"files": ["dist/**" "electron/**" "package.json"]

"directories": { "output": "release" }

"win": { "target": "nsis" }

"mac": { "target": "dmg" }

"linux": { "target": "AppImage" }

}

```

Then run `npm run electron:build`. The installer is in `release/`. The output folder cannot be `dist` since that is where the website build goes.

---

## Troubleshooting

| Problem | Fix |

|---|---|

node` or `npm` is not recognized | Reinstall Node.js, then close and open the terminal again |

| PowerShell says scripts are disabled | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

| `npm install` fails or hangs | Check your internet connection, delete `node_modules` and run it again |

Port 5173 already in use | Stop the other dev server with Ctrl + C and run again |

| Electron window is blank or "refused to connect" | Use `npm run electron:dev`. Do not run `electron.` alone |

Missing script: electron:dev` | Add the scripts shown in the commands section |

| Dock shows letters, not icons | Add PNGs to `public/icons/` with the exact names |

| Music does not play | File names must match `src/apps/Music/tracks.ts` exactly (lowercase, `.mp3`) |

| News says "Connect a news source" Add `VITE_NEWS_API_KEY` to `.env.local` and restart |

| News says the key was rejected | Copy the key again from newsapi.org |

| News works locally but not online | The free plan is for localhost only. Use `api/news.js` |

Safari is blank in the browser | Big sites block iframes. Use the Electron version |

| Calendar says GitHub "failed" 60 requests per hour limit.. Click Refresh |

| Everything looks broken after an update | Go to Settings, General, Erase to clear saved data or clear the site data in your browser |

If you are still stuck open an issue and paste the exact error text and the command you ran.

---

## Tech stack

React 19 and TypeScript, Vite, Tailwind CSS v4, Zustand (with `persist`) lucide-react for icons and Electron with `WebContentsView` for the embedded browser. Data comes from the Jolpica F1 API, the GitHub API, Nager.Date holidays and NewsAPI (key needed).

---

## What I want to do

- Turn some of the placeholder apps (Notes and Reminders first) into real ones

- Clean up the dark mode so I can drop the inversion trick

- Make windows work better on small screens

- Add screenshots to this README

---

## Credits

Made by [@itsprantik](https://github.com/itsprantik). The look and feel is inspired by macOS. Thanks to the APIs that made the Calendar and News possible and, to everyone who writes documentation that is actually readable.