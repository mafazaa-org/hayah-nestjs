import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

const LIST_ROOM = (id: string) => `list:${id}`;
const TASK_ROOM = (id: string) => `task:${id}`;
const PRESENCE_ROOM = (id: string) => `presence:list:${id}`;

@Injectable()
export class EventsEmitterService {
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
  }

  private emitToRoom(room: string, event: string, payload: unknown): void {
    if (!this.server) return;
    try {
      this.server.to(room).emit(event, payload);
    } catch {
      // Emit failures must not break HTTP flows
    }
  }

  emitTaskCreated(listId: string, task: Record<string, unknown>): void {
    const room = LIST_ROOM(listId);
    this.emitToRoom(room, 'task_created', { listId, task });
  }

  emitTaskUpdated(listId: string, taskId: string, task: Record<string, unknown>): void {
    const listRoom = LIST_ROOM(listId);
    const taskRoom = TASK_ROOM(taskId);
    const payload = { listId, taskId, task };
    this.emitToRoom(listRoom, 'task_updated', payload);
    this.emitToRoom(taskRoom, 'task_updated', payload);
  }

  emitTaskMoved(listId: string, taskId: string, task: Record<string, unknown>): void {
    const listRoom = LIST_ROOM(listId);
    const taskRoom = TASK_ROOM(taskId);
    const payload = { listId, taskId, task };
    this.emitToRoom(listRoom, 'task_moved', payload);
    this.emitToRoom(taskRoom, 'task_moved', payload);
  }

  emitTaskDeleted(listId: string, taskId: string): void {
    const payload = { listId, taskId };
    this.emitToRoom(LIST_ROOM(listId), 'task_deleted', payload);
    this.emitToRoom(TASK_ROOM(taskId), 'task_deleted', payload);
  }

  emitTaskAssigned(listId: string, taskId: string, userId: string): void {
    const payload = { listId, taskId, userId };
    this.emitToRoom(LIST_ROOM(listId), 'task_assigned', payload);
    this.emitToRoom(TASK_ROOM(taskId), 'task_assigned', payload);
  }

  emitTaskUnassigned(listId: string, taskId: string, userId: string): void {
    const payload = { listId, taskId, userId };
    this.emitToRoom(LIST_ROOM(listId), 'task_unassigned', payload);
    this.emitToRoom(TASK_ROOM(taskId), 'task_unassigned', payload);
  }

  emitCommentCreated(
    listId: string,
    taskId: string,
    comment: Record<string, unknown>,
  ): void {
    const payload = { listId, taskId, comment };
    this.emitToRoom(LIST_ROOM(listId), 'comment_created', payload);
    this.emitToRoom(TASK_ROOM(taskId), 'comment_created', payload);
  }

  emitCommentUpdated(
    listId: string,
    taskId: string,
    comment: Record<string, unknown>,
  ): void {
    const payload = { listId, taskId, comment };
    this.emitToRoom(LIST_ROOM(listId), 'comment_updated', payload);
    this.emitToRoom(TASK_ROOM(taskId), 'comment_updated', payload);
  }

  emitCommentDeleted(listId: string, taskId: string, commentId: string): void {
    const payload = { listId, taskId, commentId };
    this.emitToRoom(LIST_ROOM(listId), 'comment_deleted', payload);
    this.emitToRoom(TASK_ROOM(taskId), 'comment_deleted', payload);
  }

  emitPresenceUpdated(listId: string, userIds: string[]): void {
    this.emitToRoom(PRESENCE_ROOM(listId), 'presence_updated', {
      listId,
      userIds,
    });
  }
}
