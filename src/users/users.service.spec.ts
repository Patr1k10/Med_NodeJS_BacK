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
import { mockRepository } from '../common/const/mock.repository';
import { mockExportService } from '../common/const/mock.export.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let exportService: ExportService;



  const createUserDto: UsersCreateDto = {
    username: 'mockUsername',
    email: 'mock@example.com',
    firstName: 'Mock',
    lastName: 'User',
    password: 'mockPassword',
  };

  const mockUserId = 1;


  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
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

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    exportService = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepository, 'create').mockReturnValue(createUserDto as User);

      const result = await usersService.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: createUserDto.username } });
      expect(userRepository.save).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw a ConflictException if username already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      await expect(usersService.createUser(createUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: createUserDto.username } });
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const updateUserDto: UsersUpdateDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...(mockUser as User), ...updateUserDto });

      const result = await usersService.updateUser(mockUserId, updateUserDto);

      expect(result).toEqual({ ...mockUser, ...updateUserDto });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(userRepository.save).toHaveBeenCalledWith({ ...mockUser, ...updateUserDto });
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateUserDto: UsersUpdateDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(usersService.updateUser(mockUserId, updateUserDto)).rejects.toThrowError(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user', async () => {
      jest.spyOn(userRepository, 'softDelete').mockResolvedValue({ affected: 1 } as any);

      await expect(usersService.softDeleteUser(mockUserId)).resolves.not.toThrow();
      expect(userRepository.softDelete).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundException if user not found for soft deletion', async () => {
      jest.spyOn(userRepository, 'softDelete').mockResolvedValue({ affected: 0 } as any);

      await expect(usersService.softDeleteUser(mockUserId)).rejects.toThrowError(NotFoundException);
      expect(userRepository.softDelete).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await usersService.getUserById(mockUserId);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should throw NotFoundException if user not found by ID', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(usersService.getUserById(mockUserId)).rejects.toThrowError(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
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
