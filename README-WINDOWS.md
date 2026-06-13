# Kanto Adventure on Windows

The game runs entirely in your browser; Node.js is only needed to serve it.
Setup takes about five minutes.

## 1. Install Node.js

Grab the LTS installer at [nodejs.org](https://nodejs.org) and run it with
the default options. This installs both `node` and `npm`. (Vite 6 needs
Node 18 or newer; any current LTS qualifies.) Check it worked by opening a
new terminal and running `node --version`.

## 2. Copy the project to the PC

**With git** — if you have [Git for Windows](https://git-scm.com/download/win)
(install it with the default options, then open a new terminal), clone the repo:

```powershell
git clone https://github.com/char-boomer-remakes/kanto-adv.git
cd kanto-adv
```

**Without git** — no need to install anything: just copy the project folder
over (USB stick, zip, cloud drive). If you copy it by hand, leave out the
`node_modules` folder: it is huge, and the next step rebuilds it from scratch.

## 3. Install dependencies and play

Open PowerShell in the project folder (in File Explorer, click the address
bar, type `powershell`, press Enter) and run:

```powershell
npm install
npm run dev
```

Your default browser opens the game automatically; if it stays quiet,
browse to **http://localhost:5173**. Click the game once to capture the
mouse. Controls are listed in [README.md](README.md#controls).

## Good to know

- Any recent browser works: Edge (already on your PC), Chrome, or Firefox.
- The game is fully offline once `npm install` has run — sprites, models
  and Three.js are all local.
- Production build: `npm run build`, then `npm run preview` serves `dist/`
  at http://localhost:4173.

## Optional dev tooling

- `npm run typecheck` works as-is.
- `npm test` (e2e suite) needs Google Chrome installed and a dev server
  already running.
- `npm run data` regenerates the Gen 1 data tables and assumes a `python3`
  command; on Windows run `python tools/generate_data.py` instead (Python 3
  from [python.org](https://python.org) or the Microsoft Store).
