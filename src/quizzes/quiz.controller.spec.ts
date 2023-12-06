import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizCreateDto } from './dto/quiz.create.dto';
import { Quiz } from './entities/quiz.entity';
import { ExportService } from '../redis/export.service';
import { mockExportService } from '../common/const/mock.export.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../company/entity/company.entity';
import { mockRepository } from '../common/const/mock.repository';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitation/entity/invitation.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotificationsService } from '../notifications/notifications.service';
import { QuizResult } from './entities/quiz.result.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Notification } from '../notifications/entity/notification.entity';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Auth } from '../auth/entities/auth.entity';
import { PaginatedData } from '../types/interface';

const quizDto = { title: 'Quiz Title', description: 'Quiz Description' };

describe('QuizController', () => {
  let quizController: QuizController;
  let quizService: QuizService;
  let companyRepository: Repository<Company>;
  let userRepository: Repository<User>;
  let quizResultRepository: Repository<QuizResult>;
  let exportService: ExportService;
  let notificationsService: NotificationsService;
  let quizRepository: Repository<Quiz>;
  let notificationsGateway: NotificationsGateway;
  let notificationRepository: Repository<Notification>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [QuizController],
      providers: [
        QuizService,
        NotificationsService,
        NotificationsGateway,
        AuthService,
        ConfigService,
        JwtService,

        {
          provide: CACHE_MANAGER,
          useValue: mockExportService,
        },
        {
          provide: ExportService,
          useValue: mockExportService,
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Quiz),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Invitation),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(QuizResult),
          useValue: mockRepository,
        },
      ],
    }).compile();
    quizResultRepository = module.get<Repository<QuizResult>>(getRepositoryToken(QuizResult));
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    exportService = module.get<ExportService>(ExportService);
    quizController = module.get<QuizController>(QuizController);
    quizService = module.get<QuizService>(QuizService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    notificationsGateway = module.get<NotificationsGateway>(NotificationsGateway);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    authService = module.get<AuthService>(AuthService);
  });
  describe('createQuiz', () => {
    it('should create a quiz', async () => {
      const companyId = '1';

      const createdQuiz: Quiz = { id: 1, ...quizDto } as Quiz;

      jest.spyOn(quizService, 'createQuiz').mockResolvedValue(createdQuiz);

      const result = await quizController.createQuiz(companyId, quizDto as QuizCreateDto);

      expect(quizService.createQuiz).toHaveBeenCalledWith(+companyId, quizDto);
      expect(result).toEqual(createdQuiz);
    });
  });
  describe('editQuiz', () => {
    it('should edit a quiz', async () => {
      const companyId = 1;
      const quizId = 2;
      const editedQuiz = { title: 'edited Quiz Title', description: 'edited Quiz Description' };

      jest.spyOn(quizController['quizService'], 'editQuiz').mockResolvedValue(editedQuiz as Quiz);
      const result = await quizController.editQuiz(companyId, quizId, quizDto);

      expect(quizController['quizService'].editQuiz).toHaveBeenCalledWith(companyId, quizId, quizDto);
      expect(result).toEqual(editedQuiz);
    });
  });
  describe('deleteQuiz', () => {
    it('should delete a quiz', async () => {
      const companyId = 1;
      const quizId = 2;

      jest.spyOn(quizController['quizService'], 'deleteQuiz').mockResolvedValue(undefined);
      const result = await quizController.deleteQuiz(companyId, quizId);

      expect(quizController['quizService'].deleteQuiz).toHaveBeenCalledWith(companyId, quizId);
      expect(result).toBeUndefined();
    });
  });
  describe('submitQuizResult', () => {
    it('should submit quiz result', async () => {
      const user: User = { id: 1 } as User;
      const quizId = '2';
      const userAnswers = ['option1', 'option2', 'option3'];

      jest.spyOn(quizController['quizService'], 'submitQuizResult').mockResolvedValue({} as QuizResult);
      const result = await quizController.submitQuizResult(user, quizId, userAnswers);

      expect(quizController['quizService'].submitQuizResult).toHaveBeenCalledWith(user.id, +quizId, userAnswers);
      expect(result).toEqual({} as QuizResult);
    });
  });
  describe('getCompanyQuizzes', () => {
    it('should get company quizzes', async () => {
      const companyId = 1;
      const page = 1;
      const limit = 10;
      const paginatedData: PaginatedData<Quiz> = {
        data: [{ id: 1, title: 'Quiz 1' } as Quiz],
        page,
        limit,
        total: 1,
      };

      jest.spyOn(quizController['quizService'], 'getCompanyQuizzes').mockResolvedValue(paginatedData);
      const result = await quizController.getCompanyQuizzes(companyId, page, limit);

      expect(quizController['quizService'].getCompanyQuizzes).toHaveBeenCalledWith(companyId, page, limit);
      expect(result).toEqual(paginatedData);
    });
  });
});
