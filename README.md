MacOS Web OS

A macOS-inspired Web OS built with React, TypeScript, Vite, Tailwind CSS, Zustand, and Electron.

Features
macOS-style desktop
Window management
Resizable and movable application windows
Dock
Menu bar
Finder
Safari
Music
Settings
Terminal
Calculator
Clock
News
Desktop widgets
Multiple wallpapers
Dark and light UI
Electron desktop support
Native browser rendering through Electron
Requirements

Install the following before cloning the project:

Git
Node.js
npm

Check Git:

git --version

Check Node.js:

node --version

Check npm:

npm --version

A current Node.js LTS version is recommended.

Clone the Repository

Clone the repository using:

git clone YOUR_REPOSITORY_URL

Example:

git clone https://github.com/YOUR_USERNAME/macos-web-os.git

Enter the project directory:

cd macos-web-os

If your repository has a different name, replace macos-web-os with the actual folder name.

Install Dependencies

Install all required packages:

npm install

This installs the dependencies specified in package.json, including:

React
React DOM
TypeScript
Vite
Tailwind CSS
Zustand
Lucide React
Electron
Electron Builder
Oxlint
TSX
Run the Web Version

Start the Vite development server:

npm run dev

Vite will display a local address in the terminal.

Usually:

http://localhost:5173

Open that address in your browser.

Build the Project

To create a production build:

npm run build

This performs TypeScript compilation and creates the Vite production build.

The generated files will be placed in:

dist/
Preview the Production Build

After building:

npm run preview

Vite will provide a local address for the production build.

Run Lint

Run Oxlint with:

npm run lint
Environment Variables

If you want Google search results inside the Safari application, create:

.env.local

in the root of the project.

Add:

VITE_GOOGLE_CSE_ID=YOUR_GOOGLE_CSE_ID

Replace YOUR_GOOGLE_CSE_ID with your Google Programmable Search Engine ID.

After changing .env.local, restart the development server:

Ctrl + C

Then:

npm run dev

Do not commit .env.local to GitHub.

Add the following to .gitignore:

node_modules
dist
.env
.env.local
.env.*.local
Electron

The project includes Electron for running the Web OS as a desktop application.

Electron-related files are located in:

electron/
├── main.cjs
└── preload.cjs

The Electron main process is responsible for creating the desktop window and native browser surfaces.

The preload process provides the communication bridge between the React application and Electron.

The Safari application uses Electron's native browser surface when running inside Electron. This allows websites that cannot normally be displayed inside an HTML iframe to be rendered inside the Web OS.

Electron Dependencies

Electron and Electron Builder are already included in the project:

"electron": "^44.7.0",
"electron-builder": "^26.15.3"

Install them automatically with:

npm install
Project Structure
macos-web-os/
│
├── public/
│   └── wallpapers/
│       ├── default.jpg
│       ├── default2.jpg
│       ├── default3.jpg
│       └── default4.jpg
│
├── src/
│   ├── apps/
│   │   ├── Calculator/
│   │   ├── Clock/
│   │   ├── Finder/
│   │   ├── Music/
│   │   ├── News/
│   │   ├── Safari/
│   │   ├── Settings/
│   │   └── Terminal/
│   │
│   ├── components/
│   │
│   ├── config/
│   │
│   ├── core/
│   │   ├── store/
│   │   └── ...
│   │
│   ├── shell/
│   │   ├── Desktop.tsx
│   │   ├── Dock.tsx
│   │   ├── MenuBar.tsx
│   │   └── ...
│   │
│   ├── widgets/
│   │
│   ├── windowing/
│   │   ├── AppWindow.tsx
│   │   ├── TitleBar.tsx
│   │   └── WindowManager.tsx
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── electron/
│   ├── main.cjs
│   └── preload.cjs
│
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
Wallpapers

Wallpaper images are stored in:

public/wallpapers/

Current image wallpapers:

default.jpg
default2.jpg
default3.jpg
default4.jpg

