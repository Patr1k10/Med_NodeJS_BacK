import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Quiz } from './quiz.entity';


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

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  quizzes: Quiz;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;
}
