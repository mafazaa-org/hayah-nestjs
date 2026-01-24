import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('isRead') isRead?: 'all' | 'true' | 'false',
  ): Promise<NotificationResponseDto[]> {
    const opt = isRead === 'true' ? true : isRead === 'false' ? false : 'all';
    return this.notificationsService.findAllByUser(user.userId, {
      isRead: opt,
    });
  }

  @Get('unread-count')
  getUnreadCount(
    @CurrentUser() user: { userId: string },
  ): Promise<number> {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch('mark-all-read')
  markAllAsRead(
    @CurrentUser() user: { userId: string },
  ): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.notificationsService.delete(id, user.userId);
  }
}
