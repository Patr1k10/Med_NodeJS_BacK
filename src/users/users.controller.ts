import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersCreateDto } from './dto/users.create.dto';
import { UsersUpdateDto } from './dto/users.update.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedData } from '../types/interface';
import { UserGuard } from '../auth/guard/app.guard';
import { User } from './entities/user.entity';
import { FileType } from '../types/enums/file.type';
import { GetUser } from '../decorator/getUser.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userDto: UsersCreateDto): Promise<UsersCreateDto> {
    return this.usersService.createUser(userDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), UserGuard)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UsersUpdateDto): Promise<UsersUpdateDto> {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), UserGuard)
  async softDeleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.softDeleteUser(+id);
  }

  @Get(':id')
  async getUserById(@Param() params?: User): Promise<User> {
    return this.usersService.getUserById(params.id);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10): Promise<PaginatedData<User>> {
    return this.usersService.findAll(+page, +limit);
  }

  @Get(':userId/average-score')
  async getUserAverageScore(@Param('userId') userId: number): Promise<number> {
    return await this.usersService.calculateUserAverageRating(userId);
  }

  @Get(':userId/company/:companyId/average-score')
  async getUserCompanyAverageScore(
    @Param('userId') userId: number,
    @Param('companyId') companyId: number,
  ): Promise<number> {
    return this.usersService.calculateUserAverageRating(userId, companyId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('quiz-results/export/:fileType')
  async exportUserQuizResults(
    @GetUser() user: User,
    @Param('fileType') fileType: FileType,
    @Res() response: Response,
  ): Promise<void> {
    return this.usersService.exportUserQuizResults(user.id, fileType, response);
  }
}
