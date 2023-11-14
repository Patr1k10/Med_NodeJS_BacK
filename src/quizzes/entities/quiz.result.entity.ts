import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Quiz } from './quiz.entity';

@Entity()
export class QuizResult {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.quizResults)
  user: User;

  @ManyToOne(() => Quiz, (quiz) => quiz.quizResults)
  quiz: Quiz;

  @Column('simple-array')
  userAnswers: string[];

  @Column({ default: 0 })
  totalQuestionsAnswered: number;

  @Column({ default: 0 })
  totalCorrectAnswers: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  completionTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;
}
