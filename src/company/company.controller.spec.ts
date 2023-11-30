import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Repository } from 'typeorm';
import { Company } from './entity/company.entity';
import { User } from '../users/entities/user.entity';
import { ExportService } from '../redis/export.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockExportService } from '../common/const/mock.export.service';
import { mockRepository } from '../common/const/mock.repository';
import { Invitation } from '../invitation/entity/invitation.entity';
import { CompanyCreateDto } from './dto /company.create.dto';
import { PaginatedData } from '../types/interface';
import { FileType } from '../types/enums/file.type';

describe('CompanyController', () => {
  let companyController: CompanyController;
  let companyService: CompanyService;
  let companyRepository: Repository<Company>;
  let userRepository: Repository<User>;
  let exportService: ExportService;

  const mockCompanyCreateDto: CompanyCreateDto = {
    name: 'Mock Company',
    description: 'Mock Company Description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
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

    companyController = module.get<CompanyController>(CompanyController);
    companyService = module.get<CompanyService>(CompanyService);
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    exportService = module.get<ExportService>(ExportService);
  });

  describe('createCompany', () => {
    it('should create a company', async () => {
      const user: User = { id: 1 } as User;

      jest.spyOn(companyService, 'createCompany').mockResolvedValue({} as Company);

      const result = await companyController.createCompany(user, mockCompanyCreateDto);

      expect(result).toEqual({} as Company);
      expect(companyService.createCompany).toHaveBeenCalledWith(user.id, mockCompanyCreateDto);
    });
  });
  describe('updateCompany', () => {
    it('should update a company', async () => {
      const companyId = '1';

      jest.spyOn(companyService, 'updateCompany').mockResolvedValue({} as Company);

      const result = await companyController.updateCompany(companyId, mockCompanyCreateDto);

      expect(result).toEqual({} as Company);
      expect(companyService.updateCompany).toHaveBeenCalledWith(+companyId, mockCompanyCreateDto);
    });
  });

  describe('getCompanyById', () => {
    it('should get a company by ID', async () => {
      const companyId = '1';

      jest.spyOn(companyService, 'getCompanyById').mockResolvedValue({} as Company);

      const result = await companyController.getCompanyById(companyId);

      expect(result).toEqual({} as Company);
      expect(companyService.getCompanyById).toHaveBeenCalledWith(+companyId);
    });
  });
  describe('getCompanyMembers', () => {
    it('should get paginated company members', async () => {
      const companyId = '1';

      jest.spyOn(companyService, 'getCompanyMembers').mockResolvedValue({ data: [], total: 0 } as PaginatedData<User>);

      const result = await companyController.getCompanyMembers(companyId);

      expect(result).toEqual({ data: [], total: 0 } as PaginatedData<User>);
      expect(companyService.getCompanyMembers).toHaveBeenCalledWith(+companyId, 1, 10);
    });
  });

  describe('getCompanyInvitations', () => {
    it('should get paginated company invitations', async () => {
      const companyId = '1';

      jest
        .spyOn(companyService, 'getCompanyInvitations')
        .mockResolvedValue({ data: [], total: 0 } as PaginatedData<Invitation>);

      const result = await companyController.getCompanyInvitations(companyId);

      expect(result).toEqual({ data: [], total: 0 } as PaginatedData<Invitation>);
      expect(companyService.getCompanyInvitations).toHaveBeenCalledWith(+companyId, 1, 10);
    });
  });
  describe('deleteCompany', () => {
    it('should delete a company', async () => {
      const companyId = '1';

      jest.spyOn(companyService, 'deleteCompany').mockResolvedValue(undefined);

      await expect(companyController.deleteCompany(companyId)).resolves.not.toThrow();
      expect(companyService.deleteCompany).toHaveBeenCalledWith(+companyId);
    });
  });

  describe('addAdminToCompany', () => {
    it('should add an admin to the company', async () => {
      const companyId = '1';
      const userId = '2';

      jest.spyOn(companyService, 'addAdminToCompany').mockResolvedValue({} as Company);

      const result = await companyController.addAdminToCompany(companyId, userId);

      expect(result).toEqual({} as Company);
      expect(companyService.addAdminToCompany).toHaveBeenCalledWith(+companyId, +userId);
    });
    describe('removeAdminFromCompany', () => {
      it('should remove an admin from the company', async () => {
        const companyId = '1';
        const userId = '2';

        jest.spyOn(companyService, 'removeAdminFromCompany').mockResolvedValue({} as Company);

        const result = await companyController.removeAdminFromCompany(companyId, userId);

        expect(result).toEqual({} as Company);
        expect(companyService.removeAdminFromCompany).toHaveBeenCalledWith(+companyId, +userId);
      });
    });

    describe('excludeUserFromCompany', () => {
      it('should exclude a user from the company', async () => {
        const companyId = '1';
        const userId = '2';

        jest.spyOn(companyService, 'excludeUserFromCompany').mockResolvedValue(undefined);

        await expect(companyController.excludeUserFromCompany(companyId, userId)).resolves.not.toThrow();
        expect(companyService.excludeUserFromCompany).toHaveBeenCalledWith(+userId, +companyId);
      });
    });

    describe('leaveCompany', () => {
      it('should allow a user to leave the company', async () => {
        const companyId = 1;

        jest.spyOn(companyService, 'leaveCompany').mockResolvedValue(undefined);

        await expect(companyController.leaveCompany({ id: companyId } as User, +companyId)).resolves.not.toThrow();
        expect(companyService.leaveCompany).toHaveBeenCalledWith(+companyId, +companyId);
      });
    });

    describe('getAllCompanies', () => {
      it('should get all companies', async () => {
        const page = '1';
        const limit = '10';

        jest.spyOn(companyService, 'findAll').mockResolvedValue({} as PaginatedData<Company>);

        const result = await companyController.getAllCompanies(+page, +limit);

        expect(result).toEqual({} as PaginatedData<Company>);
        expect(companyService.findAll).toHaveBeenCalledWith(+page, +limit);
      });
    });

    describe('getCompanyAdmins', () => {
      it('should get admins of the company', async () => {
        const companyId = '1';

        jest.spyOn(companyService, 'getCompanyAdmins').mockResolvedValue([] as User[]);

        const result = await companyController.getCompanyAdmins(companyId);

        expect(result).toEqual([] as User[]);
        expect(companyService.getCompanyAdmins).toHaveBeenCalledWith(+companyId);
      });
    });

    describe('exportCompanyAllData', () => {
      it('should export all company data', async () => {
        const companyId = '1';
        const fileType = FileType.CSV;
        const response: Response = {} as Response;

        jest.spyOn(companyService, 'exportCompanyAllData').mockResolvedValue(undefined);

        await expect(
          companyController.exportCompanyAllData(companyId, fileType, response as any),
        ).resolves.not.toThrow();
        expect(companyService.exportCompanyAllData).toHaveBeenCalledWith(+companyId, fileType, response);
      });
    });

    describe('exportCompanyUserData', () => {
      it('should export user data from the company', async () => {
        const companyId = '1';
        const userId = '2';
        const fileType = FileType.CSV;
        const response: Response = {} as Response;

        jest.spyOn(companyService, 'exportCompanyUserData').mockResolvedValue(undefined);

        await expect(
          companyController.exportCompanyUserData(companyId, userId, fileType, response as any),
        ).resolves.not.toThrow();
        expect(companyService.exportCompanyUserData).toHaveBeenCalledWith(+companyId, +userId, fileType, response);
      });
    });

    describe('exportCompanyQuizData', () => {
      it('should export quiz data from the company', async () => {
        const quizId = '1';
        const fileType = FileType.CSV;
        const response: Response = {} as Response;

        jest.spyOn(companyService, 'exportCompanyQuizData').mockResolvedValue(undefined);

        await expect(companyController.exportCompanyQuizData(quizId, fileType, response as any)).resolves.not.toThrow();
        expect(companyService.exportCompanyQuizData).toHaveBeenCalledWith(+quizId, fileType, response);
      });
    });
  });
});
