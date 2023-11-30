import { UserRole } from '../../types/enums/user.role';
import { User } from '../../users/entities/user.entity';

export const mockUser = {
  id: 1,
  username: 'mockUsername',
  email: 'mock@example.com',
  firstName: 'Mock',
  lastName: 'User',
  password: 'mockPassword',
  role: UserRole.USER,
  companies: [],
  invitedCompanies: [],
  requestedCompanies: [],
  quizResults: [
    { totalQuestionsAnswered: 10, totalCorrectAnswers: 8, quiz: { company: { id: 2 } } },
    { totalQuestionsAnswered: 5, totalCorrectAnswers: 4, quiz: { company: { id: 3 } } },
  ],
  notifications: [],
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};
