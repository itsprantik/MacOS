MacOS

A custom macOS-style operating system that runs in the browser. It starts with a boot screen, moves to a login screen, then lands on a desktop. Windows, a dock, a menu bar and apps are being added step by step.

## Tech stack

- [React](https://react.dev) + TypeScript
- [Vite](https://vitejs.dev) (dev server and build)
- [Zustand](https://github.com/pmndrs/zustand) (state management)
- [Tailwind CSS](https://tailwindcss.com) (styling)

## Getting started

### Requirements

- [Node.js](https://nodejs.org) (LTS version)

Check your install:

```bash
node -v
npm -v
```

### Setup

```bash
# create the project (skip if you already have it)
npm create vite@latest webos -- --template react-ts
cd webos

# install dependencies
npm install
npm install zustand
npm install tailwindcss @tailwindcss/vite

# start the dev server
npm run dev
```

Then open the local URL shown in the terminal (usually http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

## Startup flow

The OS moves through three phases, controlled by `phase` in `systemStore.ts`:

| Phase | Screen | What happens |
|---|---|---|
| `boot` | `BootScreen` | Logo on a black background with a progress bar, then fades out |
| `login` | `LoginScreen` | Clock, user avatar and password field; any password works for now |
| `desktop` | `Desktop` | Wallpaper placeholder (menu bar, dock and windows come next) |

`Restart` and `Shut Down` on the login screen return to the boot screen. `Log out` on the desktop returns to the login screen.

## Project structure

```
webos/
├── index.html
├── vite.config.ts
└── src/
    ├── main.tsx                    # entry point
    ├── App.tsx                     # switches screens based on phase
    ├── index.css                   # Tailwind import, global styles, animations
    │
    ├── core/
    │   └── store/
    │       └── systemStore.ts      # phase (boot/login/desktop), user name
    │
    ├── components/
    │   └── Logo.tsx                # SVG logo used on the boot screen
    │
    └── shell/
        ├── BootScreen.tsx
        ├── LoginScreen.tsx
        └── Desktop.tsx
```

### Planned structure

```
src/
├── core/
│   ├── store/windowStore.ts        # open windows, z-index, focus, minimize, maximize
│   ├── store/fsStore.ts            # virtual file system
│   ├── appRegistry.ts              # list of installed apps
│   └── hooks/                      # useDrag, useResize, useContextMenu
├── shell/
│   ├── MenuBar.tsx
│   ├── Dock.tsx
│   ├── Launchpad.tsx
│   ├── Spotlight.tsx
│   └── ControlCenter.tsx
├── windowing/
│   ├── WindowManager.tsx
│   ├── Window.tsx
│   └── TitleBar.tsx
└── apps/                           # one folder per app (Finder, Terminal, Notes...)
```

## Customizing

| What | Where |
|---|---|
| Boot duration | `BOOT_DURATION` in `src/shell/BootScreen.tsx` |
| Logo | `src/components/Logo.tsx` (swap in your own SVG) |
| Username | `userName` in `src/core/store/systemStore.ts` |
| Password check | `handleLogin` in `src/shell/LoginScreen.tsx` |
| Wallpaper | the gradient `background` style in `LoginScreen.tsx` and `Desktop.tsx` |

## Roadmap

- [x] Boot screen
- [x] Login screen
- [x] Desktop placeholder
- [ ] Window store and draggable, resizable windows
- [ ] Menu bar
- [ ] Dock with magnification
- [ ] App registry and first demo app
- [ ] Launchpad, Spotlight, Control Center
- [ ] Virtual file system and Finder
- [ ] Settings app (wallpaper, dark mode)
- [ ] Persistence with localStorage or IndexedDB

## Adding an app (planned)

Each app will live in its own folder under `src/apps/` with a manifest (`id`, `title`, `icon`, `defaultSize`) and a component. Registering it in the app registry will make it appear in the dock, Launchpad and Spotlight.

## Notes

The logo is a generic apple shape. Apple's real logo and name are trademarked, so use your own branding if you plan to publish this.
