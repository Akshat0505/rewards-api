# Rewards API

This is a backend rewards system I built using NestJS and MongoDB. It handles user rewards, points tracking, and redemption functionality - basically everything you'd need for a loyalty program backend.

## What it does

The API provides core functionality for managing a rewards system:

- User management with mock data
- Points system where users earn points from transactions
- Transaction history with pagination
- Reward redemption for different types of rewards
- Analytics to see how points are distributed
- Admin endpoints to view all system data

## Tech stack

I used:
- NestJS for the framework (great TypeScript support and structure)
- MongoDB for the database (flexible schema for this type of data)
- Swagger for API documentation
- Jest for testing

## Getting started

### Prerequisites
You'll need Node.js (v16 or higher), MongoDB running locally or in the cloud, and npm or yarn.

### Installation

First, clone the repo and install dependencies:
```bash
git clone <your-repo-url>
cd rewards
npm install
```

Set up your environment variables:
```bash
# Create a .env file
MONGODB_URI=mongodb://localhost:27017/rewards
PORT=3000
```

Start MongoDB:
```bash
# If you have MongoDB installed locally
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Run the application:
```bash
# Development mode with hot reload
npm run start:dev

# Or build and run production
npm run build
npm run start:prod
```

The API will be available at http://localhost:3000 and the Swagger documentation at http://localhost:3000/api.

## API overview

### Base URL
http://localhost:3000

### Quick start - test these endpoints

Create a user:
```bash
curl -X POST http://localhost:3000/rewards/create-user \
  -H "Content-Type: application/json" \
  -d '{"id": "john123", "name": "John Doe", "email": "john@example.com"}'
```

Add some points:
```bash
curl -X POST http://localhost:3000/rewards/add-points/john123 \
  -H "Content-Type: application/json" \
  -d '{"points": 500, "category": "shopping", "amount": 100}'
```

Check their balance:
```bash
curl http://localhost:3000/rewards/points/john123
```

See their transactions:
```bash
curl http://localhost:3000/rewards/transactions/john123
```

Redeem some points:
```bash
curl -X POST http://localhost:3000/rewards/redeem/john123 \
  -H "Content-Type: application/json" \
  -d '{"pointsToRedeem": 200, "rewardType": "voucher"}'
```

### Main endpoints

#### Rewards management
- GET /rewards/points/{userId} - Get user's current points balance
- GET /rewards/transactions/{userId} - Get user's transaction history with pagination
- POST /rewards/redeem/{userId} - Redeem points for rewards
- GET /rewards/options - See available reward options

#### Analytics
- GET /analytics/rewards-distribution - Get insights into point distribution

#### Admin endpoints (for debugging)
- GET /rewards/admin/users - View all users
- GET /rewards/admin/transactions - View all transactions  
- GET /rewards/admin/redemptions - View all redemptions
- GET /rewards/admin/database-summary - Get system overview

## Database structure

The schema is pretty straightforward:

- Users - Basic user info (id, name, email)
- Rewards - Points balance per user
- Transactions - When users earn points (amount, category, points earned)
- Redemptions - When users spend points (what they got, how many points)

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Get coverage report
npm run test:cov
```

## Sample data

The app comes with some mock data to test with:
- A few test users (user123, user456, etc.)
- Sample transactions across different categories
- Some existing point balances

## Error handling

The API returns helpful error responses:
- 400 - Bad request (missing fields, insufficient points)
- 404 - User not found
- 500 - Server errors

All errors include a clear message about what went wrong.

## Project structure

```
src/
├── modules/
│   ├── rewards/          # Main rewards logic
│   └── analytics/        # Analytics and insights
├── database/
│   ├── schemas/          # MongoDB schemas
│   └── seeds/            # Sample data
├── common/
│   ├── dto/              # Data transfer objects
│   └── exceptions/       # Custom error handling
└── main.ts              # App entry point
```

## Development scripts

```bash
npm run start:dev     # Development with hot reload
npm run start:debug   # Debug mode
npm run build         # Build for production
npm run start:prod    # Run production build
npm test              # Run tests
npm run lint          # Check code quality
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/rewards |
| PORT | Server port | 3000 |

## Why I built this

I wanted to create a solid foundation for a rewards system that could scale. The modular structure makes it easy to add new features, and the comprehensive testing gives confidence that everything works as expected.

## Future improvements

Some ideas for future enhancements:
- Add authentication and authorization
- Implement real-time notifications
- Add more analytics and reporting
- Create a frontend to go with it
- Add rate limiting and security features

## Getting help

If you run into issues:
- Check the Swagger docs at http://localhost:3000/api
- Look at the test files for examples
- The error messages should be descriptive

## Contributing

Feel free to fork this and make it your own. If you want to contribute:
1. Fork the repo
2. Make your changes
3. Add tests for new features
4. Submit a pull request

Built with NestJS and MongoDB. 