Additional gradient wallpapers are included in the wallpaper configuration.

To add a new image wallpaper, place the image inside:

public/wallpapers/

For example:

public/wallpapers/my-wallpaper.jpg

Then add it to the wallpaper list:

{
  id: 'my-wallpaper',
  name: 'My Wallpaper',
  style: make(
    'url(/wallpapers/my-wallpaper.jpg)',
  ),
},

Do not use /public/ in the URL.

Correct:

url(/wallpapers/my-wallpaper.jpg)

Incorrect:

url(/public/wallpapers/my-wallpaper.jpg)
Adding an Application

Applications are located inside:

src/apps/

Create a new application directory:

src/apps/MyApp/

Then create:

src/apps/MyApp/index.tsx

Register the application using the project's application registry.

Existing applications can be used as examples:

src/apps/Calculator/
src/apps/Clock/
src/apps/Finder/
src/apps/Music/
src/apps/News/
src/apps/Safari/
src/apps/Settings/
src/apps/Terminal/
Window System

The window system is responsible for application windows, including:

Moving windows
Resizing windows
Minimizing windows
Maximizing windows
Closing windows
Window focus
Window stacking
Active window management

Important files are located in:

src/windowing/

and:

src/shell/
Available Commands

Install dependencies:

npm install

Start development server:

npm run dev

Run lint:

npm run lint

Create production build:

npm run build

Preview production build:

npm run preview
Complete Setup From Scratch

A new developer can set up the project with:

git clone YOUR_REPOSITORY_URL
cd macos-web-os
npm install
npm run dev

Then open the URL shown by Vite.

Updating an Existing Clone

Pull the latest changes:

git pull

Install any new dependencies:

npm install

Start the project:

npm run dev
Clean Installation

If the project has dependency problems, remove node_modules.

Windows PowerShell
Remove-Item -Recurse -Force node_modules
npm install
Windows Command Prompt
rmdir /s /q node_modules
npm install
macOS/Linux
rm -rf node_modules
npm install

If you specifically need to regenerate the lockfile:

rm -rf node_modules package-lock.json
npm install

On Windows PowerShell:

Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
Troubleshooting
Node.js is not recognized

Run:

node --version

If the command is not recognized, install Node.js and restart your terminal.

npm is not recognized

Run:

npm --version

If the command is not recognized, reinstall Node.js and restart your terminal.

Port 5173 is already in use

Stop the existing development server:

Ctrl + C

Then start it again:

npm run dev

Vite may automatically select another available port.

Google Search is not working

Make sure .env.local contains:

VITE_GOOGLE_CSE_ID=YOUR_GOOGLE_CSE_ID

Then restart:

Ctrl + C
npm run dev
Wallpaper is not loading

Verify that the image exists in:

public/wallpapers/

For example:

public/wallpapers/default2.jpg

Then use:

url(/wallpapers/default2.jpg)
Development Workflow

Pull the latest code:

git pull

Install dependencies:

npm install

Start development:

npm run dev

After making changes, run:

npm run lint

Then verify the production build:

npm run build
Contributing

Fork the repository and clone your fork:

git clone YOUR_FORK_URL

Enter the project:

cd macos-web-os

Install dependencies:

npm install

Create a feature branch:

git checkout -b feature/my-feature

Make your changes and test them:

npm run dev

Run lint:

npm run lint

Build the project:

npm run build

Stage your changes:

git add .

Commit:

git commit -m "Add my feature"

Push the branch:

git push origin feature/my-feature

Then create a Pull Request on GitHub.

License

Add your preferred license here.

For example:

MIT License

If using MIT, add a LICENSE file to the root of the repository.

Quick Command Reference
# Clone
git clone YOUR_REPOSITORY_URL

# Enter project
cd macos-web-os

# Install dependencies
npm install

# Start development
npm run dev

# Lint
npm run lint

# Production build
npm run build

# Preview production build
npm run preview