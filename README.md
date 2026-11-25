# QuickGPT

QuickGPT is a full-stack AI chat application built using the MERN Stack. It allows users to interact with an AI assistant in real time with features such as authentication, chat history, dark mode, and image generation.

## Tech Stack

- Frontend: React.js, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- AI Integration: Gemini through its OpenAI-compatible API
- Other Tools: PrismJS, Cloudflare Workers AI, Stripe

## Features

- AI-powered chat assistant
- User authentication and authorization
- Chat history management
- Dark mode support
- Image generation and community publishing
- Markdown and code syntax highlighting
- Responsive user interface

## Folder Structure

```text
QuickGPT/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

Use Node.js 22.13 or later and MongoDB. From the repository root, install the locked dependencies.

```sh
npm ci --prefix server
npm ci --prefix client
```

Create `server/.env`. Use a local database for development and a private, randomly generated JWT secret.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/quickgpt
JWT_SECRET=replace-with-a-random-secret
PORT=3000
CLIENT_URL=http://localhost:5173
```

Text generation uses `GEMINI_API_KEY` and optionally `GEMINI_MODEL` (default `gemini-3.8-flash`). Text generation uses the latest 32 messages and a 48,000-character history budget. Image generation uses `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. For purchases, configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Point Stripe at `/app/stripe` and subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Set `CLIENT_URL` to the frontend origin for checkout redirects.

Run these commands in separate terminals from the repository root.

```sh
npm --prefix server run server
npm --prefix client run dev
```

For crash-safe message billing, use a MongoDB replica set. On standalone MongoDB, the server refunds the debit when saving the reply fails.

Open http://localhost:5173. With `VITE_SERVER_URL` unset, Vite forwards `/api` to port 3000 in development. For separate frontend and API origins, set `VITE_SERVER_URL` in `client/.env` before building. A same-origin production deployment must route `/api` to Express and serve `index.html` for client routes.

## Checks

Run `npm --prefix client run lint` and `npm --prefix client run build`. With a local MongoDB server running, `npm --prefix server test` exercises the API in a new temporary database and removes that database afterward. Set `TEST_MONGODB_URI` to test on a different MongoDB port. The test supplies local fixtures for AI and checkout calls.

## Author

Ganesh Kumar

GitHub: https://github.com/ganeshkumarbuilds
