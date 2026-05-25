import { api } from './api';

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export interface FamilyInfo {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  members: FamilyMember[];
}

export interface FamilyBudget {
  totalSpent: number;
  memberSpending: { userId: string; userName: string; totalSpent: number; transactionCount: number }[];
  startOfMonth: string;
}

export const familyService = {
  async create(name: string): Promise<FamilyInfo> {
    const { data } = await api.post('/family', { name });
    return data;
  },

  async join(inviteCode: string): Promise<FamilyMember> {
    const { data } = await api.post('/family/join', { inviteCode });
    return data;
  },

  async getMyFamily(): Promise<FamilyInfo | null> {
    try {
      const { data } = await api.get('/family');
      return data;
    } catch {
      return null;
    }
  },

  async getMembers(): Promise<FamilyMember[]> {
    const { data } = await api.get('/family/members');
    return data;
  },

  async getBudget(): Promise<FamilyBudget> {
    const { data } = await api.get('/family/budget');
    return data;
  },

  async leave(): Promise<void> {
    await api.delete('/family/leave');
  },
};