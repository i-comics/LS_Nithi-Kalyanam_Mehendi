# i__comics Digital Wedding Photobooth

Mobile-first React + Vite + Tailwind photobooth for **Sri ❤️ Sri**.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Import the repo in Vercel — framework preset **Vite** is auto-detected.
3. `vercel.json` already includes the SPA rewrite so deep links won't 404.

## Google Drive backend
1. Open a Google Sheet or Drive folder → **Extensions/Apps Script**.
2. Paste `google-apps-script/Code.gs`, set `FOLDER_ID`.
3. Deploy → **Web app** → Execute as **Me**, Access **Anyone**.
4. Copy the `/exec` URL into `DRIVE_UPLOAD_ENDPOINT` in `src/App.jsx` (already pre-filled with the provided endpoint).

## Admin panel
Click the gear icon → password `icomics2026` (change `ADMIN_PASSWORD` in `src/App.jsx`).
