# Trace — AI Code Explainer

A React code explainer powered by Groq. The API key stays in the Express server and is never sent to the browser.

## Run locally

1. Copy `.env.example` to `.env`.
2. Add your Groq API key to `.env`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

For production, run `npm run build` followed by `npm start`. The server serves both the API and the built React app on port `3001` by default.

## Environment variables

- `GROQ_API_KEY` — required Groq API key
- `GROQ_MODEL` — optional; defaults to `llama-3.3-70b-versatile`
- `PORT` — optional server port; defaults to `3001`
