import React from 'react';

export interface Problem {
  icon: React.ReactNode;
  text: string;
}

export interface Pillar {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Bonus {
  title: string;
  value: number;
}

export interface BonusItem {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  downloadUrl: string;
  content?: string; // HTML content for the e-book reader
  targetAudience: 'MEMBRO' | 'REVENDA' | 'VIP' | 'ADMIN' | 'VISITANTE';
  active: boolean;
}

export interface TimelineItem {
  period: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  age: number;
  rating: number;
  text: string;
  avatar: string;
}

export interface ComparisonRow {
  feature: string;
  studio: string | boolean;
  online: string | boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  period: string;
  features: string[];
  isPopular?: boolean;
  active?: boolean;
  paymentLink?: string;
}

export interface DuvidasFrequentesItem {
  id: string;
  question: string;
  answer: string;
}

// --- LIBRARY ENTITIES ---

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  coverImage?: string;
  isMandatory?: boolean;
  dripDays?: number;
  active: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  order: number;
  coverImage?: string;
  dripDays?: number;
  active: boolean;
}

export interface Ebook {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
  description: string;
  coverImage: string;
  content: string;
  downloadUrl?: string;
  order: number;
  dripDays?: number;
  active: boolean;
}

// --- BONUS LIBRARY ---

export interface BonusCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  isMandatory?: boolean;
  dripDays?: number;
  active: boolean;
}

export interface BonusItem_2 {
  id: string;
  bonusCategoryId: string;
  title: string;
  description: string;
  coverImage: string;
  content: string;
  downloadUrl?: string;
  order: number;
  dripDays?: number;
  active: boolean;
}

// --- BLUEPRINT ENTITIES ---

export type UserRole = 'VISITANTE' | 'MEMBRO' | 'VIP' | 'REVENDA' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'blocked' | 'pending';
  password_hash?: string; // Mock
  referralCode?: string; // For resellers
  referredBy?: string; // ID of the reseller who referred this user
  walletBalance?: number; // For resellers
  pixKey?: string; // For resellers
  pixKeyType?: 'cpf' | 'email' | 'phone' | 'random';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  offerPrice?: number;
  coverImage: string;
  active: boolean;
  dripEnabled?: boolean;
  modules: Module[];
  createdAt?: string;
  paymentLink?: string;
  useCustomPix?: boolean;
  pixKey?: string;
  pixKeyType?: 'cpf' | 'email' | 'phone' | 'random';
}

export interface Module {
  id: string;
  productId?: string;
  title: string;
  order?: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  moduleId?: string;
  title: string;
  content: string; // HTML or Markdown
  order?: number;
  isLocked?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  affiliateId?: string | null;
  totalAmount: number;
  status: 'pending' | 'paid' | 'refunded' | 'rejected';
  paymentGatewayId?: string;
  proofUrl?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Affiliate {
  id: string;
  userId: string;
  commissionRate: number; // Default 0.50
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  ip: string;
  userAgent: string;
  landingPage: string;
  createdAt: string;
}

export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  releaseDate: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string; // Affiliate User ID
  amount: number;
  status: 'requested' | 'approved' | 'paid' | 'rejected'; // Mapped to blueprint
  date: string;
  pixKey: string;
}

// --- SOCIAL PROOF ORCHESTRATOR ---

export interface Bot {
  id: string;
  name: string;
  avatar: string;
  persona?: string;
  region?: string;
  isActive: boolean;
  role?: string; // Legacy support
  isOnline?: boolean; // Legacy support
}

export interface Block {
  id: string;
  botId?: string; // Optional override for multi-bot conversations
  category: 'objection' | 'proof' | 'result' | 'question' | 'urgency';
  script: string;
  delayMs: number;
  typingTimeMs: number;
  randomVariations?: string[]; // JSON string or array
  conditionType: 'scroll' | 'time' | 'exit' | 'click' | 'manual';
  conditionValue?: number | string;
}

export interface Timeline {
  id: string;
  name: string;
  productId?: string;
  isActive: boolean;
  botId: string; // Default bot
  blocks: Block[]; // Ordered blocks
  pageRoute?: string; // Legacy support
  trigger?: 'onLoad' | 'onScroll' | 'onExitIntent' | 'manual';
}

export interface Execution {
  id: string;
  timelineId: string;
  sessionId: string;
  currentBlockIndex: number;
  status: 'running' | 'finished' | 'stopped';
  startedAt: string;
}

// Legacy Transaction (kept for compatibility with existing components if needed, but Order is preferred)
export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  planName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  proofUrl?: string;
  date: string;
  resellerId?: string;
  commissionAmount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  date: string;
  type: 'commission' | 'rejection' | 'system';
}

export interface GlobalSettings {
  appName: string;
  logoUrl: string;
  primaryColor: string;
  stripeKey: string;
  pixelId: string;
  supportWhatsapp: string;
  supportEmail: string;
  termsOfUse: string;
}