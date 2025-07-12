import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/rewards', cors: true })
export class RewardsGateway {
  @WebSocketServer()
  server: Server;

  emitPointsUpdated(userId: string, totalPoints: number) {
    this.server.to(userId).emit('pointsUpdated', { userId, totalPoints });
  }

  emitRewardRedeemed(userId: string, reward: any) {
    this.server.to(userId).emit('rewardRedeemed', { userId, reward });
  }
} 