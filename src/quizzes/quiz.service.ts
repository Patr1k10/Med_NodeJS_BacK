import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from '../company/entity/company.entity';
import { QuizCreateDto } from './dto/quiz.create.dto';
import { Quiz } from './entities/quiz.entity';
import { QuizUpdateDto } from './dto/quiz.update.dto';
import { Question } from './entities/questions.entity';
import { paginate } from '../common/pagination';
import { PaginatedData } from '../types/interface';

@Injectable()
export class QuizService {
  private readonly logger: Logger = new Logger(QuizService.name);
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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
}
