# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-09-29

### Added
- Second description line below the intro text listing current projects.

## [1.0.0] - 2026-09-12

### Initial release of www.frankwinter.com

First official major release of the personal website as a 100% static, secure and high-performance web application.

### Added
- **Interactive portrait ("Clay Frank"):**
  - Responsive portrait with lively animations: randomized blinking and various emotions/variants fading in (idea, keyboard, smile, skepticism, facepalm, etc.).
  - Click-and-hold interaction ("Hold to Show") for desktop (mouse) and mobile (touch events including `touchcancel` handling).
  - Intro hint: briefly shows a sign prompting interaction on first load.
  - Automatic sleep mode daily between 22:00 and 06:00 (`clay_frank_sleeping.webp`) with wake-up on touch (`clay_frank_sleeping_open_eyes.webp`).
- **Seasonal themes & holidays:**
  - Automatic seasonal display for Christmas (Dec 15–27), New Year (Dec 31–Jan 5), Halloween (Oct 25–Nov 1), Oktoberfest (Sep 15–Oct 10) and Valentine's Day (Feb 14).
  - Exact calculation of the Easter period (Palm Sunday to Easter Monday) using the Meeus/Jones/Butcher algorithm.
  - URL parameters for preview and control (`?sleeping`, `?awake`, `?away`, `?xmas`, `?easter`, `?halloween`, etc.).
- **Away status (`away.json`):**
  - GitOps-based control of away periods directly in the repository via `www/away.json`.
- **Design & layout:**
  - Minimalist dark theme with responsive design (`min-height: 100dvh`).
  - Social media links to GitHub, itch.io, Instagram, LinkedIn and YouTube with animated SVG icons.
- **Continuous Integration (CI) & code quality:**
  - New GitHub Actions workflow (`ci.yml`) on every push and pull request to `main`.
  - JSON schema and date validity check for `away.json`.
  - JavaScript syntax validation (`node --check`).
  - HTML5 linting via HTMLHint (`.htmlhintrc`).
  - CSS linting via Stylelint (`.stylelintrc.json`).
  - Automated integrity check of all WebP images referenced in the code.
- **Automated release workflow:**
  - GitHub Actions workflow (`release.yml`) for automatic deployment to the web host (Webgo) via SSH and `rsync`.
  - Triggered automatically when a GitHub release is published (`release: published`) and manually (`workflow_dispatch`).
  - Concurrency grouping to prevent conflicting parallel deployments.
- **Repository configuration:**
  - Standard `.gitignore` for OS files (`.DS_Store`, `Thumbs.db`), editor configurations (`.vscode/`, `.idea/`) and temporary files.
  - `.gitattributes` with LF line ending normalization.

### Fixed
- Removed duplicate HTML attribute `id="frank-portrait"` in `www/index.html`.
- Fixed CSS syntax error (`height: 22p2x;` instead of `height: 22px;`) in `www/site.css`.

### Removed
- Completely removed the server-side PHP admin script (`www/admin/away.php`); the project is now purely static with no server-side script execution.
