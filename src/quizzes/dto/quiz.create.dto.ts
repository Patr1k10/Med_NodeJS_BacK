import { IsNotEmpty, IsNumber, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionCreateDto } from './question.create.dto';

export class QuizCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  notificationsText: string;

  @IsNumber()
  @IsOptional()
  frequencyInDays?: number;

  @ArrayMinSize(2, { each: true })
  @Type(() => QuestionCreateDto)
  questions: QuestionCreateDto[];
}
