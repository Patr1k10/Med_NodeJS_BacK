import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizResult } from '../quizzes/entities/quiz.result.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entity/company.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,
  ) {}

  async getOverallAverageScore(): Promise<number> {
    const overallScoreData = await this.quizResultRepository
      .createQueryBuilder('qr')
      .select('SUM(qr.totalCorrectAnswers)', 'totalCorrectAnswers')
      .addSelect('SUM(qr.totalQuestionsAnswered)', 'totalQuestionsAnswered')
      .getRawOne();
    const totalCorrectAnswers = overallScoreData.totalCorrectAnswers || 0;
    const totalQuestionsAnswered = overallScoreData.totalQuestionsAnswered || 0;
    const rating = totalQuestionsAnswered > 0 ? totalCorrectAnswers / totalQuestionsAnswered : 0;
    return Math.round(rating * 100) / 10;
  }

  async getUserRating(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['quizResults'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const totalQuestionsAnswered = user.quizResults.reduce(
      (acc, quizResult) => acc + quizResult.totalQuestionsAnswered,
      0,
    );
    const totalCorrectAnswers = user.quizResults.reduce((acc, quizResult) => acc + quizResult.totalCorrectAnswers, 0);
    const rating = totalQuestionsAnswered > 0 ? totalCorrectAnswers / totalQuestionsAnswered : 0;
    return Math.round(rating * 100) / 10;
  }
  async getUserQuizAverages(userId: number): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['quizResults', 'quizResults.quiz'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user.quizResults.map((quizResult) => ({
      quizId: quizResult.quiz.id,
      average: Math.round((quizResult.totalCorrectAnswers / quizResult.totalQuestionsAnswered) * 100) / 10,
      completionTime: quizResult.completionTime,
    }));
  }

  async getUserQuizHistory(userId: number): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['quizResults', 'quizResults.quiz'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user.quizResults.map((quizResult) => ({
      quizId: quizResult.quiz.id,
      lastCompletionTime: quizResult.completionTime,
    }));
  }
  async getCompanyUserAverages(companyId: number): Promise<any[]> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['members.quizResults'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
    return company.members.map((user) => {
      const totalQuestionsAnswered = user.quizResults.reduce(
        (acc, quizResult) => acc + quizResult.totalQuestionsAnswered,
        0,
      );
      const totalCorrectAnswers = user.quizResults.reduce((acc, quizResult) => acc + quizResult.totalCorrectAnswers, 0);
      const rating = totalQuestionsAnswered > 0 ? totalCorrectAnswers / totalQuestionsAnswered : 0;
      return {
        userId: user.id,
        average: Math.round(rating * 100) / 10,
      };
    });
  }
  async getUserQuizAveragesByQuiz(userId: number, companyId: number): Promise<any[]> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['members.quizResults.quiz'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
    const user = company.members.find((member) => member.id === userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found in company with ID ${companyId}`);
    }
    return user.quizResults.map((quizResult) => ({
      quizId: quizResult.quiz.id,
      average: Math.round((quizResult.totalCorrectAnswers / quizResult.totalQuestionsAnswered) * 100) / 10,
      completionTime: quizResult.completionTime,
    }));
  }
  async getCompanyUsersAndLastQuizTime(companyId: number): Promise<any[]> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['members.quizResults'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
    return company.members.map((user) => {
      const lastQuizResult = user.quizResults.reduce((prev, current) =>
        prev.completionTime > current.completionTime ? prev : current,
      );
      return {
        userId: user.id,
        lastQuizTime: lastQuizResult ? lastQuizResult.completionTime : null,
      };
    });
  }
}
