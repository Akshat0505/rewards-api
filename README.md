 Rewards API

This is a backend rewards system I built using NestJS and MongoDB. It handles user rewards, points tracking, and redemption functionality with real-time updates and performance optimization - basically everything you'd need for a modern loyalty program backend.

What it does

The API provides core functionality for managing a rewards system:

- User management with mock data
- Points system where users earn points from transactions
- Transaction history with pagination
- Reward redemption for different types of rewards
- Analytics to see how points are distributed
- Real-time WebSocket events for instant updates
- Redis caching for improved performance
- Admin endpoints to view all system data

 Tech stack

I used:
- NestJS for the framework (great TypeScript support and structure)
- MongoDB for the database (flexible schema for this type of data)
- Redis for caching and performance optimization
- Socket.IO for real-time WebSocket communication
- Swagger for API documentation
- Jest for testing

 Getting started

 Prerequisites
You'll need Node.js (v16 or higher), MongoDB running locally or in the cloud, Redis for caching, and npm or yarn.

 Installation

First, clone the repo and install dependencies:
bash-

git clone <your-repo-url>
cd rewards
npm install


Set up your environment variables:

Create a .env file
MONGODB_URI=mongodb://localhost:27017/rewards
REDIS_URL=redis://localhost:6379
PORT=3000


Start MongoDB:

 If you have MongoDB installed locally run
sudo systemctl start mongod

 Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest


Start Redis:

 If you have Redis installed locally run
redis-server

 Or use Docker
docker run -d -p 6379:6379 --name redis redis:latest


Run the application

npm run start:dev


The API will be available at http://localhost:3000 and the Swagger documentation at http://localhost:3000/api

 Real-time Features

WebSocket Events
The API provides real-time updates via WebSocket connections:

- Connect to ws://localhost:3000/rewards namespace
- Listen for pointsUpdated events when users earn points
- Listen for rewardRedeemed events when users spend points

Test WebSocket functionality:
- Use the included test-websocket.js client
- Or open websocket-test.html in your browser
- Start the test server: python3 -m http.server 8080
- Visit http://localhost:8080/websocket-test.html

Performance Features

Redis Caching
- User points are cached for 5 minutes
- Automatic cache invalidation on updates
- Improved API response times
- Reduces database load

 API overview

Base URL
http://localhost:3000

 Quick start - test these endpoints

Create a user:

curl -X POST http://localhost:3000/rewards/create-user \
  -H "Content-Type: application/json" \
  -d '{"id": "john123", "name": "John Doe", "email": "john@example.com}'


Add some points:

curl -X POST http://localhost:3000/rewards/add-points/john123 \
  -H "Content-Type: application/json" \
  -d '{"points": 500, "category": "shopping", "amount": 100}'


Check their balance:

curl http://localhost:3000/rewards/points/john123


See their transactions:
curl http://localhost:3000/rewards/transactions/john123


Redeem some points:

curl -X POST http://localhost:3000/rewards/redeem/john123 \
  -H "Content-Type: application/json" \
  -d '{"pointsToRedeem": 200, "rewardType": "voucher"}'

 Main endpoints

 Rewards management
- GET /rewards/points/{userId} - Get user's current points balance (cached)
- GET /rewards/transactions/{userId} - Get user's transaction history with pagination
- POST /rewards/redeem/{userId} - Redeem points for rewards (triggers WebSocket event)
- GET /rewards/options - See available reward options

 Analytics
- GET /analytics/rewards-distribution - Get insights into point distribution

 Admin endpoints (for debugging)
- GET /rewards/admin/users - View all users
- GET /rewards/admin/transactions - View all transactions  
- GET /rewards/admin/redemptions - View all redemptions
- GET /rewards/admin/database-summary - Get system overview

 Database structure

The schema is pretty straightforward:

- Users - Basic user info (id, name, email)
- Rewards - Points balance per user
- Transactions - When users earn points (amount, category, points earned)
- Redemptions - When users spend points (what they got, how many points)

 Testing

Run the test suite:
h
 Run all tests

npm test

Watch mode for development

npm run test:watch


Test WebSocket functionality:

Start the WebSocket test client
node test-websocket.js

Or use the HTML test interface
Open websocket-test.html in your browser

 Sample data

The app comes with some mock data to test with:
- A few test users (user123, user456, etc.)
- Sample transactions across different categories
- Some existing point balances

 Error handling

The API returns helpful error responses:
- 400 - Bad request (missing fields, insufficient points)
- 404 - User not found
- 500 - Server errors

All errors include a clear message about what went wrong.

 Project structure


src/
├── modules/
│   ├── rewards/           Main rewards logic with WebSocket support
│   └── analytics/         Analytics and insights
├── database/
│   ├── schemas/           MongoDB schemas
│   └── seeds/             Sample data
├── common/
│   ├── dto/               Data transfer objects
│   └── exceptions/        Custom error handling
└── main.ts               App entry point

test-websocket.js          WebSocket test client
websocket-test.html        Visual WebSocket testing interface






