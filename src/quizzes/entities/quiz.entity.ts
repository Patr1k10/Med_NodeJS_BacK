import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../company/entity/company.entity';
import { Question } from './questions.entity';
import { QuizResult } from './quiz.result.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  notificationsText: string;

  @Column({ default: 1 })
  frequencyInDays: number;

  @ManyToOne(() => Company, (company) => company.quizzes)
  company: Company;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions: Question[];

  @OneToMany(() => QuizResult, (quizResult) => quizResult.quiz, { cascade: true })
  quizResults: QuizResult[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;
}
