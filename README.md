# Open When... (Valentine App)

A personal interactive React web app for "Open When..." letters.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```

## How to add/edit letters

Edit:

- `src/data/letters.js`

Each letter object supports:

- `id`: unique stable ID (used for `localStorage`)
- `title`: card title
- `preview`: short subtext shown on card
- `note`: full message in modal
- `photos`: array of `{ src, alt }`
- `promise`: optional closing promise line

## How to use your own background photos

1. Add your images to:
   - `public/photos/us-1.jpg`
   - `public/photos/us-2.jpg`
   - `public/photos/us-3.jpg`
2. Keep those filenames (or update `backgroundPhotos` in `src/App.jsx`).
3. Use landscape photos for best full-screen fit.

## LocalStorage behavior

Opened state is stored in browser `localStorage` under key:

- `open-when-opened-letters`

It is per-browser/per-device. Clearing browser storage resets opened markers.
