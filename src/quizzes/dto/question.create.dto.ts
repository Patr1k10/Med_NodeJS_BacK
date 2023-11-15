import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class QuestionCreateDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsArray()
  @ArrayMinSize(2, { each: true })
  answerOptions: string[];

  @IsArray()
  @ArrayMinSize(2, { each: true })
  correctAnswers: string[];
}
