import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entity/company.entity';
import { User } from '../users/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileType } from '../types/enums/file.type';
import { ExportService } from '../redis/export.service';
import { CompanyCreateDto } from './dto /company.create.dto';
import { CompanyUpdateDto } from './dto /company.update.dto';
import { mockUser } from '../common/const/mock.user';
import { Invitation } from '../invitation/entity/invitation.entity';
import { mockCompany } from '../common/const/mock.company';
import { mockRepository } from '../common/const/mock.repository';
import { mockExportService } from '../common/const/mock.export.service';

describe('CompanyService', () => {
  let companyService: CompanyService;
  let companyRepository: Repository<Company>;
  let userRepository: Repository<User>;
  let exportService: ExportService;

  const mockCompanyCreateDto: CompanyCreateDto = {
    name: 'Mock Company',
    description: 'Mock Company Description',
  };

  const mockCompanyUpdateDto: CompanyUpdateDto = {
    name: 'Updated Company Name',
    description: 'Updated Description',
  };

  const mockResponse: any = {};
  const mockCompanyId = 1;
  const mockUserId = 2;
  const mockQuizId = 3;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        ExportService,
        {
          provide: ExportService,
          useValue: mockExportService,
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
          provide: getRepositoryToken(Invitation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    companyService = module.get<CompanyService>(CompanyService);
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    exportService = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(companyService).toBeDefined();
  });

  describe('createCompany', () => {
    it('should create a company', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(companyRepository, 'create').mockReturnValue(mockCompany as Company);
      jest.spyOn(companyRepository, 'save').mockResolvedValue(mockCompany as Company);

      const result = await companyService.createCompany(mockUser.id, mockCompanyCreateDto);
      expect(result).toEqual(mockCompany);
    });
  });

  describe('getCompanyById', () => {
    it('should return the company with the specified ID', async () => {
      const companyId = 1;
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(mockCompany as Company);

      const result = await companyService.getCompanyById(companyId);

      expect(result).toEqual(mockCompany);
      expect(companyRepository.findOne).toHaveBeenCalledWith({ where: { id: companyId, isVisible: true } });
    });

    it('should throw NotFoundException if the company with the specified ID is not found', async () => {
      const companyId = 2;
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(null);

      await expect(async () => await companyService.getCompanyById(companyId)).rejects.toThrowError(NotFoundException);

      expect(companyRepository.findOne).toHaveBeenCalledWith({ where: { id: companyId, isVisible: true } });
    });
  });

  describe('updateCompany', () => {
    it('should update a company successfully', async () => {
      const mockCompanyId = 1;

      jest.spyOn(companyService, 'getCompanyById').mockResolvedValue(mockCompany as Company);
      jest.spyOn(companyRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(companyService, 'getCompanyById').mockResolvedValue({
        ...(mockCompany as Company),
        ...mockCompanyUpdateDto,
      });

      const result = await companyService.updateCompany(mockCompanyId, mockCompanyUpdateDto);

      expect(companyService.getCompanyById).toHaveBeenCalledWith(mockCompanyId);
      expect(companyRepository.update).toHaveBeenCalledWith(mockCompanyId, mockCompanyUpdateDto);
      expect(companyService.getCompanyById).toHaveBeenCalledWith(mockCompanyId);

      expect(result).toEqual({
        ...(mockCompany as Company),
        ...mockCompanyUpdateDto,
      });
    });

    it('should throw NotFoundException if company not found', async () => {
      const mockCompanyId = 1;
      const mockCompanyDto: CompanyUpdateDto = {
        name: 'Updated Company Name',
        description: 'Updated Description',
      };

      jest.spyOn(companyService, 'getCompanyById').mockResolvedValue(undefined);
      await expect(companyService.updateCompany(mockCompanyId, mockCompanyDto)).rejects.toThrowError(NotFoundException);
      expect(companyService.getCompanyById).toHaveBeenCalledWith(mockCompanyId);
    });
  });
  describe('deleteCompany', () => {
    it('should delete a company successfully', async () => {
      const mockCompanyId = 1;
      jest.spyOn(companyRepository, 'softDelete').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(mockCompany as Company);

      await expect(companyService.deleteCompany(mockCompanyId)).resolves.not.toThrow();
      expect(companyRepository.softDelete).toHaveBeenCalledWith(mockCompanyId);
    });

    it('should throw NotFoundException if company not found', async () => {
      const mockCompanyId = 1;
      jest.spyOn(companyRepository, 'softDelete').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(null);

      await expect(companyService.deleteCompany(mockCompanyId)).rejects.toThrowError(NotFoundException);
      expect(companyRepository.softDelete).toHaveBeenCalledWith(mockCompanyId);
    });
    describe('getCompanyAdmins', () => {
      it('should get company admins successfully', async () => {
        jest.spyOn(companyService, 'getCompanyById').mockResolvedValue(mockCompany as Company);

        const result = await companyService.getCompanyAdmins(1);

        expect(result).toEqual(mockCompany.admins);
        expect(companyService.getCompanyById).toHaveBeenCalledWith(1);
      });

      it('should throw NotFoundException if company not found', async () => {
        jest.spyOn(companyService, 'getCompanyById').mockResolvedValue(undefined);

        await expect(async () => await companyService.getCompanyAdmins(1)).rejects.toThrowError(NotFoundException);

        expect(companyService.getCompanyById).toHaveBeenCalledWith(1);
      });
    });
    describe('exportCompanyUserData', () => {
      it('should export user data successfully in CSV format', async () => {
        await companyService.exportCompanyUserData(mockCompanyId, mockUserId, FileType.CSV, mockResponse);

        expect(exportService.exportToCsv).toHaveBeenCalledWith(mockResponse, mockCompanyId, mockUserId);
      });

      it('should export user data successfully in JSON format', async () => {
        await companyService.exportCompanyUserData(mockCompanyId, mockUserId, FileType.JSON, mockResponse);

        expect(exportService.exportToJson).toHaveBeenCalledWith(mockResponse, mockCompanyId, mockUserId);
      });

      it('should throw BadRequestException for invalid company or user ID', async () => {
        await expect(
          async () => await companyService.exportCompanyUserData(null, null, FileType.CSV, mockResponse),
        ).rejects.toThrowError(BadRequestException);
      });
    });

    describe('exportCompanyAllData', () => {
      it('should export all company data successfully in CSV format', async () => {
        await companyService.exportCompanyAllData(mockCompanyId, FileType.CSV, mockResponse);

        expect(exportService.exportToCsv).toHaveBeenCalledWith(mockResponse, mockCompanyId);
      });

      it('should export all company data successfully in JSON format', async () => {
        await companyService.exportCompanyAllData(mockCompanyId, FileType.JSON, mockResponse);

        expect(exportService.exportToJson).toHaveBeenCalledWith(mockResponse, mockCompanyId);
      });

      it('should throw BadRequestException for invalid company ID', async () => {
        await expect(
          async () => await companyService.exportCompanyAllData(null, FileType.CSV, mockResponse),
        ).rejects.toThrowError(BadRequestException);
      });
    });

    describe('exportCompanyQuizData', () => {
      it('should export quiz data successfully in CSV format', async () => {
        await companyService.exportCompanyQuizData(mockQuizId, FileType.CSV, mockResponse);

        expect(exportService.exportToCsv).toHaveBeenCalledWith(mockResponse, undefined, mockQuizId);
      });

      it('should export quiz data successfully in JSON format', async () => {
        await companyService.exportCompanyQuizData(mockQuizId, FileType.JSON, mockResponse);

        expect(exportService.exportToJson).toHaveBeenCalledWith(mockResponse, undefined, mockQuizId);
      });

      it('should throw BadRequestException for invalid quiz ID', async () => {
        await expect(
          async () => await companyService.exportCompanyQuizData(null, FileType.CSV, mockResponse),
        ).rejects.toThrowError(BadRequestException);
      });
    });
  });
});
