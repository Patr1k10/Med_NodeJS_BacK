import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { QuizResult } from '../quizzes/entities/quiz.result.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Notification } from './entity/notification.entity';
import { NotificationStatus } from '../types/enums/notification.status';

@Injectable()
export class CronNotificationService {
  private readonly logger = new Logger(CronNotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,
  ) {}

  @Cron('0 0 * * *')
  async sendQuizNotifications() {
    const users = await this.userRepository.find();
    for (const user of users) {
      await this.checkAndSendNotifications(user);
    }
  }

  private async checkAndSendNotifications(user: User) {
    const quizResults = await this.quizResultRepository.find({
      where: { user: { id: user.id } },
      relations: ['quiz'],
    });
    for (const quizResult of quizResults) {
      const quiz = quizResult.quiz;
      const lastQuizDate = quizResult.completionTime;
      const nextQuizDate = new Date(lastQuizDate);
      nextQuizDate.setDate(nextQuizDate.getDate() + quiz.frequencyInDays);
      const currentDate = new Date();
      if (currentDate > nextQuizDate && !(await this.notificationAlreadySent(user, quiz))) {
        await this.sendNotification(user, quiz);
      }
    }
  }

  private async sendNotification(user: User, quiz: Quiz) {
    const notificationText = `Не забудьте пройти тест "${quiz.title}"!`;
    const notification = this.notificationRepository.create({
      user,
      text: notificationText,
      time: new Date(),
    });
    await this.notificationRepository.save(notification);
  }

  private async notificationAlreadySent(user: User, quiz: Quiz): Promise<boolean> {
    const existingNotification = await this.notificationRepository.findOne({
      where: {
        user: { id: user.id },
        status: NotificationStatus.PENDING,
        text: `Не забудьте пройти тест "${quiz.title}"!`,
      },
    });
    return !!existingNotification;
  }
}
