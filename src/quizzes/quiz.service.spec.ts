import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizService } from './quiz.service';
import { Quiz } from './entities/quiz.entity';
import { Company } from '../company/entity/company.entity';
import { User } from '../users/entities/user.entity';
import { QuizResult } from './entities/quiz.result.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockExportService } from '../common/const/mock.export.service';
import { mockRepository } from '../common/const/mock.repository';
import { QuizCreateDto } from './dto/quiz.create.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { QuizUpdateDto } from './dto/quiz.update.dto';
import { Question } from './entities/questions.entity';
import { PaginatedData } from '../types/interface';
import { mockUser } from '../common/const/mock.user';

const mockNotificationsService = {
  createNotificationForCompany: jest.fn(),
};

const quizDto: QuizCreateDto = {
  title: 'Sample Quiz',
  description: 'This is a sample quiz for testing purposes.',
  notificationsText: 'New quiz available!',
  frequencyInDays: 7, // optional
  questions: [],
};

describe('QuizService', () => {
  let quizService: QuizService;
  let quizRepository: Repository<Quiz>;
  let companyRepository: Repository<Company>;
  let userRepository: Repository<User>;
  let quizResultRepository: Repository<QuizResult>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: getRepositoryToken(Quiz),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(QuizResult),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockExportService,
        },
      ],
    }).compile();

    quizService = module.get<QuizService>(QuizService);
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    quizResultRepository = module.get<Repository<QuizResult>>(getRepositoryToken(QuizResult));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('createQuiz', () => {
    it('should create a quiz', async () => {
      const companyId = 1;
      const company = new Company();
      company.id = companyId;

      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(company);
      jest.spyOn(quizRepository, 'create').mockReturnValue(quizDto as Quiz);
      jest.spyOn(quizRepository, 'save').mockResolvedValue(quizDto as Quiz);

      const result = await quizService.createQuiz(companyId, quizDto);

      expect(companyRepository.findOne).toHaveBeenCalledWith({ where: { id: companyId } });
      expect(quizRepository.create).toHaveBeenCalledWith({ ...quizDto, company });
      expect(quizRepository.save).toHaveBeenCalledWith(quizDto as Quiz);
      expect(result).toBe(quizDto as Quiz);
    });

    it('should throw NotFoundException if company not found', async () => {
      const companyId = 1;

      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(undefined);

      await expect(quizService.createQuiz(companyId, quizDto)).rejects.toThrowError(NotFoundException);
      expect(companyRepository.findOne).toHaveBeenCalledWith({ where: { id: companyId } });
      expect(quizRepository.create).not.toHaveBeenCalled();
      expect(quizRepository.save).not.toHaveBeenCalled();
    });
  });
  describe('editQuiz', () => {
    it('should edit a quiz', async () => {
      const companyId = 1;
      const quizId = 1;
      const quizDto: QuizUpdateDto = {
        title: 'Updated Quiz',
        description: 'Updated Description',
        questions: [],
      };

      const existingQuiz = new Quiz();
      existingQuiz.id = quizId;
      existingQuiz.company = { id: companyId } as any; // Mocking the company
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(existingQuiz);
      jest.spyOn(quizRepository, 'save').mockResolvedValue({ ...existingQuiz, ...quizDto } as Quiz);

      const result = await quizService.editQuiz(companyId, quizId, quizDto);

      expect(quizRepository.findOne).toHaveBeenCalledWith({
        where: { id: quizId, company: { id: companyId } },
        relations: ['questions'],
      });
      expect(quizRepository.save).toHaveBeenCalledWith({
        ...existingQuiz,
        ...quizDto,
        questions: quizDto.questions.map((questionDto, index) => {
          const question = existingQuiz.questions[index] || new Question();
          Object.assign(question, questionDto);
          return question;
        }),
      } as Quiz);
      expect(result).toEqual({ ...existingQuiz, ...quizDto } as Quiz);
    });

    it('should throw NotFoundException if quiz not found', async () => {
      const companyId = 1;
      const quizId = 1;
      const quizDto: QuizUpdateDto = {
        title: 'Updated Quiz',
        description: 'Updated Description',
        questions: [],
      };

      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(undefined);

      await expect(quizService.editQuiz(companyId, quizId, quizDto)).rejects.toThrowError(NotFoundException);
      expect(quizRepository.findOne).toHaveBeenCalledWith({
        where: { id: quizId, company: { id: companyId } },
        relations: ['questions'],
      });
      expect(quizRepository.save).not.toHaveBeenCalled();
    });
  });
  describe('deleteQuiz', () => {
    it('should delete a quiz', async () => {
      const companyId = 1;
      const quizId = 1;

      jest.spyOn(quizRepository, 'softDelete').mockResolvedValue({ affected: 1 } as any); // Assuming soft delete is successful

      await quizService.deleteQuiz(companyId, quizId);

      expect(quizRepository.softDelete).toHaveBeenCalledWith({
        id: quizId,
        company: { id: companyId },
      });
    });

    it('should throw NotFoundException if quiz not found', async () => {
      const companyId = 1;
      const quizId = 1;

      jest.spyOn(quizRepository, 'softDelete').mockResolvedValue({ affected: 0 } as any); // Assuming no quiz is found for deletion

      await expect(quizService.deleteQuiz(companyId, quizId)).rejects.toThrowError(NotFoundException);

      expect(quizRepository.softDelete).toHaveBeenCalledWith({
        id: quizId,
        company: { id: companyId },
      });
    });
  });
});
