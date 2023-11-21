import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company/entity/company.entity';
import { Notification } from './entity/notification.entity';
import { NotificationStatus } from '../types/enums/notification.status';
import { PaginatedData } from '../types/interface';
import { paginate } from '../common/pagination';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createNotificationForCompany(companyId: number, text: string): Promise<void> {
    const companyMembers = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.members', 'user')
      .where('company.id = :companyId', { companyId })
      .getOne();
    if (!companyMembers || !companyMembers.members || companyMembers.members.length === 0) {
      throw new NotFoundException('Company members not found');
    }
    const notifications = companyMembers.members.map((member) => ({
      user: { id: member.id },
      time: new Date(),
      text,
    }));
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
    return this.notificationRepository.save(notification);
  }
}
