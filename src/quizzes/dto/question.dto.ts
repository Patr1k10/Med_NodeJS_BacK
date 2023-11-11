import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class QuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsArray()
  answerOptions: string[];

  @IsNotEmpty()
  @IsArray()
  correctAnswers: string[];
}
