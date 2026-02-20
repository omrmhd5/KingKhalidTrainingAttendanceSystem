# King Khalid Training Attendance System - Backend

Node.js Express + MongoDB backend for the King Khalid Training Attendance System.

## Project Structure

```
backend/
├── services/         # Business logic (to be implemented)
├── middleware/       # Express middleware
├── app.js            # Express app setup
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
└── package.json      # Dependencies
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/king-khalid-training
NODE_ENV=development
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

- `GET /api/health` - Health check

## TODO

- [ ] Create models
- [ ] Create routes
- [ ] Create controllers
- [ ] Implement service logic
- [ ] Add authentication
- [ ] Add validation middleware
- [ ] Connect to MongoDB
- [ ] Add tests
