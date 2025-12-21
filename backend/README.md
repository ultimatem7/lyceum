# Lyceum Backend - Philosophy Forum & Essay Platform

Complete Node.js/Express backend with MongoDB for a philosophy discussion forum.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment:**
```bash
cp .env.example .env
# Edit .env and set your MongoDB URI and JWT_SECRET
```

3. **Start server:**
```bash
npm run dev
```

Server runs on http://localhost:5000

## Features

✅ User authentication (email + Google OAuth)
✅ Forum posts (questions & discussions)  
✅ Essay publishing (5 types)
✅ Threaded comments with replies
✅ Upvote/downvote system
✅ View tracking
✅ User profiles with stats
✅ 10 philosophy categories

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login  
- POST `/api/auth/google` - Google OAuth

### Posts
- GET `/api/posts` - List posts (paginated)
- GET `/api/posts/:id` - Get post (increments views)
- POST `/api/posts` - Create post (auth required)
- POST `/api/posts/:id/vote` - Vote on post (auth required)

### Essays  
- GET `/api/essays` - List essays (paginated)
- GET `/api/essays/:id` - Get essay (increments views)
- POST `/api/essays` - Create essay (auth required)
- POST `/api/essays/:id/vote` - Vote on essay (auth required)

### Comments
- GET `/api/comments?postId=X` - Get comments for post
- GET `/api/comments?essayId=X` - Get comments for essay
- POST `/api/comments` - Create comment (auth required)
- POST `/api/comments/:id/vote` - Vote on comment (auth required)

### Users
- GET `/api/users/:username` - Get user profile
- GET `/api/users/me/profile` - Get current user (auth required)
- PUT `/api/users/profile` - Update profile (auth required)

## MongoDB Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition from mongodb.com
# Start MongoDB service
# Use: mongodb://localhost:27017/lyceum
```

### Option 2: MongoDB Atlas (Free Cloud)
1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to .env as MONGODB_URI

## Environment Variables

Required in `.env`:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use long random string)
- `NODE_ENV` - development or production

## Project Structure

```
lyceum-backend/
├── models/          # MongoDB schemas
│   ├── User.js
│   ├── Post.js
│   ├── Essay.js
│   ├── Comment.js
│   └── Vote.js
├── routes/          # API endpoints
│   ├── auth.js
│   ├── posts.js
│   ├── essays.js
│   ├── comments.js
│   └── users.js
├── middleware/      # Auth middleware
│   └── auth.js
├── server.js        # Main Express app
├── package.json
└── .env
```

## Testing

Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

Test registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"password123"}'
```

## Next Steps

1. Build React frontend
2. Connect frontend to this API
3. Deploy backend to Railway/Render
4. Deploy frontend to Vercel/Netlify

## License

MIT