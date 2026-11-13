# Ad Banner Generator

A brand-safe web tool that turns one input (headline, offer, button text, color, optional image) into display ads in four standard sizes. Marketers get PNG or HTML banners in seconds instead of resizing by hand.

## Problem solved
Marketing teams need the same ad in many sizes and variations, and every manual resize costs time and risks off-brand output. This tool automates it and enforces brand rules, so teams ship campaigns faster with fewer resources.

## Features
- Live previews: 300x250, 728x90, 160x600, 320x50
- Export each size as PNG or standalone HTML/CSS
- Built-in brand rules: fixed font, approved color palette, character limits, contrast warning
- Optional background image with dark overlay for readable text
- Save and reload templates (Node.js server + JSON file storage)
- Accessible form (labels, keyboard focus, live error messages) and responsive layout
- Unit tests for validation and export logic

## Run
```bash
npm start        # http://localhost:3000
npm test         # runs 7 unit tests (Node 18+)
```
No dependencies to install. You can also open `public/index.html` directly (template saving needs the server).

## Structure
```
public/            front end (HTML, CSS, JS)
  js/banners.js    sizes, brand rules, validation, canvas drawing, HTML export
  js/app.js        UI, previews, downloads, template calls
server.js          Node HTTP server + /api/templates
data/templates.json  saved templates
tests/             unit tests
docs/              usage and interview notes
```

## Tech
HTML5, CSS3 (Grid/Flexbox, variables), JavaScript (Canvas API), Node.js (http, fs), REST-style API, JSON storage.

## Roadmap
More ad sizes, logo upload, animated HTML5 banners, database storage (SQLite/MongoDB), batch export as ZIP.
