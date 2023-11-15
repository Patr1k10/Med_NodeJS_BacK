import { IsArray, IsString } from 'class-validator';

export class QuestionUpdateDto {
  @IsString()
  question?: string;

  @IsArray()
  answerOptions?: string[];

  @IsArray()
  correctAnswers?: string[];
}
