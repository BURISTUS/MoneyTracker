// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  hourlyRate: number | null;
  monthlyHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  hourlyRate?: number;
  monthlyHours?: number;
}

// Account Types
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isDefault: boolean;
  includeInTotal: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
  DEBT = 'DEBT',
}

// Category Types
export interface Category {
  id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  isBaseNeed: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  account?: Account;
  category?: Category;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  byCategory: Array<{ categoryId: string; categoryName: string; amount: number }>;
}

// Budget Types
export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  spent?: number;
  remaining?: number;
  progress?: number;
  percentUsed?: number;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
}

export enum BudgetPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

// Goal Types
export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

// Gamification Types
export interface UserGamification {
  id: string;
  userId: string;
  xp: number;
  level: number;
  savedAmount: number;
  status: GamificationStatus;
  createdAt: string;
  updatedAt: string;
  hourlyRate?: number; // Stored in kopecks, for life cost calculation
}

export enum GamificationStatus {
  CONSUMER_DRONE = 'CONSUMER_DRONE',
  AWAKENED = 'AWAKENED',
  ASCETIC = 'ASCETIC',
  STRATEGIST = 'STRATEGIST',
  CAPITALIST = 'CAPITALIST',
  FINANCIAL_ARCHITECT = 'FINANCIAL_ARCHITECT',
}

export const GAMIFICATION_STATUS_LABELS: Record<GamificationStatus, string> = {
  [GamificationStatus.CONSUMER_DRONE]: 'Потребитель',
  [GamificationStatus.AWAKENED]: 'Просыпающийся',
  [GamificationStatus.ASCETIC]: 'Аскет',
  [GamificationStatus.STRATEGIST]: 'Стратег',
  [GamificationStatus.CAPITALIST]: 'Капиталист',
  [GamificationStatus.FINANCIAL_ARCHITECT]: 'Архитектор',
};

// Achievement Types
export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string | null;
  xpReward: number;
  conditionType: AchievementCondition;
  conditionValue: Record<string, unknown>;
  tier: AchievementTier;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  achievement?: Achievement;
}

export enum AchievementCondition {
  NO_SPEND_CATEGORY_DAYS = 'NO_SPEND_CATEGORY_DAYS',
  WISHLIST_REJECTED = 'WISHLIST_REJECTED',
  BUDGET_UNDER_LIMIT = 'BUDGET_UNDER_LIMIT',
  STREAK_DAYS = 'STREAK_DAYS',
  TOTAL_SAVED_AMOUNT = 'TOTAL_SAVED_AMOUNT',
}

export enum AchievementTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  userId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  category: string | null;
  status: WishlistStatus;
  cooldownDays: number;
  createdAt: string;
  cooldownEnds: string;
  decidedAt: string | null;
  purchasedAt: string | null;
}

export enum WishlistStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  REJECTED = 'REJECTED',
  PURCHASED = 'PURCHASED',
  EXPIRED = 'EXPIRED',
}

// Life Cost Types
export interface HoursCalculation {
  rubles: number;
  hours: number;
  workingDays: number;
  message: string;
}

// Challenge Types
export interface Challenge {
  id: string;
  code: string;
  name: string;
  description: string;
  type: ChallengeType;
  config: Record<string, unknown>;
  xpReward: number;
  iconUrl: string | null;
  isActive: boolean;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  progress: Record<string, unknown>;
  completedAt: string | null;
  isWinner: boolean | null;
  challenge?: Challenge;
}

export enum ChallengeType {
  PERSONAL = 'PERSONAL',
  FAMILY = 'FAMILY',
  SOCIAL = 'SOCIAL',
}

export enum ChallengeStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// Family Types
export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyRole;
  joinedAt: string;
  user?: User;
}

export enum FamilyRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// Financial Forecast Types
export interface Deposit {
  id: string;
  userId: string;
  name: string;
  type: DepositType;
  principal: number;
  currentAmount: number;
  annualRate: number;
  compounding: CompoundingType;
  termMonths: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  autoRenew: boolean;
}

export enum DepositType {
  SAVINGS_ACCOUNT = 'SAVINGS_ACCOUNT',
  TERM_DEPOSIT = 'TERM_DEPOSIT',
  INVESTMENT = 'INVESTMENT',
  CRYPTO = 'CRYPTO',
  STOCKS = 'STOCKS',
  BONDS = 'BONDS',
}

export enum CompoundingType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  NONE = 'NONE',
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  type: LoanType;
  principal: number;
  currentBalance: number;
  annualRate: number;
  termMonths: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  isPaidOff: boolean;
}

export enum LoanType {
  MORTGAGE = 'MORTGAGE',
  CONSUMER = 'CONSUMER',
  AUTO = 'AUTO',
  STUDENT = 'STUDENT',
  CREDIT_CARD = 'CREDIT_CARD',
  MICROLOAN = 'MICROLOAN',
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlySave: number;
  startDate: string;
  targetDate: string;
  priority: number;
  isCompleted: boolean;
}

export interface ForecastScenario {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySave: number;
  deposits: Array<{ depositId: string; monthlyContribution: number }>;
  loans: Array<{ loanId: string; extraPayment: number }>;
  inflationRate: number;
  investmentReturnRate: number;
  forecastYears: number;
}

export interface QuickSummary {
  current: {
    totalSavings: number;
    totalDebt: number;
    netWorth: number;
    monthlyDebtPayments: number;
  };
  oneYearProjection: {
    totalSavings: number;
    totalDebt: number;
    netWorth: number;
    savingsGrowth: number;
    debtReduction: number;
  };
  milestones: Array<{
    name: string;
    achieved: boolean;
    message?: string;
    currentMonths?: number;
    targetMonths?: number;
    current?: number;
    target?: number;
    progress?: number;
  }>;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  sentAt: string;
}

export enum NotificationType {
  WISHLIST_READY = 'WISHLIST_READY',
  BUDGET_ALERT = 'BUDGET_ALERT',
  CHALLENGE_INVITE = 'CHALLENGE_INVITE',
  LEVEL_UP = 'LEVEL_UP',
  ACHIEVEMENT_EARNED = 'ACHIEVEMENT_EARNED',
  STREAK_WARNING = 'STREAK_WARNING',
}
