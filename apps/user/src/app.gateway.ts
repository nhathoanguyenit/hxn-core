import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/',
  cors: { origin: '*' },
})
export class AppSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppSocketGateway.name);
  private onlineUsers = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('WebSocket initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new UnauthorizedException('Missing token');

      const payload = await this.jwtService.verifyAsync(token);

      const userId = payload.sub;
      const username = payload.username;

      if (!userId) throw new UnauthorizedException('Invalid token');

      client.data.userId = userId;
      client.data.username = username;
      this.onlineUsers.set(userId, client.id);

      this.logger.log(`User ${username || userId} connected (${client.id})`);

      client.emit('welcome', {
        message: 'Welcome to WebSocket server',
        userId,
        username,
      });

      this.server.emit('user_online', { userId, username });

      client.emit('online_users', Array.from(this.onlineUsers.keys()));
    } catch (error) {
      this.logger.warn(`Socket auth failed: ${error.message}`);
      client.emit('auth_error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;

    if (userId && this.onlineUsers.has(userId)) {
      this.onlineUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
      this.server.emit('user_offline', { userId });
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    const cookieHeader = client.handshake.headers.cookie;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    if (cookieHeader) {
      const match = cookieHeader.match(/jwt=([^;]+)/);
      return match ? match[1] : null;
    }

    return null;
  }
}
