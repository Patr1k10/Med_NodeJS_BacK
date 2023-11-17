import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from '../company/entity/company.entity';
import { QuizCreateDto } from './dto/quiz.create.dto';
import { Quiz } from './entities/quiz.entity';
import { QuizUpdateDto } from './dto/quiz.update.dto';
import { Question } from './entities/questions.entity';
import { paginate } from '../common/pagination';
import { PaginatedData } from '../types/interface';
import { QuizResult } from './entities/quiz.result.entity';
import { User } from '../users/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class QuizService {
  private readonly logger: Logger = new Logger(QuizService.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createQuiz(companyId: number, quizDto: QuizCreateDto): Promise<Quiz> {
    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const quiz = this.quizRepository.create({
      ...quizDto,
      company,
    });
    const createdQuiz = await this.quizRepository.save(quiz);
    this.logger.log(`Quiz created: ${JSON.stringify(createdQuiz)}`);
    return createdQuiz;
  }

  async editQuiz(companyId: number, quizId: number, quizDto: QuizUpdateDto): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId, company: { id: companyId } },
      relations: ['questions'],
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    Object.assign(quiz, quizDto);
    if (quizDto.questions) {
      quiz.questions = quizDto.questions.map((questionDto, index) => {
        const question = quiz.questions[index] || new Question();
        Object.assign(question, questionDto);
        return question;
      });
    }
    const updatedQuiz = await this.quizRepository.save(quiz);
    this.logger.log(`Quiz edited: ${JSON.stringify(updatedQuiz)}`);
    return updatedQuiz;
  }

  async deleteQuiz(companyId: number, quizId: number): Promise<void> {
    const result = await this.quizRepository.softDelete({
      id: quizId,
      company: { id: companyId },
    });
    if (result.affected === 0) {
      throw new NotFoundException('Quiz not found');
    }
    this.logger.log(`Quiz softDelete id: ${quizId}`);
  }

  async getCompanyQuizzes(companyId: number, page: number, limit: number): Promise<PaginatedData<Quiz>> {
    const queryBuilder: SelectQueryBuilder<Quiz> = this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.company', 'company')
      .where('company.id = :companyId', { companyId });
    try {
      return await paginate<Quiz>(this.quizRepository, queryBuilder, page, limit);
    } catch (error) {
      throw new NotFoundException('No quizzes found for the specified company');
    }
  }

  async submitQuizResult(userId: number, quizId: number, userAnswers: string[]): Promise<QuizResult> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const quiz = await this.quizRepository.findOne({ where: { id: quizId }, relations: [`questions`, `company`] });
    this.logger.log(` ${userId} ${quizId}`);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    // const lastQuizResult = await this.quizResultRepository.findOne({
    //   where: { user: { id: user.id }, quiz: { id: quiz.id } },
    //   order: { completionTime: 'DESC' },
    // });
    //
    // if (lastQuizResult) {
    //   const daysSinceLastQuiz = Math.floor(
    //     (new Date().getTime() - lastQuizResult.completionTime.getTime()) / (1000 * 60 * 60 * 24),
    //   );
    //   if (daysSinceLastQuiz < quiz.frequencyInDays) {
    //     this.logger.error(`User ${user.id} already completed this quiz within the last ${quiz.frequencyInDays} days`);
    //     throw new ConflictException(`User already completed this quiz within the last ${quiz.frequencyInDays} days`);
    //   }
    // }
    const totalQuestionsAnswered = userAnswers.length;
    const totalCorrectAnswers = await this.calculateCorrectAnswers(userAnswers, quiz.questions);
    const quizResult = this.quizResultRepository.create({
      user,
      quiz,
      userAnswers,
      totalQuestionsAnswered,
      totalCorrectAnswers,
      completionTime: new Date(),
    });
    const savedQuizResult = await this.quizResultRepository.save(quizResult);
    this.logger.log(`Quiz result submitted for User ${user.id}, Quiz ${quiz.id}`);
    await this.cache.set(`quizResult:${quiz.company.id}:${quiz.id}:${user.id}:${savedQuizResult.id}`, quizResult);
    return savedQuizResult;
  }

  private async calculateCorrectAnswers(userAnswers: string[], questions: Question[]): Promise<number> {
    let correctAnswers = 0;

    for (let i = 0; i < userAnswers.length; i++) {
      const userAnswer = userAnswers[i];
      const question = questions[i];
      if (question.correctAnswers.includes(userAnswer)) {
        correctAnswers++;
      }
    }
    return correctAnswers;
  }
}
