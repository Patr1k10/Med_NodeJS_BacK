import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizService } from './quiz.service';
import { CompanyGuard } from '../auth/guard/company.guard';
import { Quiz } from './entities/quiz.entity';
import { QuizCreateDto } from './dto/quiz.create.dto';
import { QuizUpdateDto } from './dto/quiz.update.dto';
import { PaginatedData } from '../types/interface';

@Controller('quizzes')
@UseGuards(AuthGuard('jwt'), CompanyGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post(':companyId')
  async createQuiz(@Param('companyId') companyId: number, @Body() quizDto: QuizCreateDto): Promise<Quiz> {
    return this.quizService.createQuiz(companyId, quizDto);
  }

  @Patch(':companyId/:quizId')
  async editQuiz(
    @Param('companyId') companyId: number,
    @Param('quizId') quizId: number,
    @Body() quizDto: QuizUpdateDto,
  ): Promise<Quiz> {
    return this.quizService.editQuiz(companyId, quizId, quizDto);
  }

  @Delete(':companyId/:quizId')
  async deleteQuiz(@Param('companyId') companyId: number, @Param('quizId') quizId: number): Promise<void> {
    return this.quizService.deleteQuiz(companyId, quizId);
  }

  @Get(':companyId')
  async getCompanyQuizzes(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<PaginatedData<Quiz>> {
    return this.quizService.getCompanyQuizzes(companyId, page, limit);
  }
}
