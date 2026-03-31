import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User, Transaction, Notification, UserRole, Product, Bot, Timeline,
  BonusItem, BonusCategory, BonusItem_2, WithdrawalRequest, Order, Commission, AffiliateClick,
  PricingPlan, Category, Subcategory, Ebook
} from '../types';
import toast from 'react-hot-toast';

const API = '/api';
function getToken() { return localStorage.getItem('auth_token') || ''; }
function saveToken(t: string) { localStorage.setItem('auth_token', t); }
function clearToken() { localStorage.removeItem('auth_token'); }

async function api(method: string, path: string, body?: object) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

interface GlobalSettings {
  app_name?: string; primary_color?: string; stripe_key?: string; pixel_id?: string;
  logo_url?: string; terms_of_use?: string; support_whatsapp?: string; support_email?: string;
  hero_video_url?: string; commission_rate?: number;
  pix_key?: string; pix_key_type?: string;
  appName?: string; primaryColor?: string; stripeKey?: string; pixelId?: string;
  logoUrl?: string; termsOfUse?: string; supportWhatsapp?: string; supportEmail?: string;
  heroVideoUrl?: string; commissionRate?: number;
  pixKey?: string; pixKeyType?: string;
}

interface DataContextType {
  currentUser: User | null; users: User[]; transactions: Transaction[]; orders: Order[];
  commissions: Commission[]; affiliateClicks: AffiliateClick[]; notifications: Notification[];
  products: Product[]; plans: PricingPlan[]; bonuses: BonusItem[]; bonusCategories: BonusCategory[]; bonusItems: BonusItem_2[]; categories: Category[];
  subcategories: Subcategory[]; ebooks: Ebook[]; bots: Bot[]; timelines: Timeline[];
  withdrawals: WithdrawalRequest[]; referrer: User | null; globalSettings: GlobalSettings;
  isDevToolsEnabled: boolean; setDevToolsEnabled: (e: boolean) => void;
  isGlobalNotesEnabled: boolean; setGlobalNotesEnabled: (e: boolean) => void;
  isMemberNotificationsEnabled: boolean; setMemberNotificationsEnabled: (e: boolean) => void;
  showTeste: boolean; setShowTeste: (s: boolean) => void;
  realUser: User | null;
  viewRole: UserRole | null;
  setViewRole: (role: UserRole | null) => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void; setReferrerByCode: (code: string) => void;
  createOrder: (data: any) => Promise<void>; trackClick: (affiliateId: string, landingPage: string) => Promise<void>;
  addProduct: (p: Product) => Promise<void>; updateProduct: (id: string, p: Partial<Product>) => Promise<void>; deleteProduct: (id: string) => Promise<void>;
  addPlan: (p: PricingPlan) => Promise<void>; updatePlan: (id: string, p: Partial<PricingPlan>) => Promise<void>; deletePlan: (id: string) => Promise<void>; refreshPlans: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>; toggleUserStatus: (userId: string) => Promise<void>;
  addBot: (b: Bot) => Promise<void>; addTimeline: (t: Timeline) => Promise<void>; toggleTimeline: (id: string) => Promise<void>;
  updateGlobalSettings: (s: Partial<GlobalSettings>) => Promise<void>;
  addBonus: (b: BonusItem) => Promise<void>; updateBonus: (id: string, b: Partial<BonusItem>) => Promise<void>; deleteBonus: (id: string) => Promise<void>;
  addBonusCategory: (c: BonusCategory) => Promise<void>; updateBonusCategory: (id: string, c: Partial<BonusCategory>) => Promise<void>; deleteBonusCategory: (id: string) => Promise<void>; refreshBonusCategories: () => Promise<void>;
  addBonusItem2: (i: BonusItem_2) => Promise<void>; updateBonusItem2: (id: string, i: Partial<BonusItem_2>) => Promise<void>; deleteBonusItem2: (id: string) => Promise<void>; refreshBonusItems: () => Promise<void>;
  addCategory: (c: Category) => Promise<void>; updateCategory: (id: string, c: Partial<Category>) => Promise<void>; deleteCategory: (id: string) => Promise<void>; refreshCategories: () => Promise<void>;
  addSubcategory: (s: Subcategory) => Promise<void>; updateSubcategory: (id: string, s: Partial<Subcategory>) => Promise<void>; deleteSubcategory: (id: string) => Promise<void>;
  addEbook: (e: Ebook) => Promise<void>; updateEbook: (id: string, e: Partial<Ebook>) => Promise<void>; deleteEbook: (id: string) => Promise<void>; refreshEbooks: () => Promise<void>;
  updatePixKey: (userId: string, key: string, type: 'cpf' | 'email' | 'phone' | 'random') => Promise<void>;
  requestWithdrawal: (userId: string, amount: number) => Promise<void>;
  updateWithdrawalStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  addTransaction: (t: Transaction) => void;
  updateTransactionStatus: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => Promise<void>;
  getResellerStats: (resellerId: string) => { totalSales: number; commission: number; referrals: User[] };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [affiliateClicks] = useState<AffiliateClick[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [bonuses, setBonuses] = useState<BonusItem[]>([]);
  const [bonusCategories, setBonusCategories] = useState<BonusCategory[]>([]);
  const [bonusItems, setBonusItems] = useState<BonusItem_2[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [referrer, setReferrer] = useState<User | null>(null);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    app_name: 'Dieta Milenar', appName: 'Dieta Milenar',
    primary_color: '#D4AF37', primaryColor: '#D4AF37',
    support_whatsapp: '5511999999999', commission_rate: 0.5, commissionRate: 0.5,
  });
  const [realUser, setRealUser] = useState<User | null>(null);
  const [viewRole, setViewRoleState] = useState<UserRole | null>(null);
  const [isDevToolsEnabled, setIsDevToolsEnabled] = useState(false);
  const [isGlobalNotesEnabled, setIsGlobalNotesEnabled] = useState(false);
  const [isMemberNotificationsEnabled, setIsMemberNotificationsEnabled] = useState(true);
  const [showTeste, setShowTeste] = useState(false);

