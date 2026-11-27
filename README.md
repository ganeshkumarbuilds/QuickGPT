# 🚀 QuickGPT — AI Creative Workspace

**Think, create, and explore with AI — all in one workspace.**

QuickGPT is a full-stack AI-powered creative workspace that combines intelligent text conversations and AI image generation in a single application.

Users can interact with an AI assistant, manage conversation history, generate images from text prompts, and explore creative possibilities through a modern, responsive interface.

🌐 **Live Application:** https://quick-gpt-gamma-neon.vercel.app/

---

## ✨ Features

### 🤖 AI-Powered Conversations
- Real-time AI conversations.
- OpenRouter integration for intelligent text generation.
- Configurable AI models.
- Automatic fallback model support.
- Context-aware conversations using recent chat history.

### 🎨 AI Image Generation
- Generate images from natural-language prompts.
- Cloudflare Workers AI integration.
- FLUX.1 schnell image generation.
- Image publishing and community exploration.

### 🔐 Authentication & Security
- User registration and login.
- JWT-based authentication.
- Secure password hashing with bcrypt.
- Protected API routes.
- Environment-based secret management.

### 💬 Chat Management
- Persistent conversation history.
- Manage previous conversations.
- Context-aware message history.
- Markdown rendering.
- Code syntax highlighting using PrismJS.

### 🎯 User Experience
- Modern, responsive interface.
- Dark mode support.
- Interactive creative workspace.
- Clean and intuitive navigation.

### 💳 Payment Integration
- Stripe checkout integration.
- Webhook support for payment events.
- Configurable payment processing.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, bcrypt |
| AI Text Generation | OpenRouter |
| AI Image Generation | Cloudflare Workers AI |
| Image Model | FLUX.1 schnell |
| Code Highlighting | PrismJS |
| Payments | Stripe |
| Deployment | Vercel, Render |
| Package Management | npm |

---

## 🏗️ Architecture

QuickGPT follows a client-server architecture.

```text
                    ┌──────────────────────┐
                    │       USER           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend    │
                    │    Vite + CSS       │
                    └──────────┬───────────┘
                               │
                         REST API Requests
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend    │
                    │      Node.js         │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼──────────────┐
                 │             │              │
                 ▼             ▼              ▼
          ┌────────────┐ ┌────────────┐ ┌────────────┐
          │  MongoDB   │ │ OpenRouter │ │ Cloudflare │
          │            │ │  Text AI   │ │ Workers AI │
          └────────────┘ └────────────┘ └────────────┘
                              
                         ┌────────────┐
                         │   Stripe   │
                         │  Payments  │
                         └────────────┘
```

---

## 📂 Project Structure

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
│   │
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
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Getting Started

Follow these instructions to run QuickGPT locally.

### Prerequisites

Make sure you have the following installed:

- Node.js 22.13 or later
- npm
- MongoDB
- Git

You will also need API credentials for the AI services you want to use.

### 1. Clone the Repository

```bash
git clone https://github.com/ganeshkumarbuilds/QuickGPT.git
```

```bash
cd QuickGPT
```

### 2. Install Dependencies

Install backend dependencies:

```bash
npm ci --prefix server
```

Install frontend dependencies:

```bash
npm ci --prefix client
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/quickgpt

JWT_SECRET=replace-with-a-secure-random-secret

PORT=3000

CLIENT_URL=http://localhost:5173

OPENROUTER_API_KEY=your_openrouter_api_key

OPENROUTER_MODEL=openrouter/free

OPENROUTER_FALLBACK_MODEL=openrouter/free

CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

STRIPE_SECRET_KEY=your_stripe_secret_key

STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**Important:**

- Generate a secure, random JWT secret.
- Never commit API keys or secrets to GitHub.
- Keep private credentials exclusively in environment variables.
- Configure only the integrations you intend to use.

### 4. Configure AI Services

**OpenRouter — Text Generation**

QuickGPT uses OpenRouter for AI-powered text conversations.

Set your API key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

The default model configuration uses:

```env
OPENROUTER_MODEL=openrouter/free
OPENROUTER_FALLBACK_MODEL=openrouter/free
```

You can configure a different OpenRouter model ID that supports text input and text output.

When the primary model returns HTTP 404, 410, or 503, QuickGPT attempts the configured fallback model once if the model IDs differ.

Free models are subject to provider availability and rate limits.

**Cloudflare Workers AI — Image Generation**

QuickGPT uses Cloudflare Workers AI with FLUX.1 schnell for image generation.

Configure:

```env
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

**Stripe — Payments**

For payment functionality, configure:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Configure your Stripe webhook endpoint:

```text
/app/stripe
```

Subscribe to these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

### 5. Start the Application

Open two separate terminals from the project root.

**Terminal 1 — Backend**

```bash
npm --prefix server run server
```

**Terminal 2 — Frontend**

```bash
npm --prefix client run dev
```

### 6. Open the Application

Visit:

```text
http://localhost:5173
```

Your QuickGPT application should now be running locally.

---

## 🔧 Additional Configuration

### Frontend API URL

For local development, Vite forwards `/api` requests to the backend running on port `3000` when `VITE_SERVER_URL` is not configured.

For deployments with separate frontend and backend origins, configure `VITE_SERVER_URL` in `client/.env` before building the frontend.

### Production Deployment

QuickGPT supports deployment using Vercel and Render.

**Frontend — Vercel**

- Deploy the `client` application.
- Configure the production API URL.
- Set the required frontend environment variables.

**Backend — Render**

- Deploy the `server` application.
- Configure the MongoDB connection string.
- Add the required AI service credentials.
- Configure `CLIENT_URL` with the deployed frontend origin.

For same-origin deployments, route `/api` requests to Express and serve `index.html` for client-side routes.

---

## 🧪 Testing & Quality Checks

Run frontend linting:

```bash
npm --prefix client run lint
```

Build the frontend:

```bash
npm --prefix client run build
```

Run backend tests:

```bash
npm --prefix server test
```

The backend test suite uses a local MongoDB instance and temporary test database.

You can configure an alternative test database using:

```env
TEST_MONGODB_URI=your_test_mongodb_connection_string
```

The test suite supplies local fixtures for AI and checkout calls.

**Database Note:** For crash-safe message billing, use MongoDB configured as a replica set. On standalone MongoDB, the server refunds the debit if saving the reply fails.

---

## 🌍 Live Demo

Experience QuickGPT:

**[🚀 Open QuickGPT](https://quick-gpt-gamma-neon.vercel.app/)**

---

## 👨‍💻 Author

**Ganesh Kumar Chavala**

Java Full Stack Developer | AI/ML Engineer

- GitHub: [@ganeshkumarbuilds](https://github.com/ganeshkumarbuilds)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/ganeshchavala/)
- Portfolio: [Visit my Portfolio](https://portfolio-ten-pink-aenzzw7g2e.vercel.app/)

---

## ⭐ Support

If you find this project interesting, consider giving the repository a ⭐ on GitHub.

Your support and feedback are appreciated!

---

**Built with ❤️ by Ganesh Kumar**
