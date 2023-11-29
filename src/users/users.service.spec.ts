import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ExportService } from '../redis/export.service';
import { UsersCreateDto } from './dto/users.create.dto';
import { UsersUpdateDto } from './dto/users.update.dto';
import { FileType } from '../types/enums/file.type';
import { mockUser } from '../common/const/mock.user';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const createUserDto: UsersCreateDto = {
    username: 'mockUsername',
    email: 'mock@example.com',
    firstName: 'Mock',
    lastName: 'User',
    password: 'mockPassword',
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        ExportService,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserRepository.create.mockReturnValue(createUserDto);
      const result = await usersService.createUser(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw a ConflictException if username already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(usersService.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const userId = 1;
      const updateUserDto: UsersUpdateDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      };
      const existingUser = new User();
      existingUser.id = userId;
      existingUser.firstName = 'OldFirstName';
      existingUser.lastName = 'OldLastName';
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({ ...existingUser, ...updateUserDto });
      const result = await usersService.updateUser(userId, updateUserDto);
      expect(result).toEqual({ ...existingUser, ...updateUserDto });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...existingUser, ...updateUserDto });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 1;
      const updateUserDto: UsersUpdateDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      };
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(usersService.updateUser(userId, updateUserDto)).rejects.toThrowError(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user', async () => {
      const userId = 1;
      mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });
      await expect(usersService.softDeleteUser(userId)).resolves.not.toThrow();
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found for soft deletion', async () => {
      const userId = 1;
      mockUserRepository.softDelete.mockResolvedValue({ affected: 0 });
      await expect(usersService.softDeleteUser(userId)).rejects.toThrowError(NotFoundException);
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      const userId = 1;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await usersService.getUserById(userId);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException if user not found by ID', async () => {
      const userId = 1;
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(usersService.getUserById(userId)).rejects.toThrowError(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('calculateUserAverageRating', () => {
    it('should calculate the average rating for a user', async () => {
      const userId = 1;
      const companyId = 2;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await usersService.calculateUserAverageRating(userId, companyId);
      expect(result).toEqual(0.8); // (8 + 4) / (10 + 5) = 12 / 15 = 0.8
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['quizResults'] });
    });

    it('should throw NotFoundException if user not found for rating calculation', async () => {
      const userId = 1;
      const companyId = 2;
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(usersService.calculateUserAverageRating(userId, companyId)).rejects.toThrowError(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['quizResults'] });
    });
  });

  describe('exportUserQuizResults', () => {
    it('should export user quiz results to CSV', async () => {
      const userId = 1;
      const fileType = FileType.CSV;
      const response: Response = {} as Response;
      const exportMethodMock = jest.spyOn(ExportService.prototype, 'exportToCsv');
      exportMethodMock.mockImplementation(jest.fn());
      await usersService.exportUserQuizResults(userId, fileType, response);
      expect(exportMethodMock).toHaveBeenCalledWith(response, undefined, undefined, userId);
    });

    it('should export user quiz results to JSON', async () => {
      const userId = 1;
      const fileType = FileType.JSON;
      const response: Response = {} as Response;
      const exportMethodMock = jest.spyOn(ExportService.prototype, 'exportToJson');
      exportMethodMock.mockImplementation(jest.fn());
      await usersService.exportUserQuizResults(userId, fileType, response);
      expect(exportMethodMock).toHaveBeenCalledWith(response, undefined, undefined, userId);
    });

    it('should throw BadRequestException for invalid user ID', async () => {
      const userId = null; // Invalid user ID
      const fileType = FileType.JSON;
      const response: Response = {} as Response;
      await expect(usersService.exportUserQuizResults(userId, fileType, response)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });
});
