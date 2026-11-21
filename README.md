# Toy Zone

## Run locally

1. Install dependencies with `npm install`.
2. Install and start MongoDB locally, or create a MongoDB Atlas database.
3. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your database connection string and replace `JWT_SECRET` with a random secret of at least 32 characters. Keep `.env` private.
4. Start the API and Vite frontend together with `npm run dev:all`.
5. Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

The frontend proxies `/api` requests to the Express API on port 5000. Registration stores a bcrypt-hashed password in MongoDB; login verifies it and returns an HTTP-only session cookie. For a separately hosted frontend, set `CLIENT_ORIGIN` to its exact origin and configure deployment to serve the API on the same site so the session cookie is sent.

Run only the API with `npm run server`, or only the frontend with `npm run dev`.

## API

- `GET /api/health` — API and MongoDB connection status
- `POST /api/auth/register` — create an account (`name`, `email`, `password`)
- `POST /api/auth/login` — authenticate (`email`, `password`)
