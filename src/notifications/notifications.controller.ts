import { Controller, Get, Param, ParseIntPipe, Query, Put, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entity/notification.entity';
import { PaginatedData } from '../types/interface';
import { AuthGuard } from '@nestjs/passport';
import { UserGuard } from '../auth/guard/app.guard';
@UseGuards(AuthGuard('jwt'), UserGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  async getNotificationsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<PaginatedData<Notification>> {
    return this.notificationsService.getNotificationsByUser(userId, page, limit);
  }

  @Put('mark-as-read/:notificationId')
  async markNotificationAsRead(@Param('notificationId', ParseIntPipe) notificationId: number): Promise<Notification> {
    return this.notificationsService.markNotificationAsRead(notificationId);
  }
}
