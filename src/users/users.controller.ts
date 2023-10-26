import {Body, Controller, Get, Logger, Post, Query} from '@nestjs/common';
import {PaginationService} from "../common/pagination.service";
import {PaginatedData} from "../types/interface/paginated.interface";
import {User} from "../entities/user.entity";
import {Repository} from "typeorm";
import {UsersService} from "./users.service";
import {UsersCreateDto} from "./dto/users.create.dto";
import {InjectRepository} from "@nestjs/typeorm";

@Controller('users')
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name)
  constructor(private readonly paginationService: PaginationService,
              @InjectRepository(User)
              private readonly userRepository: Repository<User>,
              private readonly usersService: UsersService
  ) {
  }


  @Post()
  async createUser(@Body() userDto: UsersCreateDto): Promise<UsersCreateDto> {
    return this.usersService.createUser(userDto);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedData<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('User');
    return this.paginationService.paginate<User>(
      this.userRepository,
      queryBuilder,
      +page,
      +limit,
    );
  }
}
