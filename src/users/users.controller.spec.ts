import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersCreateDto } from './dto/users.create.dto';
import { UsersUpdateDto } from './dto/users.update.dto';
import { FileType } from '../types/enums/file.type';
import { User } from './entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockUser } from '../common/const/mock.user';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { mockRepository } from '../common/const/mock.repository';
import { ExportService } from '../redis/export.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockExportService } from '../common/const/mock.export.service';
import { Repository } from 'typeorm';
import { PaginatedData } from '../types/interface';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        ExportService,
        {
          provide: CACHE_MANAGER,
          useValue: mockExportService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: UsersCreateDto = {
        username: 'mockUsername',
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User',
        password: 'mockPassword',
      };

      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser as User);

      const result = await usersController.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const userId = '1';
      const updateUserDto: UsersUpdateDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      };

      jest.spyOn(usersService, 'updateUser').mockResolvedValue({ ...(mockUser as User), ...updateUserDto });

      const result = await usersController.updateUser(userId, updateUserDto);

      expect(result).toEqual({ ...(mockUser as User), ...updateUserDto });
      expect(usersService.updateUser).toHaveBeenCalledWith(+userId, updateUserDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '1';
      const updateUserDto: UsersUpdateDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      };

      jest.spyOn(usersService, 'updateUser').mockRejectedValue(new NotFoundException());

      await expect(usersController.updateUser(userId, updateUserDto)).rejects.toThrowError(NotFoundException);
      expect(usersService.updateUser).toHaveBeenCalledWith(+userId, updateUserDto);
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user', async () => {
      const userId = '1';

      jest.spyOn(usersService, 'softDeleteUser').mockResolvedValue(undefined);

      await expect(usersController.softDeleteUser(userId)).resolves.not.toThrow();
      expect(usersService.softDeleteUser).toHaveBeenCalledWith(+userId);
    });

    it('should throw NotFoundException if user not found for soft deletion', async () => {
      const userId = '1';

      jest.spyOn(usersService, 'softDeleteUser').mockRejectedValue(new NotFoundException());

      await expect(usersController.softDeleteUser(userId)).rejects.toThrowError(NotFoundException);
      expect(usersService.softDeleteUser).toHaveBeenCalledWith(+userId);
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      const userId = 1;

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUser as User);

      const result = await usersController.getUserById({ id: userId } as User);

      expect(result).toEqual(mockUser);
      expect(usersService.getUserById).toHaveBeenCalledWith(+userId);
    });

    it('should throw NotFoundException if user not found by ID', async () => {
      const userId = 1;

      jest.spyOn(usersService, 'getUserById').mockRejectedValue(new NotFoundException());

      await expect(usersController.getUserById({ id: userId } as User)).rejects.toThrowError(NotFoundException);
      expect(usersService.getUserById).toHaveBeenCalledWith(+userId);
    });
  });

  describe('exportUserQuizResults', () => {
    it('should export user quiz results to CSV', async () => {
      const userId = 1;
      const fileType = FileType.CSV;
      const response: Response = {} as Response;

      jest.spyOn(usersService, 'exportUserQuizResults').mockResolvedValue(undefined);

      await expect(
        usersController.exportUserQuizResults({ id: userId } as User, fileType, response),
      ).resolves.not.toThrow();
      expect(usersService.exportUserQuizResults).toHaveBeenCalledWith(+userId, fileType, response);
    });
  });
  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const mockUsers: User[] = [
        { id: 1, username: 'user1', email: 'user1@example.com' } as User,
        { id: 2, username: 'user2', email: 'user2@example.com' } as User,
      ];

      const expectedPaginatedData: PaginatedData<User> = {
        data: mockUsers,
        page: 1,
        limit: 10,
        total: 2,
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue(expectedPaginatedData);

      const result = await usersController.findAll();

      expect(result).toEqual(expectedPaginatedData);
      expect(usersService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should return a paginated list of users with custom page and limit', async () => {
      const mockUsers: User[] = [
        { id: 1, username: 'user1', email: 'user1@example.com' } as User,
        { id: 2, username: 'user2', email: 'user2@example.com' } as User,
      ];

      const expectedPaginatedData: PaginatedData<User> = {
        data: mockUsers,
        total: 2,
        page: 2,
        limit: 5,
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue(expectedPaginatedData);

      const result = await usersController.findAll(2, 5);

      expect(result).toEqual(expectedPaginatedData);
      expect(usersService.findAll).toHaveBeenCalledWith(2, 5);
    });
    describe('getUserAverageScore', () => {
      it('should return the average score for a user', async () => {
        const userId = 1;
        const expectedAverageScore = 4.5;

        jest.spyOn(usersService, 'calculateUserAverageRating').mockResolvedValue(expectedAverageScore);

        const result = await usersController.getUserAverageScore(userId);

        expect(result).toEqual(expectedAverageScore);
        expect(usersService.calculateUserAverageRating).toHaveBeenCalledWith(userId);
      });
    });
  });
  describe('getUserCompanyAverageScore', () => {
    it('should return the average score for a user in a specific company', async () => {
      const userId = 1;
      const companyId = 123;
      const expectedAverageScore = 4.5;

      jest.spyOn(usersService, 'calculateUserAverageRating').mockResolvedValue(expectedAverageScore);

      const result = await usersController.getUserCompanyAverageScore(userId, companyId);

      expect(result).toEqual(expectedAverageScore);
      expect(usersService.calculateUserAverageRating).toHaveBeenCalledWith(userId, companyId);
    });
  });
});
