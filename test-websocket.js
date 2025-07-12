const { io } = require('socket.io-client');

// Connect to the rewards WebSocket namespace
const socket = io('http://localhost:3000/rewards', { 
  transports: ['websocket'],
  autoConnect: true 
});

console.log('🔌 Connecting to WebSocket server...');

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server!');
  console.log('📡 Listening for real-time events...\n');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

// Listen for points updates
socket.on('pointsUpdated', (data) => {
  console.log('💰 Points Updated Event:');
  console.log(`   User ID: ${data.userId}`);
  console.log(`   New Total Points: ${data.totalPoints}`);
  console.log(`   Timestamp: ${new Date().toLocaleTimeString()}\n`);
});

// Listen for reward redemptions
socket.on('rewardRedeemed', (data) => {
  console.log('🎁 Reward Redeemed Event:');
  console.log(`   User ID: ${data.userId}`);
  console.log(`   Reward: ${JSON.stringify(data.reward, null, 2)}`);
  console.log(`   Timestamp: ${new Date().toLocaleTimeString()}\n`);
});

// Keep the connection alive
console.log('🔄 WebSocket client is running...');
console.log('📝 Now test the API endpoints to see real-time events!\n');
console.log('💡 Try these commands in another terminal:');
console.log('   curl -X POST http://localhost:3000/rewards/add-points/user123 -H "Content-Type: application/json" -d \'{"points": 50, "category": "test", "amount": 25}\'');
console.log('   curl -X POST http://localhost:3000/rewards/redeem/user123 -H "Content-Type: application/json" -d \'{"pointsToRedeem": 25, "rewardType": "voucher"}\'\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting from WebSocket...');
  socket.disconnect();
  process.exit(0);
}); 