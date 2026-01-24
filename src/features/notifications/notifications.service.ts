import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserSettingsEntity } from '../users/entities/user-settings.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EmailService } from '../../common/email/email.service';

export const NotificationType = {
  TASK_ASSIGNMENT: 'task_assignment',
  TASK_DUE_REMINDER: 'task_due_reminder',
  COMMENT: 'comment',
  TASK_STATUS_CHANGE: 'task_status_change',
} as const;

export type NotificationTypeKey = keyof typeof NotificationType;

const TYPE_TO_PREF: Record<string, string> = {
  [NotificationType.TASK_ASSIGNMENT]: 'taskAssignment',
  [NotificationType.TASK_DUE_REMINDER]: 'taskDueReminder',
  [NotificationType.COMMENT]: 'comments',
  [NotificationType.TASK_STATUS_CHANGE]: 'taskStatusChange',
};

const DEFAULT_PREFS: Record<string, boolean> = {
  taskAssignment: true,
  taskDueReminder: true,
  comments: true,
  taskStatusChange: true,
  email: false,
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserSettingsEntity)
    private readonly userSettingsRepository: Repository<UserSettingsEntity>,
    private readonly emailService: EmailService,
  ) {}

  private async shouldNotify(userId: string, type: string): Promise<boolean> {
    const prefs = await this.getNotificationPreferences(userId);
    const prefKey = TYPE_TO_PREF[type];
    if (!prefKey) return true;
    const val = prefs[prefKey];
    if (val === undefined) return DEFAULT_PREFS[prefKey] ?? true;
    return !!val;
  }

  private async getNotificationPreferences(
    userId: string,
  ): Promise<Record<string, boolean>> {
    const settings = await this.userSettingsRepository.findOne({
      where: { user: { id: userId } },
    });
    const prefs = settings?.notificationPreferences as Record<string, boolean> | null | undefined;
    return { ...DEFAULT_PREFS, ...(prefs ?? {}) };
  }

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedId: string | null = null,
  ): Promise<NotificationEntity | null> {
    const notify = await this.shouldNotify(userId, type);
    if (!notify) return null;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    const notification = this.notificationRepository.create({
      user: { id: userId } as UserEntity,
      type,
      title,
      message,
      relatedId,
      isRead: false,
    });
    const saved = await this.notificationRepository.save(notification);

    // Optional email notification (user must have email pref enabled)
    const prefs = await this.getNotificationPreferences(userId);
    if (prefs.email && this.emailService.isEnabled()) {
      this.emailService
        .sendNotificationEmail(user.email, title, message)
        .catch(() => {});
    }

    return saved;
  }

  async createForUsers(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    relatedId: string | null = null,
  ): Promise<NotificationEntity[]> {
    const created: NotificationEntity[] = [];
    const seen = new Set<string>();
    for (const uid of userIds) {
      if (seen.has(uid)) continue;
      seen.add(uid);
      const n = await this.create(uid, type, title, message, relatedId);
      if (n) created.push(n);
    }
    return created;
  }

  async findAllByUser(
    userId: string,
    options?: { isRead?: 'all' | true | false },
  ): Promise<NotificationResponseDto[]> {
    const qb = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC');

    if (options?.isRead === true) {
      qb.andWhere('n.is_read = :isRead', { isRead: true });
    } else if (options?.isRead === false) {
      qb.andWhere('n.is_read = :isRead', { isRead: false });
    }

    const list = await qb.getMany();
    return list.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedId: n.relatedId,
      isRead: n.isRead,
      userId: n.user?.id ?? userId,
      createdAt: n.createdAt,
    }));
  }

  async findOne(id: string, userId: string): Promise<NotificationResponseDto> {
    const n = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedId: n.relatedId,
      isRead: n.isRead,
      userId: n.user.id,
      createdAt: n.createdAt,
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const n = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }
    await this.notificationRepository.remove(n);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const n = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }
    if (dto.isRead !== undefined) n.isRead = dto.isRead;
    await this.notificationRepository.save(n);
    return this.findOne(id, userId);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { count: result.affected ?? 0 };
  }
}
