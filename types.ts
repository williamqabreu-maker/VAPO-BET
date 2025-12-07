

export enum BetResult {
  PENDING = 'PENDING',
  WIN = 'WIN',
  LOSS = 'LOSS',
  VOID = 'VOID'
}

export interface Bet {
  id: string;
  date: string;
  sport: string;
  market: string;
  selection: string;
  odds: number;
  stakeUnits: number;
  result: BetResult;
  profitUnits?: number; // Calculated field
  analysis?: string; // Optional manual notes
  sentToGroup?: boolean; // New field for signal tracking
  tipType?: 'pro' | 'free'; // New field for distribution type
  link?: string; // URL to the bet
  confidence?: number; // 1 to 10 scale
}

export interface BankrollStats {
  totalBets: number;
  winRate: number;
  roi: number;
  totalProfitUnits: number;
  currentStreak: number;
}

export interface BankrollSettings {
  startBankroll: number; // Value in currency (e.g., BRL)
  unitDivisor: number; // How many units to divide the bankroll (default 30)
  profitGoal: number; // Target profit in units
}

export interface AIAnalysisResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

export interface DreamItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  dateAdded: string;
}

export interface PostComment {
  id: string;
  username: string;
  avatarUrl?: string;
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  username: string;
  userAvatar?: string; // Optional avatar URL
  betSelection: string;
  betMarket: string;
  odds: number;
  profitUnits: number;
  comment: string;
  likes: number;
  timestamp: string;
  isUserPost: boolean; // To highlight user's own posts
  replies?: PostComment[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  role?: 'admin' | 'user';
}

export interface UserProfile {
  username: string;
  avatarUrl?: string;
}

// SAAS & USER MANAGEMENT TYPES
export type UserPlan = 'free' | 'pro';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'user'; 
  joinedAt: string;
  // SaaS Fields
  plan: UserPlan;
  status: UserStatus;
  subscriptionEnds?: string; // ISO Date string
  lastLogin?: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  planPurchased: UserPlan;
  status: 'approved' | 'pending' | 'rejected';
  method: 'pix' | 'credit_card';
  date: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number; // Real MRR from transactions
  proCount: number;
  churnRate: number;
}

export interface Banner {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  linkUrl?: string;
  active: boolean;
  createdAt: string;
}