  const norm = (s: any): GlobalSettings => ({
    ...s, appName: s.app_name || s.appName, primaryColor: s.primary_color || s.primaryColor,
    stripeKey: s.stripe_key || s.stripeKey, pixelId: s.pixel_id || s.pixelId,
    logoUrl: s.logo_url || s.logoUrl, termsOfUse: s.terms_of_use || s.termsOfUse,
    supportWhatsapp: s.support_whatsapp || s.supportWhatsapp, supportEmail: s.support_email || s.supportEmail,
    heroVideoUrl: s.hero_video_url || s.heroVideoUrl, commissionRate: s.commission_rate || s.commissionRate,
    pixKey: s.pix_key || s.pixKey, pixKeyType: s.pix_key_type || s.pixKeyType,
  });

  const normUser = (u: any): User => ({
    id: u.id, name: u.name, email: u.email, role: u.role, status: u.status,
    referralCode: u.referral_code || u.referralCode,
    referredBy: u.referred_by || u.referredBy,
    walletBalance: parseFloat(u.wallet_balance ?? u.walletBalance ?? 0),
    pixKey: u.pix_key || u.pixKey, pixKeyType: u.pix_key_type || u.pixKeyType,
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
  });

  const normPlan = (p: any): PricingPlan => ({
    id: p.id, name: p.name, price: parseFloat(p.price),
    oldPrice: parseFloat(p.old_price || p.oldPrice || p.price),
    period: p.period || 'único', isPopular: !!p.is_popular, active: !!p.active,
    features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features || '[]') : []),
    paymentLink: p.payment_link || p.paymentLink || '',
  });

  const normTimeline = (t: any): Timeline => ({
    id: t.id, name: t.name, productId: t.product_id || t.productId,
    isActive: !!t.is_active, botId: t.bot_id || t.botId || '',
    pageRoute: t.page_route || t.pageRoute, trigger: t.trigger_type || t.trigger,
    blocks: (t.blocks || []).map((b: any) => ({
      id: b.id, botId: b.bot_id || b.botId, category: b.category, script: b.script,
      delayMs: b.delay_ms || b.delayMs || 1000, typingTimeMs: b.typing_time_ms || b.typingTimeMs || 2000,
      conditionType: b.condition_type || b.conditionType || 'time',
    })),
  });

  const normBot = (b: any): Bot => ({
    id: b.id, name: b.name, avatar: b.avatar, persona: b.persona, region: b.region,
    isActive: !!b.is_active, role: b.role, isOnline: !!b.is_online,
  });

  const normProduct = (x: any) => ({
    ...x,
    price: parseFloat(x.price) || 0,
    offerPrice: parseFloat(x.offer_price || x.offerPrice) || 0,
    coverImage: x.cover_image ?? x.coverImage ?? '',
    dripEnabled: !!x.drip_enabled,
    paymentLink: x.payment_link ?? x.paymentLink ?? '',
    pixKey: x.pix_key ?? x.pixKey ?? '',
    pixKeyType: x.pix_key_type ?? x.pixKeyType ?? '',
  });

  const loadPublic = useCallback(async () => {
    const [s, p, pl, b, t] = await Promise.allSettled([
      api('GET', '/settings'), api('GET', '/products'), api('GET', '/plans'),
      api('GET', '/bots'), api('GET', '/timelines'),
    ]);
    if (s.status === 'fulfilled') setGlobalSettings(norm(s.value));
    if (p.status === 'fulfilled') setProducts((p.value as any[]).map(normProduct));
    if (pl.status === 'fulfilled') setPlans((pl.value as any[]).map(normPlan));
    if (b.status === 'fulfilled') setBots((b.value as any[]).map(normBot));
    if (t.status === 'fulfilled') setTimelines((t.value as any[]).map(normTimeline));
  }, []);

  const loadAuth = useCallback(async (user: User) => {
    const isAdmin = user.role === 'ADMIN';
    const calls = [
      api('GET', '/orders'), api('GET', '/commissions'), api('GET', '/notifications'),
      api('GET', '/bonuses'), api('GET', '/bonus-categories'), api('GET', '/bonus-items'),
      api('GET', '/categories'), api('GET', '/subcategories'),
      api('GET', '/ebooks'), api('GET', '/withdrawals'),
    ];
    if (isAdmin) calls.push(api('GET', '/users'));
    const r = await Promise.allSettled(calls);
    const g = (i: number) => r[i].status === 'fulfilled' ? (r[i] as any).value : [];
    setOrders(g(0));
    setCommissions(g(1));
    setNotifications(g(2));
    setBonuses(g(3).map(normBonus));
    setBonusCategories(g(4).map(normBonusCategory));
    setBonusItems(g(5).map(normBonusItem2));
    setCategories(g(6).map(normCategory));
    setSubcategories(g(7).map(normSubcategory));
    setEbooks(g(8).map(normEbook));
    setWithdrawals(g(9).map((w: any) => ({
      id: w.id, userId: w.user_id || w.userId, amount: parseFloat(w.amount),
      status: w.status, date: w.requested_at || w.date, pixKey: w.pix_key || '',
    })));
    if (isAdmin && r[10]?.status === 'fulfilled') setUsers((r[10] as any).value.map(normUser));
    setTransactions(g(0).map((o: any) => ({
      id: o.id, userId: o.user_id || o.userId, userName: o.user_name || '', planName: o.plan_name || o.product_name || 'Produto',
      amount: parseFloat(o.total_amount || 0), status: o.status === 'paid' ? 'approved' : o.status,
      date: o.created_at, resellerId: o.affiliate_id,
      proofUrl: o.proof_url || undefined, rejectionReason: o.rejection_reason || undefined,
    })));
  }, []);

  useEffect(() => {
    (async () => {
      await loadPublic();
      const token = getToken();
      if (token) {
        try {
          const u = await api('GET', '/auth/me');
          const user = normUser(u);
          setCurrentUser(user);
          setRealUser(user);
          await loadAuth(user);
        } catch { clearToken(); }
      }
      if (localStorage.getItem('devToolsEnabled') === 'true') setIsDevToolsEnabled(true);
      if (localStorage.getItem('globalNotesEnabled') === 'true') setIsGlobalNotesEnabled(true);
      if (localStorage.getItem('memberNotificationsEnabled') === 'false') setIsMemberNotificationsEnabled(false);
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (ref) localStorage.setItem('gusta_ref_code', ref);
    })();
  }, []);

  useEffect(() => {
    const code = localStorage.getItem('gusta_ref_code');
    if (code && users.length) {
      const r = users.find(u => u.role === 'REVENDA' && u.referralCode === code);
      if (r) setReferrer(r);
    }
  }, [users]);

  const setViewRole = (role: UserRole | null) => {
    if (role) {
      // Trocar currentUser por mock com o role escolhido
      const mock: User = {
        id: realUser?.id || 'mock',
        name: realUser?.name || 'Mock',
        email: realUser?.email || 'mock@mock.com',
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(mock);
    } else {
      // Restaurar o usuário real
      if (realUser) setCurrentUser(realUser);
    }
    setViewRoleState(role);
  };

  const login = async (email: string, password?: string, role?: UserRole) => {
    if (role && !password) {
      // DevTools: trocar view role sem fazer logout real
      setViewRoleState(role);
      return;
    }
    try {
      const { token, user } = await api('POST', '/auth/login', { email, password });
      saveToken(token); const u = normUser(user); setCurrentUser(u); setRealUser(u); setViewRoleState(null); await loadAuth(u);
    } catch (err: any) {
      if (false) {
        try {
          const { token, user } = await api('POST', '/auth/register', { name: email.split('@')[0], email, password, referral_code: localStorage.getItem('gusta_ref_code') });
          saveToken(token); const u = normUser(user); setCurrentUser(u); setRealUser(u); setViewRoleState(null); await loadAuth(u);
        } catch (e2: any) { toast.error(e2.message || 'Erro ao registrar'); }
      } else {
        if (err.message === 'BLOCKED') {
          toast((t) => (
            <span style={{ fontSize: 13 }}>
              Você está temporariamente impossibilitado de se conectar.{' '}
              <strong style={{ color: '#D4AF37' }}>Contate um administrador.</strong>
            </span>
          ), { duration: 6000, icon: '🔒' });
        } else {
          toast.error(err.message || 'Erro ao fazer login');
        }
      }
    }
  };

  const logout = () => { clearToken(); setCurrentUser(null); setRealUser(null); setViewRoleState(null); setUsers([]); setOrders([]); setCommissions([]); setNotifications([]); setWithdrawals([]); };
  const setReferrerByCode = (code: string) => { const r = users.find(u => u.role === 'REVENDA' && u.referralCode === code); if (r) setReferrer(r); };

  const createOrder = async (data: any) => {
    await api('POST', '/orders', { product_id: data.productId, plan_name: data.planName, total_amount: data.totalAmount, affiliate_id: data.affiliateId || referrer?.id, payment_gateway_id: data.paymentGatewayId, status: data.status || 'pending' });
    if (currentUser) await loadAuth(currentUser);
  };
  const trackClick = async (affiliateId: string, landingPage: string) => { await fetch('/api/track-click', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ affiliateId, landingPage }) }).catch(console.error); };

  const addProduct = async (p: Product) => { await api('POST', '/products', { name: p.name, slug: p.slug, description: p.description, price: p.price, offer_price: p.offerPrice ?? null, cover_image: p.coverImage, active: p.active ? 1 : 0, drip_enabled: p.dripEnabled ? 1 : 0, payment_link: p.paymentLink ?? null, pix_key: p.pixKey ?? null, pix_key_type: p.pixKeyType ?? null }); setProducts((await api('GET', '/products')).map(normProduct)); };
  const updateProduct = async (id: string, p: Partial<Product>) => { await api('PUT', `/products/${id}`, { name: p.name, slug: p.slug, description: p.description, price: p.price, offer_price: p.offerPrice ?? null, cover_image: p.coverImage, active: p.active ? 1 : 0, drip_enabled: p.dripEnabled ? 1 : 0, payment_link: p.paymentLink ?? null, pix_key: p.pixKey ?? null, pix_key_type: p.pixKeyType ?? null }); setProducts((await api('GET', '/products')).map(normProduct)); };
  const deleteProduct = async (id: string) => { await api('DELETE', `/products/${id}`); setProducts(p=>p.filter(x=>x.id!==id)); };

  const addPlan = async (p: PricingPlan) => { await api('POST', '/plans', {...p, old_price: p.oldPrice, is_popular: p.isPopular, features: p.features || [], payment_link: p.paymentLink ?? null}); setPlans((await api('GET', '/plans')).map(normPlan)); };
  const updatePlan = async (id: string, p: Partial<PricingPlan>) => {
    const c = plans.find(x=>x.id===id);
    if (!c) throw new Error('Plano não encontrado');
    await api('PUT', `/plans/${id}`, {...c,...p, old_price: p.oldPrice??c.oldPrice, is_popular: p.isPopular??c.isPopular, features: p.features??c.features, payment_link: p.paymentLink??c.paymentLink??null});
    setPlans((await api('GET', '/plans')).map(normPlan));
  };
  const deletePlan = async (id: string) => { await api('DELETE', `/plans/${id}`); setPlans((await api('GET', '/plans')).map(normPlan)); };
  const refreshPlans = async () => { setPlans((await api('GET', '/plans')).map(normPlan)); };

  const updateUserRole = async (userId: string, role: UserRole) => { await api('PATCH', `/users/${userId}/role`, {role}); setUsers(p=>p.map(u=>u.id===userId?{...u,role}:u)); };
  const toggleUserStatus = async (userId: string) => { const {status} = await api('PATCH', `/users/${userId}/status`); setUsers(p=>p.map(u=>u.id===userId?{...u,status}:u)); };

  const addBot = async (b: Bot) => { await api('POST', '/bots', {...b, is_active: b.isActive, is_online: b.isOnline}); setBots((await api('GET', '/bots')).map(normBot)); };
  const addTimeline = async (t: Timeline) => { await api('POST', '/timelines', {name:t.name, bot_id:t.botId, is_active:t.isActive, page_route:t.pageRoute, trigger_type:t.trigger, blocks:t.blocks}); setTimelines((await api('GET', '/timelines')).map(normTimeline)); };
  const toggleTimeline = async (id: string) => { const {is_active} = await api('PATCH', `/timelines/${id}/toggle`); setTimelines(p=>p.map(t=>t.id===id?{...t,isActive:is_active}:t)); };

  const updateGlobalSettings = async (s: Partial<GlobalSettings>) => {
    const payload: any = {};
    if (s.appName !== undefined) payload.app_name = s.appName;
    if (s.logoUrl !== undefined) payload.logo_url = s.logoUrl;
    if (s.primaryColor !== undefined) payload.primary_color = s.primaryColor;
    if (s.stripeKey !== undefined) payload.stripe_key = s.stripeKey;
    if (s.pixelId !== undefined) payload.pixel_id = s.pixelId;
    if ((s as any).supportWhatsapp !== undefined) payload.support_whatsapp = (s as any).supportWhatsapp;
    if ((s as any).supportEmail !== undefined) payload.support_email = (s as any).supportEmail;
    if ((s as any).termsOfUse !== undefined) payload.terms_of_use = (s as any).termsOfUse;
    if ((s as any).commissionRate !== undefined) payload.commission_rate = (s as any).commissionRate;
    if ((s as any).heroVideoUrl !== undefined) payload.hero_video_url = (s as any).heroVideoUrl;
    if ((s as any).pixKey !== undefined) payload.pix_key = (s as any).pixKey;
    if ((s as any).pixKeyType !== undefined) payload.pix_key_type = (s as any).pixKeyType;
    await api('PUT', '/settings', payload);
    setGlobalSettings(p => norm({...p, ...s}));
  };

  const normBonusCategory = (c: any): BonusCategory => ({ id: c.id, name: c.name, description: c.description || '', order: c.sort_order ?? c.order ?? 0, isMandatory: !!c.is_mandatory, dripDays: c.drip_days ?? c.dripDays ?? 0, active: !!c.active });
  const normBonusItem2 = (i: any): BonusItem_2 => ({ id: i.id, bonusCategoryId: i.bonus_category_id ?? i.bonusCategoryId, title: i.title, description: i.description || '', coverImage: i.cover_image ?? i.coverImage ?? '', content: i.content || '', downloadUrl: i.download_url ?? i.downloadUrl ?? '', order: i.sort_order ?? i.order ?? 0, dripDays: i.drip_days ?? i.dripDays ?? 0, active: !!i.active });
  const normBonus = (b: any): BonusItem => ({ id: b.id, title: b.title, description: b.description || '', coverImage: b.cover_image ?? b.coverImage ?? '', downloadUrl: b.download_url ?? b.downloadUrl ?? '', content: b.content || '', targetAudience: b.target_audience ?? b.targetAudience ?? 'MEMBRO', active: !!b.active });
  const addBonus = async (b: BonusItem) => { await api('POST', '/bonuses', { title: b.title, description: b.description, cover_image: b.coverImage, download_url: b.downloadUrl, content: b.content, target_audience: b.targetAudience, active: b.active ? 1 : 0 }); setBonuses((await api('GET', '/bonuses')).map(normBonus)); };
  const updateBonus = async (id: string, b: Partial<BonusItem>) => { const c = bonuses.find(x=>x.id===id); if(c) { const m = {...c,...b}; await api('PUT', `/bonuses/${id}`, { title: m.title, description: m.description, cover_image: m.coverImage, download_url: m.downloadUrl, content: m.content, target_audience: m.targetAudience, active: m.active ? 1 : 0 }); } setBonuses((await api('GET', '/bonuses')).map(normBonus)); };
  const deleteBonus = async (id: string) => { await api('DELETE', `/bonuses/${id}`); setBonuses(p=>p.filter(x=>x.id!==id)); };

  const addBonusCategory = async (c: BonusCategory) => { await api('POST', '/bonus-categories', { id: c.id, name: c.name, description: c.description, sort_order: c.order ?? 0, is_mandatory: c.isMandatory ? 1 : 0, drip_days: c.dripDays ?? 0 }); setBonusCategories((await api('GET', '/bonus-categories')).map(normBonusCategory)); };
  const updateBonusCategory = async (id: string, c: Partial<BonusCategory>) => { const x = bonusCategories.find(v=>v.id===id); if(x) { const m = {...x,...c}; await api('PUT', `/bonus-categories/${id}`, { name: m.name, description: m.description, sort_order: m.order ?? 0, is_mandatory: m.isMandatory ? 1 : 0, drip_days: m.dripDays ?? 0, active: m.active ? 1 : 0 }); } setBonusCategories((await api('GET', '/bonus-categories')).map(normBonusCategory)); };
  const deleteBonusCategory = async (id: string) => { await api('DELETE', `/bonus-categories/${id}`); setBonusCategories(p=>p.filter(x=>x.id!==id)); };
  const refreshBonusCategories = async () => { setBonusCategories((await api('GET', '/bonus-categories')).map(normBonusCategory)); };

  const addBonusItem2 = async (i: BonusItem_2) => { await api('POST', '/bonus-items', { id: i.id, bonus_category_id: i.bonusCategoryId, title: i.title, description: i.description, cover_image: i.coverImage, content: i.content, download_url: i.downloadUrl || null, sort_order: i.order ?? 0, drip_days: i.dripDays ?? 0 }); setBonusItems((await api('GET', '/bonus-items')).map(normBonusItem2)); };
  const updateBonusItem2 = async (id: string, i: Partial<BonusItem_2>) => { const x = bonusItems.find(v=>v.id===id); if(x) { const m = {...x,...i}; await api('PUT', `/bonus-items/${id}`, { title: m.title, description: m.description, cover_image: m.coverImage, content: m.content, download_url: m.downloadUrl || null, sort_order: m.order ?? 0, drip_days: m.dripDays ?? 0, active: m.active ? 1 : 0 }); } setBonusItems((await api('GET', '/bonus-items')).map(normBonusItem2)); };
  const deleteBonusItem2 = async (id: string) => { await api('DELETE', `/bonus-items/${id}`); setBonusItems(p=>p.filter(x=>x.id!==id)); };
  const refreshBonusItems = async () => { setBonusItems((await api('GET', '/bonus-items')).map(normBonusItem2)); };

  const normCategory = (c: any): Category => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    order: c.sort_order ?? c.order ?? 0,
    isMandatory: !!(c.is_mandatory ?? c.isMandatory),
    dripDays: c.drip_days ?? c.dripDays ?? 0,
    active: c.active !== undefined ? !!c.active : true,
  });

  const addCategory = async (c: Category) => { await api('POST', '/categories', { name: c.name, description: c.description, sort_order: c.order ?? 0, is_mandatory: c.isMandatory ? 1 : 0, drip_days: c.dripDays ?? 0, active: 1 }); setCategories((await api('GET', '/categories')).map(normCategory)); };
  const updateCategory = async (id: string, c: Partial<Category>) => { const x = categories.find(v=>v.id===id); if(x) { const merged = {...x, ...c}; await api('PUT', `/categories/${id}`, { name: merged.name, description: merged.description, sort_order: merged.order ?? 0, is_mandatory: merged.isMandatory ? 1 : 0, drip_days: merged.dripDays ?? 0, active: merged.active ? 1 : 0 }); } setCategories((await api('GET', '/categories')).map(normCategory)); };
  const deleteCategory = async (id: string) => { await api('DELETE', `/categories/${id}`); setCategories(p=>p.filter(x=>x.id!==id)); };
  const refreshCategories = async () => { setCategories((await api('GET', '/categories')).map(normCategory)); };

  const normSubcategory = (s: any): Subcategory => ({ id: s.id, categoryId: s.category_id ?? s.categoryId, name: s.name, description: s.description || '', order: s.sort_order ?? s.order ?? 0, dripDays: s.drip_days ?? s.dripDays ?? 0, active: !!s.active });
  const addSubcategory = async (s: Subcategory) => { await api('POST', '/subcategories', { id: s.id, category_id: s.categoryId, name: s.name, description: s.description, sort_order: s.order ?? 0, drip_days: s.dripDays ?? 0 }); setSubcategories((await api('GET', '/subcategories')).map(normSubcategory)); };
  const updateSubcategory = async (id: string, s: Partial<Subcategory>) => { const x = subcategories.find(v=>v.id===id); if(x) { const m = {...x,...s}; await api('PUT', `/subcategories/${id}`, { category_id: m.categoryId, name: m.name, description: m.description, sort_order: m.order ?? 0, drip_days: m.dripDays ?? 0, active: m.active ? 1 : 0 }); } setSubcategories((await api('GET', '/subcategories')).map(normSubcategory)); };
  const deleteSubcategory = async (id: string) => { await api('DELETE', `/subcategories/${id}`); setSubcategories(p=>p.filter(x=>x.id!==id)); };

  const normEbook = (e: any): Ebook => ({
    id: e.id,
    categoryId: e.category_id ?? e.categoryId,
    subcategoryId: e.subcategory_id ?? e.subcategoryId,
    title: e.title,
    description: e.description || '',
    coverImage: e.cover_image ?? e.coverImage ?? '',
    content: e.content || '',
    downloadUrl: e.download_url ?? e.downloadUrl ?? '',
    order: e.sort_order ?? e.order ?? 0,
    dripDays: e.drip_days ?? e.dripDays ?? 0,
    active: e.active !== undefined ? !!e.active : true,
  });

  const addEbook = async (e: Ebook) => { await api('POST', '/ebooks', { category_id: e.categoryId, subcategory_id: e.subcategoryId || null, title: e.title, description: e.description, cover_image: e.coverImage, content: e.content, download_url: e.downloadUrl || null, sort_order: e.order ?? 0, drip_days: e.dripDays ?? 0 }); setEbooks((await api('GET', '/ebooks')).map(normEbook)); };
  const updateEbook = async (id: string, e: Partial<Ebook>) => { const c = ebooks.find(x=>x.id===id); if(c) { const m = {...c,...e}; await api('PUT', `/ebooks/${id}`, { title: m.title, description: m.description, cover_image: m.coverImage, content: m.content, download_url: m.downloadUrl || null, sort_order: m.order ?? 0, drip_days: m.dripDays ?? 0, active: m.active ? 1 : 0 }); } setEbooks((await api('GET', '/ebooks')).map(normEbook)); };
  const deleteEbook = async (id: string) => { await api('DELETE', `/ebooks/${id}`); setEbooks(p=>p.filter(x=>x.id!==id)); };
  const refreshEbooks = async () => { setEbooks((await api('GET', '/ebooks')).map(normEbook)); };

  const updatePixKey = async (userId: string, key: string, type: 'cpf'|'email'|'phone'|'random') => { await api('PATCH', `/users/${userId}/pix`, {pix_key:key, pix_key_type:type}); setUsers(p=>p.map(u=>u.id===userId?{...u,pixKey:key,pixKeyType:type}:u)); if(currentUser?.id===userId) setCurrentUser(p=>p?{...p,pixKey:key,pixKeyType:type}:null); };
  const requestWithdrawal = async (userId: string, amount: number) => { await api('POST', '/withdrawals', {amount}); if(currentUser) await loadAuth(currentUser); };
  const updateWithdrawalStatus = async (id: string, status: 'approved'|'rejected') => { await api('PATCH', `/withdrawals/${id}`, {status}); setWithdrawals(p=>p.map(w=>w.id===id?{...w,status}:w)); };

  const addTransaction = (t: Transaction) => { createOrder({userId:t.userId, planName:t.planName, totalAmount:t.amount, affiliateId:t.resellerId, status:t.status==='approved'?'paid':t.status}); };
  const updateTransactionStatus = async (id: string, status: 'approved'|'rejected', rejectionReason?: string) => { await api('PATCH', `/orders/${id}/status`, {status:status==='approved'?'paid':status, rejection_reason: rejectionReason}); if(currentUser) await loadAuth(currentUser); };
  const getResellerStats = (resellerId: string) => {
    const mine = transactions.filter(t=>t.resellerId===resellerId&&t.status==='approved');
    const totalSales = mine.reduce((a,c)=>a+c.amount,0);
    const rate = (globalSettings.commissionRate||globalSettings.commission_rate)||0.5;
    return { totalSales, commission: totalSales*rate, referrals: users.filter(u=>u.referredBy===resellerId) };
  };

  const setDevToolsEnabled = (e: boolean) => { setIsDevToolsEnabled(e); localStorage.setItem('devToolsEnabled', String(e)); };
  const setGlobalNotesEnabled = (e: boolean) => { setIsGlobalNotesEnabled(e); localStorage.setItem('globalNotesEnabled', String(e)); };
  const setMemberNotificationsEnabled = (e: boolean) => { setIsMemberNotificationsEnabled(e); localStorage.setItem('memberNotificationsEnabled', String(e)); };

  return (
    <DataContext.Provider value={{
      currentUser, realUser, viewRole, setViewRole, users, transactions, orders, commissions, affiliateClicks,
      notifications, products, plans, bonuses, bonusCategories, bonusItems, categories, subcategories, ebooks,
      addBonusCategory, updateBonusCategory, deleteBonusCategory, refreshBonusCategories,
      addBonusItem2, updateBonusItem2, deleteBonusItem2, refreshBonusItems,
      bots, timelines, withdrawals, referrer, globalSettings,
      isDevToolsEnabled, setDevToolsEnabled, isGlobalNotesEnabled, setGlobalNotesEnabled,
      isMemberNotificationsEnabled, setMemberNotificationsEnabled, showTeste, setShowTeste,
      login, logout, setReferrerByCode, createOrder, trackClick,
      addProduct, updateProduct, deleteProduct, addPlan, updatePlan, deletePlan, refreshPlans,
      updateUserRole, toggleUserStatus, addBot, addTimeline, toggleTimeline,
      updateGlobalSettings, addBonus, updateBonus, deleteBonus,
      addCategory, updateCategory, deleteCategory, refreshCategories, addSubcategory, updateSubcategory, deleteSubcategory,
      addEbook, updateEbook, deleteEbook, refreshEbooks, updatePixKey, requestWithdrawal, updateWithdrawalStatus,
      addTransaction, updateTransactionStatus, getResellerStats,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
