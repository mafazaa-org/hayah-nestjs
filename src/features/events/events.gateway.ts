import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { EventsEmitterService } from './events-emitter.service';

interface AuthenticatedSocket extends Socket {
  data: { userId?: string };
}

@Injectable()
@WebSocketGateway({
  path: '/socket.io',
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly jwtSecret: string;
  private readonly presence = new Map<string, Set<string>>();
  private readonly socketLists = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emitter: EventsEmitterService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ?? 'dev-change-me';
  }

  afterInit(server: Server): void {
    this.emitter.setServer(server);
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.jwtSecret,
      });
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const listIds = this.socketLists.get(client.id);
    this.socketLists.delete(client.id);
    const userId = client.data.userId;
    if (!userId || !listIds) return;
    for (const listId of listIds) {
      const userIds = this.presence.get(listId);
      if (userIds) {
        userIds.delete(userId);
        if (userIds.size === 0) this.presence.delete(listId);
        else this.emitter.emitPresenceUpdated(listId, [...userIds]);
      }
    }
  }

  @SubscribeMessage('subscribe_list')
  handleSubscribeList(
    client: AuthenticatedSocket,
    payload: { listId: string },
  ): void {
    const userId = client.data.userId;
    if (!userId || !payload?.listId) return;
    const room = `list:${payload.listId}`;
    client.join(room);
    const presenceRoom = `presence:list:${payload.listId}`;
    client.join(presenceRoom);
    let listIds = this.socketLists.get(client.id);
    if (!listIds) {
      listIds = new Set<string>();
      this.socketLists.set(client.id, listIds);
    }
    listIds.add(payload.listId);
    let userIds = this.presence.get(payload.listId);
    if (!userIds) {
      userIds = new Set<string>();
      this.presence.set(payload.listId, userIds);
    }
    userIds.add(userId);
    this.emitter.emitPresenceUpdated(payload.listId, [...userIds]);
  }

  @SubscribeMessage('unsubscribe_list')
  handleUnsubscribeList(
    client: AuthenticatedSocket,
    payload: { listId: string },
  ): void {
    const userId = client.data.userId;
    if (!userId || !payload?.listId) return;
    client.leave(`list:${payload.listId}`);
    client.leave(`presence:list:${payload.listId}`);
    this.socketLists.get(client.id)?.delete(payload.listId);
    const userIds = this.presence.get(payload.listId);
    if (userIds) {
      userIds.delete(userId);
      if (userIds.size === 0) this.presence.delete(payload.listId);
      else this.emitter.emitPresenceUpdated(payload.listId, [...userIds]);
    }
  }

  @SubscribeMessage('subscribe_task')
  handleSubscribeTask(
    client: AuthenticatedSocket,
    payload: { taskId: string },
  ): void {
    if (!client.data.userId || !payload?.taskId) return;
    client.join(`task:${payload.taskId}`);
  }

  @SubscribeMessage('unsubscribe_task')
  handleUnsubscribeTask(
    client: AuthenticatedSocket,
    payload: { taskId: string },
  ): void {
    if (!payload?.taskId) return;
    client.leave(`task:${payload.taskId}`);
  }

  @SubscribeMessage('presence_heartbeat')
  handlePresenceHeartbeat(
    client: AuthenticatedSocket,
    payload: { listId: string },
  ): void {
    const userId = client.data.userId;
    if (!userId || !payload?.listId) return;
    let userIds = this.presence.get(payload.listId);
    if (!userIds) {
      userIds = new Set<string>();
      this.presence.set(payload.listId, userIds);
    }
    if (!userIds.has(userId)) {
      userIds.add(userId);
      this.emitter.emitPresenceUpdated(payload.listId, [...userIds]);
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = (client.handshake as any).auth;
    if (auth?.token && typeof auth.token === 'string') return auth.token;
    const authHeader = client.handshake.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return null;
  }
}
