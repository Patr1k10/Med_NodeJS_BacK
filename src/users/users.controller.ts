import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {PaginationService} from "../common/pagination.service";
import {PaginatedData} from "../types/interface/paginated.interface";
import {User} from "../entities/user.entity";
import {Repository} from "typeorm";
import {UsersService} from "./users.service";
import {UsersCreateDto} from "./dto/users.create.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {UsersUpdateDto} from "./dto/users.update.dto";

@Controller('users')
export class UsersController {
  constructor(private readonly paginationService: PaginationService,
              @InjectRepository(User)
              private readonly userRepository: Repository<User>,
              private readonly usersService: UsersService
  ) {}

  @Post()
  async signUp(@Body() userDto: UsersCreateDto): Promise<UsersCreateDto> {
    return this.usersService.createUser(userDto);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UsersUpdateDto,
  ): Promise<UsersUpdateDto> {
    return this.usersService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  async softDeleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.softDeleteUser(Number(id));
  }

  @Get(':id')
  async getUserById(@Param() params?: User): Promise<User> {
    return this.usersService.getUserById(params.id);
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
