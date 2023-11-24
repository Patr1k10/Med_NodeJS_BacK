import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company/entity/company.entity';
import { Notification } from './entity/notification.entity';
import { NotificationStatus } from '../types/enums/notification.status';
import { PaginatedData } from '../types/interface';
import { paginate } from '../common/pagination';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createNotificationForCompany(companyId: number, text: string): Promise<void> {
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.members', 'user')
      .where('company.id = :companyId', { companyId })
      .getOne();
    if (!company || !company.members || company.members.length === 0) {
      throw new NotFoundException('Company members not found');
    }
    const notifications = company.members.map((member) => ({
      user: { id: member.id },
      time: new Date(),
      text,
    }));
    notifications.forEach((notification) => {
      this.notificationsGateway.sendNotificationToUser(notification.user.id, notification.text);
    });
    this.logger.log(`Create notification for company ${companyId}`);
    await this.notificationRepository.insert(notifications);
  }

  async getNotificationsByUser(userId: number, page: number, limit: number): Promise<PaginatedData<Notification>> {
    try {
      const queryBuilder = this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.user.id = :userId', { userId })
        .orderBy('notification.time', 'DESC');
      return paginate<Notification>(this.notificationRepository, queryBuilder, page, limit);
    } catch (error) {
      throw new NotFoundException('Failed to retrieve notifications');
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id: notificationId } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.status = NotificationStatus.READ;
    this.logger.log(`Marking notification:${notification.id} as read`);
    return this.notificationRepository.save(notification);
  }
}
