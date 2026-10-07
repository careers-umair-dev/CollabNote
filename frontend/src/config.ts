/**
 * Base URL of the backend API.
 *
 * Set `VITE_API_URL` in the environment (Vercel project settings, or
 * `frontend/.env` for local development). Do not include a trailing slash.
 * Falls back to the local backend when it is not set.
 */
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!rawApiUrl && import.meta.env.PROD) {
  console.error(
    "VITE_API_URL is not set. Set it to your deployed backend URL and redeploy the frontend.",
  );
}

export const API_URL = (rawApiUrl || "http://localhost:4000").replace(
  /\/+$/,
  "",
);
