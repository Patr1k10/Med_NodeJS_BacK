import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizService } from './quiz.service';
import { CompanyGuard } from '../auth/guard/company.guard';
import { Quiz } from './entities/quiz.entity';
import { QuizCreateDto } from './dto/quiz.create.dto';
import { QuizUpdateDto } from './dto/quiz.update.dto';
import { PaginatedData } from '../types/interface';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';
import { QuizResult } from './entities/quiz.result.entity';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  @Post(':companyId')
  async createQuiz(@Param('companyId') companyId: number, @Body() quizDto: QuizCreateDto): Promise<Quiz> {
    return this.quizService.createQuiz(companyId, quizDto);
  }
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  @Patch(':companyId/:quizId')
  async editQuiz(
    @Param('companyId') companyId: number,
    @Param('quizId') quizId: number,
    @Body() quizDto: QuizUpdateDto,
  ): Promise<Quiz> {
    return this.quizService.editQuiz(companyId, quizId, quizDto);
  }
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  @Delete(':companyId/:quizId')
  async deleteQuiz(@Param('companyId') companyId: number, @Param('quizId') quizId: number): Promise<void> {
    return this.quizService.deleteQuiz(companyId, quizId);
  }
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  @Get(':companyId')
  async getCompanyQuizzes(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<PaginatedData<Quiz>> {
    return this.quizService.getCompanyQuizzes(companyId, page, limit);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post(':quizId/submit-result')
  async submitQuizResult(
    @GetUser() user: User,
    @Param('quizId') quizId: string,
    @Body() userAnswers: string[],
  ): Promise<QuizResult> {
    return this.quizService.submitQuizResult(user.id, +quizId, userAnswers);
  }
}
