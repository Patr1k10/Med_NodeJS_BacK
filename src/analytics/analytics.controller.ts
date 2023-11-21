import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';
import { CompanyGuard } from '../auth/guard/company.guard';
import { UserGuard } from '../auth/guard/app.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  @Get('overall-average-score')
  async getOverallAverageScore(): Promise<number> {
    return this.analyticsService.getOverallAverageScore();
  }
  @UseGuards(AuthGuard('jwt'), UserGuard)
  @Get('user/rating')
  getUserRating(@GetUser() user: User): Promise<number> {
    return this.analyticsService.getUserRating(user.id);
  }
  @UseGuards(AuthGuard('jwt'), UserGuard)
  @Get('user/quiz-averages')
  getUserQuizAverages(@GetUser() user: User): Promise<any[]> {
    return this.analyticsService.getUserQuizAverages(user.id);
  }
  @UseGuards(AuthGuard('jwt'), UserGuard)
  @Get('user/quiz-history')
  getUserQuizHistory(@GetUser() user: User): Promise<any[]> {
    return this.analyticsService.getUserQuizHistory(user.id);
  }
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  @Get('company/:companyId/user-averages')
  getCompanyUserAverages(@Param('companyId') companyId: string): Promise<any[]> {
    return this.analyticsService.getCompanyUserAverages(+companyId);
  }
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  @Get('user/:userId/quiz-averages/:companyId')
  getUserQuizAveragesByQuiz(@Param('userId') userId: string, @Param('companyId') companyId: string): Promise<any[]> {
    return this.analyticsService.getUserQuizAveragesByQuiz(+userId, +companyId);
  }
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  @Get('company/:companyId/users-last-quiz-time')
  getCompanyUsersAndLastQuizTime(@Param('companyId') companyId: string): Promise<any[]> {
    return this.analyticsService.getCompanyUsersAndLastQuizTime(+companyId);
  }
}
