import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionCreateDto } from './question.create.dto';

export class QuizUpdateDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsNumber()
  frequencyInDays?: number;

  @Type(() => QuestionCreateDto)
  questions?: QuestionCreateDto[];
}
