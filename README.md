# Smart Resume Designer

Full-stack AI resume builder using React/Vite, Express, MongoDB, Firebase Authentication, and Gemini.

## Local setup

### 1. Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Required `server/.env` values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-resume-designer
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest
JWT_SECRET=your-long-random-secret
FRONTEND_URL=http://localhost:5173
GITHUB_REPOSITORY_URL=https://github.com/your-username/your-repository
```

### 2. Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Set the Firebase web configuration in `client/.env`. `VITE_GITHUB_REPOSITORY_URL` can also be set there; if it is empty, the client reads `GITHUB_REPOSITORY_URL` from the backend public config endpoint.

## Production

Build the client:

```bash
cd client
npm run build
```

The project includes `client/vercel.json` and `client/public/_redirects` so React Router routes work after direct refreshes on common static hosts.

If `client/dist` exists beside the server folder, the Express server also serves the client and falls back to `index.html` for non-API routes.

## Important troubleshooting

- `ERR_INTERNET_DISCONNECTED`, Firebase token 400s, and Firebase popup polling errors can occur when the browser has no network access or the Firebase web app/auth provider configuration is incorrect. Check the browser network connection and Firebase Authentication providers/authorized domains.
- `/api/auth/me` returns 401 when the backend cannot verify the Firebase ID token. Check the Firebase Admin service-account values in `server/.env` and restart the server.
- AI endpoints return a clear upstream error when the Gemini key/model is invalid. The backend uses the current Gemini REST authentication header and model configured by `GEMINI_MODEL`.
- `/api/health` shows Firebase and Gemini configuration status (including which models are configured) without exposing secrets — check this first if an AI button isn't working.
- The server needs **Node 18+** because `server/services/gemini.js` uses the native global `fetch`. On older Node versions every AI call fails immediately with "fetch is not defined".
- If AI calls used to time out: earlier versions of this project shipped with placeholder model names (`gemini-3.8-flash` and similar) that don't exist on the Gemini API. Every call to them returned 404, and because the retry logic didn't fail over on 404, requests could also stack up before returning an error — which showed up in the UI as a timeout. This is fixed: the defaults are now real model IDs (`gemini-flash-latest` with fallbacks to `gemini-3-flash-preview`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`), 404 now triggers fail-over to the next model, and per-attempt timeouts were shortened so the whole fallback chain finishes well inside the frontend's request timeout. If you copied the old model names into your own `server/.env`, update `GEMINI_MODEL`/`GEMINI_MODEL_FALLBACKS` there too (env vars override the code defaults).

## AI reliability
The server uses Google's auto-updating `gemini-flash-latest` alias by default, with automatic fail-over to `gemini-3-flash-preview`, `gemini-3.1-flash-lite`, and `gemini-2.5-flash` on capacity errors (429/503), server errors (500), or a retired/renamed model (404). Configure `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GEMINI_MODEL_FALLBACKS` in `server/.env` to override. Note: Google has scheduled the whole Gemini 2.5 line for shutdown on 16 October 2026 — it's kept here only as a last-resort fallback; the Gemini 3 models ahead of it in the list have no shutdown date yet.

## Resume editor
Links support a separate display name and URL, and date fields use native date pickers with DD/MM/YY guidance.

## Photos & templates

- 15 resume templates; 5 of them (category **Photo**) have a photo area: Photo Sidebar, Photo Classic, Photo Modern, Photo Creative, Photo Executive.
- Profile pictures and resume photos are cropped to a square, resized in the browser and stored as small JPEG data URLs with the user/resume document in MongoDB. Firebase Storage is no longer needed for pictures.
