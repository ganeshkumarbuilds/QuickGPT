# QuickGPT

QuickGPT is a full-stack AI chat application built using the MERN Stack. It allows users to interact with an AI assistant in real time with features such as authentication, chat history, dark mode, and image upload support.

## Tech Stack

- Frontend: React.js, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- AI Integration: OpenAI API
- Other Tools: PrismJS, ImageKit

## Features

- AI-powered chat assistant
- User authentication and authorization
- Chat history management
- Dark mode support
- Image upload support
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

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/QuickGPT.git
cd QuickGPT
```

### Install Dependencies

Backend

```bash
cd server
npm install
```

Frontend

```bash
cd ../client
npm install
```

## Run the Application

Backend

```bash
npm run server
```

Frontend

```bash
npm run dev
```

## Environment Variables

Create a `.env` file inside the `server` folder and add:

```env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

OPENAI_API_KEY=your_openai_api_key

IMAGEKIT_PUBLIC_KEY=your_public_key

IMAGEKIT_PRIVATE_KEY=your_private_key

IMAGEKIT_URL_ENDPOINT=your_url_endpoint
```

## Author

Ganesh Kumar

GitHub: https://github.com/ganeshkumarbuilds
