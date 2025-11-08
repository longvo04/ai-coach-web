# AI Coach FE

React + Vite frontend for an AI-powered career coach. Key features include CV analysis, goal planning and tracking, progress history, personalized feedback, and account management.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Backend: ensure the API is available at `http://localhost:8080` (default for development).
   
   To configure a custom API URL, create a `.env` file:
   ```
   VITE_API_URL=http://your-api-url.com
   ```
   
   The API URL defaults to:
   - Development: `http://localhost:8080`
   - Production: Update the production URL in `src/api/axiosClient.js` or set `VITE_API_URL` in your production environment.

Optional:
```bash
npm run lint
```
