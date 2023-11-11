import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Quizzes } from './quizzes.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  question: string;

  @Column('simple-array')
  answerOptions: string[];

  @Column('simple-array')
  correctAnswers: string[];

  @ManyToOne(() => Quizzes, (quizzes) => quizzes.questions)
  quizzes: Quizzes;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;
}
