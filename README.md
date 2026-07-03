# SkillSync AI

A full-stack AI mock interview platform with secure authentication, résumé-aware question generation, live voice transcription, AI scoring, persisted interview history, and performance reports.

## Run locally

1. Copy `server/.env.example` to `server/.env` and add your MongoDB, JWT, and Groq credentials.
2. Install dependencies:
   - `npm install --prefix client`
   - `npm install --prefix server`
3. Start the API with `npm run server`.
4. In another terminal, start the web app with `npm run client`.
5. Open `http://localhost:5173`.

Chrome or Edge provides the best browser speech-recognition support. Typed answers remain available in every browser.

## Production

Set `VITE_API_URL` while building the client if the API is hosted anywhere other than `http://localhost:5000/api`. Set `CLIENT_URL` on the server to the deployed frontend origin.

Run `npm run lint` and `npm run build` before deployment.
