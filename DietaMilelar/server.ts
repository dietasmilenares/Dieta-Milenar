import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import fs from "fs";
import multer from "multer";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// PROJECT_ROOT: sempre aponta para a raiz do projeto, independente de onde o processo é iniciado
// Sobe um nível se estiver dentro de dist/, senão usa __dirname diretamente
const PROJECT_ROOT = path.basename(__dirname) === "dist"
  ? path.resolve(__dirname, "..")
  : path.resolve(__dirname);

const DB_CONFIG = {
  host:     process.env.DB_HOST || "127.0.0.1",
  port:     parseInt(process.env.DB_PORT || "3306"),
  user:     process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "dieta_milenar",
  waitForConnections: true,
  connectionLimit: 10,
};

const JWT_SECRET = process.env.JWT_SECRET || "dieta_milenar_secret_2024";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_4eC39HqLyjWDarjtT1zdp7dc");

// Multer config para upload de e-books
const ebooksDir = path.join(PROJECT_ROOT, "public", "e-books");
if (!fs.existsSync(ebooksDir)) fs.mkdirSync(ebooksDir, { recursive: true });

// Sanitiza nome para pasta (remove acentos e caracteres especiais)
const slugify = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

const ebookStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const categorySlug = req.body.category_slug ? slugify(req.body.category_slug) : null;
    const subcategorySlug = req.body.subcategory_slug ? slugify(req.body.subcategory_slug) : null;
    let destDir = ebooksDir;
    if (categorySlug) destDir = path.join(destDir, categorySlug);
    if (subcategorySlug) destDir = path.join(destDir, subcategorySlug);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    cb(null, destDir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const withExt = safe.endsWith('.pdf') ? safe : `${safe}.pdf`;
    cb(null, withExt);
  },
});
const uploadEbook = multer({ storage: ebookStorage, limits: { fileSize: 100 * 1024 * 1024 } });

// Multer config para upload de comprovantes de pagamento
const proofsDir = path.join(PROJECT_ROOT, "public", "proofs");
if (!fs.existsSync(proofsDir)) fs.mkdirSync(proofsDir, { recursive: true });

const proofStorage = multer.diskStorage({
  destination: (_req, _file, cb) => { cb(null, proofsDir); },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `proof_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const uploadProof = multer({ storage: proofStorage, limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  cb(null, allowed.includes(file.mimetype));
}});

let pool: mysql.Pool;

async function initDB() {
  pool = mysql.createPool(DB_CONFIG);
  const conn = await pool.getConnection();
  console.log("[MySQL] Conectado:", DB_CONFIG.host, DB_CONFIG.database);
  conn.release();
}

const signToken = (p: object) => jwt.sign(p, JWT_SECRET, { expiresIn: "7d" });
const verifyToken = (t: string) => jwt.verify(t, JWT_SECRET) as any;

function auth(req: any, res: any, next: any) {
  const h = req.headers["authorization"];
  if (!h) return res.status(401).json({ error: "Token ausente" });
  try { req.user = verifyToken(h.replace("Bearer ", "")); next(); }
  catch { res.status(401).json({ error: "Token inválido" }); }
}

function adminOnly(req: any, res: any, next: any) {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Acesso negado" });
  next();
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");
  app.use(express.json({ limit: "10mb" }));

  // AUTH
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email=? LIMIT 1", [email]);
    const user = rows[0];
    if (!user || user.password_hash !== password)
      return res.status(401).json({ error: "Credenciais inválidas" });
    if (user.status === "blocked")
      return res.status(403).json({ error: "BLOCKED" });
    const { password_hash, ...safe } = user;
    res.json({ token: signToken({ id: user.id, email: user.email, role: user.role }), user: safe });
  });

  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, referral_code, phone, gender, age, weight, height, activity_level, goal, restrictions } = req.body;
    const [ex]: any = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (ex.length) return res.status(409).json({ error: "E-mail já cadastrado" });
    const hash = password;
    const id = randomUUID();
    let referredBy = null;
    if (referral_code) {
      const [ref]: any = await pool.query("SELECT id FROM users WHERE referral_code=?", [referral_code]);
      referredBy = ref[0]?.id || null;
    }
    await pool.query("INSERT INTO users (id,name,email,password_hash,role,referred_by) VALUES (?,?,?,?,?,?)",
      [id, name, email, hash, "VISITANTE", referredBy]);
    await pool.query(
      "INSERT INTO user_profiles (id,user_id,phone,gender,age,weight,height,activity_level,goal,restrictions) VALUES (UUID(),?,?,?,?,?,?,?,?,?)",
      [id, phone || null, gender || null, age || null, weight || null, height || null, activity_level || null, goal || null, restrictions || null]
    );
    res.status(201).json({ token: signToken({ id, email, role: "VISITANTE" }), user: { id, name, email, role: "VISITANTE" } });
  });

  app.get("/api/auth/me", auth, async (req: any, res) => {
    const [rows]: any = await pool.query(
      "SELECT id,name,email,role,status,referral_code,referred_by,wallet_balance,pix_key,pix_key_type,created_at FROM users WHERE id=?",
      [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  });

  // PROFILE
  app.get("/api/profile", auth, async (req: any, res) => {
    const [rows]: any = await pool.query(
      "SELECT phone,gender,age,weight,height,activity_level,goal,restrictions FROM user_profiles WHERE user_id=?",
      [req.user.id]);
    res.json(rows[0] || {});
  });

  app.put("/api/profile/me", auth, async (req: any, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Nome e e-mail obrigatórios" });
    const [ex]: any = await pool.query("SELECT id FROM users WHERE email=? AND id!=?", [email, req.user.id]);
    if (ex.length) return res.status(409).json({ error: "E-mail já cadastrado por outro usuário" });
    await pool.query("UPDATE users SET name=?, email=? WHERE id=?", [name.trim(), email.trim(), req.user.id]);
    res.json({ ok: true });
  });

  app.put("/api/profile", auth, async (req: any, res) => {
    const { phone, gender, age, weight, height, activity_level, goal, restrictions } = req.body;
    const [ex]: any = await pool.query("SELECT id FROM user_profiles WHERE user_id=?", [req.user.id]);
    if (ex.length) {
      await pool.query(
        "UPDATE user_profiles SET phone=?,gender=?,age=?,weight=?,height=?,activity_level=?,goal=?,restrictions=? WHERE user_id=?",
        [phone||null, gender||null, age||null, weight||null, height||null, activity_level||null, goal||null, restrictions||null, req.user.id]
      );
    } else {
      await pool.query(
        "INSERT INTO user_profiles (id,user_id,phone,gender,age,weight,height,activity_level,goal,restrictions) VALUES (UUID(),?,?,?,?,?,?,?,?,?)",
        [req.user.id, phone||null, gender||null, age||null, weight||null, height||null, activity_level||null, goal||null, restrictions||null]
      );
    }
    res.json({ ok: true });
  });

  // USERS
  app.get("/api/users", auth, adminOnly, async (_r, res) => {
    const [rows]: any = await pool.query("SELECT id,name,email,role,status,referral_code,wallet_balance,pix_key,pix_key_type,created_at FROM users ORDER BY created_at DESC");
    res.json(rows);
  });
  app.patch("/api/users/:id/role", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE users SET role=? WHERE id=?", [req.body.role, req.params.id]);
    res.json({ ok: true });
  });

  app.put("/api/users/:id", auth, adminOnly, async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Nome e e-mail obrigatórios" });
    const [ex]: any = await pool.query("SELECT id FROM users WHERE email=? AND id!=?", [email, req.params.id]);
    if (ex.length) return res.status(409).json({ error: "E-mail já cadastrado por outro usuário" });
    await pool.query("UPDATE users SET name=?, email=? WHERE id=?", [name.trim(), email.trim(), req.params.id]);
    res.json({ ok: true });
  });
  app.patch("/api/users/:id/status", auth, adminOnly, async (req, res) => {
    const [r]: any = await pool.query("SELECT status FROM users WHERE id=?", [req.params.id]);
    const next = r[0]?.status === "active" ? "blocked" : "active";
    await pool.query("UPDATE users SET status=? WHERE id=?", [next, req.params.id]);
    res.json({ status: next });
  });

  app.patch("/api/users/:id/reset-password", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE users SET password_hash=? WHERE id=?", ["123456", req.params.id]);
    res.json({ ok: true });
  });

  app.patch("/api/users/:id/password", auth, adminOnly, async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 4) return res.status(400).json({ error: "Senha muito curta" });
    await pool.query("UPDATE users SET password_hash=? WHERE id=?", [password, req.params.id]);
    res.json({ ok: true });
  });

  app.delete("/api/users/:id", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.patch("/api/users/:id/pix", auth, async (req: any, res) => {
    if (req.user.id !== req.params.id && req.user.role !== "ADMIN") return res.status(403).json({ error: "Negado" });
    await pool.query("UPDATE users SET pix_key=?,pix_key_type=? WHERE id=?", [req.body.pix_key, req.body.pix_key_type, req.params.id]);
    res.json({ ok: true });
  });

  // SETTINGS
  app.get("/api/settings", async (_r, res) => {
    const [rows]: any = await pool.query("SELECT * FROM global_settings WHERE id=1");
    res.json(rows[0] || {});
  });
  app.put("/api/settings", auth, adminOnly, async (req, res) => {
    try {
      const f = req.body;
      if (!Object.keys(f).length) return res.status(400).json({ error: "Nenhum campo enviado" });
      const sets = Object.keys(f).map(k => `\`${k}\`=?`).join(",");
      await pool.query(`UPDATE global_settings SET ${sets} WHERE id=1`, Object.values(f));
      res.json({ ok: true });
    } catch (err: any) {
      console.error("[settings PUT]", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PLANS
  app.get("/api/plans", async (_r, res) => {
    const [rows]: any = await pool.query("SELECT * FROM plans WHERE active=1 ORDER BY price");
    res.json(rows.map((r: any) => ({ ...r, features: typeof r.features === "string" ? JSON.parse(r.features) : r.features })));
  });
  app.get("/api/plans/inactive", auth, adminOnly, async (_r, res) => {
    const [rows]: any = await pool.query("SELECT * FROM plans WHERE active=0 ORDER BY price");
    res.json(rows.map((r: any) => ({ ...r, features: typeof r.features === "string" ? JSON.parse(r.features) : r.features })));
  });
  app.delete("/api/plans/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM plans WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.post("/api/plans", auth, adminOnly, async (req, res) => {
    const { name, price, old_price, period, is_popular, active, features, payment_link } = req.body;
    if (!name) return res.status(400).json({ error: "Nome é obrigatório" });
    const id = randomUUID();
    const featsJson = JSON.stringify(Array.isArray(features) ? features.filter(Boolean) : []);
    await pool.query("INSERT INTO plans (id,name,price,old_price,period,is_popular,active,features,payment_link) VALUES (?,?,?,?,?,?,?,?,?)",
      [id, name, parseFloat(price)||0, parseFloat(old_price)||0, period||'único', is_popular ? 1 : 0, active ?? 1, featsJson, payment_link ?? null]);
    res.status(201).json({ id });
  });
  app.put("/api/plans/:id", auth, adminOnly, async (req, res) => {
    const { name, price, old_price, period, is_popular, active, features, payment_link } = req.body;
    if (!name) return res.status(400).json({ error: "Nome é obrigatório" });
    const featsJson = JSON.stringify(Array.isArray(features) ? features.filter(Boolean) : []);
    // active ?? 1 era perigoso: se o front não mandar o campo, reativava o plano
    // Agora: undefined mantém o valor atual no banco
    const activeFields = active !== undefined ? [active ? 1 : 0] : [];
    const activeClause = active !== undefined ? ",active=?" : "";
    await pool.query(
      `UPDATE plans SET name=?,price=?,old_price=?,period=?,is_popular=?,features=?,payment_link=?${activeClause} WHERE id=?`,
      [name, parseFloat(price)||0, parseFloat(old_price)||0, period||'único', is_popular ? 1 : 0, featsJson, payment_link ?? null, ...activeFields, req.params.id]
    );
    res.json({ ok: true });
  });
  app.delete("/api/plans/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE plans SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // ORDERS
  app.post("/api/orders", auth, async (req: any, res) => {
    const { product_id, product_name, plan_name, total_amount, affiliate_id, payment_gateway_id, proof_url, status } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO orders (id,user_id,product_id,affiliate_id,plan_name,product_name,total_amount,payment_gateway_id,proof_url,status) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [id, req.user.id, product_id || null, affiliate_id || null, plan_name, product_name || null, total_amount, payment_gateway_id || null, proof_url || null, status || "pending"]);
    if (status === "paid") {
      await pool.query("UPDATE users SET role='MEMBRO' WHERE id=? AND role='VISITANTE'", [req.user.id]);
      if (affiliate_id) {
        const [sr]: any = await pool.query("SELECT commission_rate FROM global_settings WHERE id=1");
        const rate = sr[0]?.commission_rate || 0.5;
        const comm = total_amount * rate;
        await pool.query("INSERT INTO commissions (id,affiliate_id,order_id,amount,status,release_date) VALUES (?,?,?,?,?,?)",
          [randomUUID(), affiliate_id, id, comm, "pending", new Date(Date.now() + 7 * 86400000)]);
        await pool.query("UPDATE users SET wallet_balance=wallet_balance+? WHERE id=?", [comm, affiliate_id]);
      }
    }
    // Notificar admins quando comprovante for enviado
    if (proof_url) {
      const [buyer]: any = await pool.query("SELECT name, email FROM users WHERE id=?", [req.user.id]);
      const [profile]: any = await pool.query("SELECT phone FROM user_profiles WHERE user_id=?", [req.user.id]);
      const buyerName  = buyer[0]?.name  || "Desconhecido";
      const buyerEmail = buyer[0]?.email || "Não informado";
      const buyerPhone = profile[0]?.phone || "Não informado";
      const amount     = parseFloat(total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const message    = `Comprovante recebido!\n\nNome: ${buyerName}\nE-mail: ${buyerEmail}\nWhatsapp: ${buyerPhone}\n\nAdquiriu o "${plan_name || product_name || 'Plano'}"\nValor de: ${amount}`;
      const [admins]: any = await pool.query("SELECT id FROM users WHERE role='ADMIN'");
      for (const admin of admins) {
        await pool.query(
          "INSERT INTO notifications (id,user_id,message,type,is_read) VALUES (?,?,?,'proof',0)",
          [randomUUID(), admin.id, message]
        );
      }
    }
    res.status(201).json({ id });
  });
  app.get("/api/orders", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [rows]: any = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
      return res.json(rows);
    }
    const [rows]: any = await pool.query("SELECT * FROM orders WHERE user_id=? OR affiliate_id=? ORDER BY created_at DESC", [req.user.id, req.user.id]);
    res.json(rows);
  });
  app.patch("/api/orders/:id/status", auth, adminOnly, async (req: any, res) => {
    const { status, rejection_reason } = req.body;
    const [orderRows]: any = await pool.query("SELECT * FROM orders WHERE id=?", [req.params.id]);
    const order = orderRows[0];
    if (!order) return (res as any).status(404).json({ error: "Pedido não encontrado" });
    // ENUM aceita: pending | paid | refunded | cancelled
    // Frontend envia 'rejected' → mapear para 'cancelled' no banco
    const dbStatus = status === "rejected" ? "cancelled" : status;
    if (rejection_reason !== undefined) {
      await pool.query("UPDATE orders SET status=?, rejection_reason=? WHERE id=?", [dbStatus, rejection_reason || null, req.params.id]);
    } else {
      await pool.query("UPDATE orders SET status=? WHERE id=?", [dbStatus, req.params.id]);
    }
    if (status === "paid") {
      await pool.query("UPDATE users SET role='MEMBRO' WHERE id=? AND role='VISITANTE'", [order.user_id]);
      const productName = order.plan_name || order.product_name || "Dieta Milenar";
      const congratsMessage = `🏆 Bem-vindo à Ordem dos Iniciados, Faraó!

Seu acesso ao ${productName} foi confirmado e seu portal está aberto.

Você acaba de dar o primeiro passo de uma jornada que poucos têm a coragem de iniciar. A Dieta Milenar não é apenas um método — é um sistema ancestral de transformação que atravessou séculos para chegar até você.

✨ O que espera por você agora:
• Protocolos exclusivos usados por sacerdotes e guerreiros do Egito Antigo
• Acesso completo à biblioteca de e-books e sagas de conhecimento
• Uma comunidade de pessoas que escolheram a transformação real

A transformação começa hoje. O seu corpo tem memória ancestral — e agora você vai despertá-la.

Seja bem-vindo ao seu novo capítulo. 🌟`;
      await pool.query(
        "INSERT INTO notifications (id,user_id,message,type,is_read) VALUES (?,?,?,'system',0)",
        [randomUUID(), order.user_id, congratsMessage]
      );
    } else if (status === "rejected") {
      const reason = rejection_reason || "Não informado";
      const rejectMsg = rejection_reason && rejection_reason.trim()
        ? `Seu comprovante de pagamento foi recusado. Motivo: ${rejection_reason.trim()}`
        : `Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.`;
      await pool.query(
        "INSERT INTO notifications (id,user_id,message,type,is_read) VALUES (?,?,?,'rejection',0)",
        [randomUUID(), order.user_id, rejectMsg]
      );
    }
    res.json({ ok: true });
  });

  // PEDIDOS COM COMPROVANTE PENDENTE (admin)
  app.get("/api/orders/pending-proofs", auth, adminOnly, async (_req, res) => {
    const [rows]: any = await pool.query(
      "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON u.id=o.user_id WHERE o.proof_url IS NOT NULL AND o.status='pending' ORDER BY o.created_at DESC"
    );
    res.json(rows);
  });

  // COMMISSIONS
  app.get("/api/commissions", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [rows]: any = await pool.query("SELECT * FROM commissions ORDER BY created_at DESC");
      return res.json(rows);
    }
    const [rows]: any = await pool.query("SELECT * FROM commissions WHERE affiliate_id=? ORDER BY created_at DESC", [req.user.id]);
    res.json(rows);
  });

  // WITHDRAWALS
  app.post("/api/withdrawals", auth, async (req: any, res) => {
    const { amount } = req.body;
    const [ur]: any = await pool.query("SELECT * FROM users WHERE id=?", [req.user.id]);
    const u = ur[0];
    if (!u || u.wallet_balance < amount) return res.status(400).json({ error: "Saldo insuficiente" });
    if (!u.pix_key) return res.status(400).json({ error: "Cadastre Pix antes" });
    const id = randomUUID();
    await pool.query("INSERT INTO withdrawals (id,user_id,amount,pix_key,status) VALUES (?,?,?,?,?)", [id, req.user.id, amount, u.pix_key, "requested"]);
    await pool.query("UPDATE users SET wallet_balance=wallet_balance-? WHERE id=?", [amount, req.user.id]);
    res.status(201).json({ id });
  });
  app.get("/api/withdrawals", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [rows]: any = await pool.query("SELECT w.*,u.name user_name FROM withdrawals w LEFT JOIN users u ON u.id=w.user_id ORDER BY w.requested_at DESC");
      return res.json(rows);
    }
    const [rows]: any = await pool.query("SELECT * FROM withdrawals WHERE user_id=? ORDER BY requested_at DESC", [req.user.id]);
    res.json(rows);
  });
  app.patch("/api/withdrawals/:id", auth, adminOnly, async (req, res) => {
    const { status } = req.body;
    const [wr]: any = await pool.query("SELECT * FROM withdrawals WHERE id=?", [req.params.id]);
    const w = wr[0];
    if (status === "rejected" && w?.status === "requested")
      await pool.query("UPDATE users SET wallet_balance=wallet_balance+? WHERE id=?", [w.amount, w.user_id]);
    await pool.query("UPDATE withdrawals SET status=?,resolved_at=NOW() WHERE id=?", [status, req.params.id]);
    res.json({ ok: true });
  });

  // NOTIFICATIONS
  app.get("/api/notifications", auth, async (req: any, res) => {
    const [rows]: any = await pool.query("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC", [req.user.id]);
    res.json(rows);
  });
  app.patch("/api/notifications/mark-read", auth, async (req: any, res) => {
    const { type } = req.body;
    if (type) {
      await pool.query("UPDATE notifications SET is_read=1 WHERE user_id=? AND type=?", [req.user.id, type]);
    } else {
      await pool.query("UPDATE notifications SET is_read=1 WHERE user_id=?", [req.user.id]);
    }
    res.json({ ok: true });
  });

  // RESELLER REQUESTS
  app.post("/api/reseller-requests", auth, async (req: any, res) => {
    try {
      const { phone } = req.body;
      // Bloquear auto-indicação não se aplica aqui, mas registrar solicitação única
      const [ex]: any = await pool.query(
        "SELECT id,status FROM reseller_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
        [req.user.id]
      );
      if (ex.length && ex[0].status === 'pending')
        return res.status(409).json({ error: "Você já tem uma solicitação aguardando aprovação." });
      if (ex.length && ex[0].status === 'approved')
        return res.status(409).json({ error: "Sua solicitação já foi aprovada." });
      const [u]: any = await pool.query("SELECT name,email FROM users WHERE id=?", [req.user.id]);
      if (!u.length) return res.status(404).json({ error: "Usuário não encontrado" });
      await pool.query(
        "INSERT INTO reseller_requests (id,user_id,name,email,phone,status) VALUES (?,?,?,?,?,'pending')",
        [randomUUID(), req.user.id, u[0].name, u[0].email, phone || null]
      );
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/reseller-requests", auth, async (req: any, res) => {
    try {
      if (req.user.role === 'ADMIN') {
        const [rows]: any = await pool.query("SELECT * FROM reseller_requests ORDER BY created_at DESC");
        return res.json(rows);
      }
      const [rows]: any = await pool.query(
        "SELECT * FROM reseller_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
        [req.user.id]
      );
      res.json(rows[0] || null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/reseller-requests/:id", auth, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });
      const { status } = req.body;
      const [rr]: any = await pool.query("SELECT * FROM reseller_requests WHERE id=?", [req.params.id]);
      if (!rr.length) return res.status(404).json({ error: "Solicitação não encontrada" });
      await pool.query("UPDATE reseller_requests SET status=? WHERE id=?", [status, req.params.id]);
      if (status === 'approved') {
        const refCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await pool.query("UPDATE users SET role='REVENDA', referral_code=? WHERE id=?", [refCode, rr[0].user_id]);
        await pool.query(
          "INSERT INTO notifications (id,user_id,message,type,is_read) VALUES (?,?,?,'system',0)",
          [randomUUID(), rr[0].user_id, '🎉 Parabéns! Sua solicitação de revendedor foi aprovada. Acesse o menu "Indicar" para ver seu link exclusivo.']
        );
      } else if (status === 'rejected') {
        await pool.query(
          "INSERT INTO notifications (id,user_id,message,type,is_read) VALUES (?,?,?,'rejection',0)",
          [randomUUID(), rr[0].user_id, 'Sua solicitação de revendedor não foi aprovada desta vez. Entre em contato com o suporte para mais informações.']
        );
      }
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PRODUCTS
  app.get("/api/products", async (_r, res) => {
    const [products]: any = await pool.query("SELECT * FROM products");
    const [mods]: any = await pool.query("SELECT * FROM product_modules ORDER BY sort_order");
    const [chaps]: any = await pool.query("SELECT * FROM product_chapters ORDER BY sort_order");
    res.json(products.map((p: any) => ({
      ...p,
      modules: mods.filter((m: any) => m.product_id === p.id).map((m: any) => ({
        ...m, chapters: chaps.filter((c: any) => c.module_id === m.id)
      }))
    })));
  });
  app.post("/api/products", auth, adminOnly, async (req, res) => {
    const { name, slug, description, price, offer_price, cover_image, active, drip_enabled, payment_link, pix_key, pix_key_type } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO products (id,name,slug,description,price,offer_price,cover_image,active,drip_enabled,payment_link,pix_key,pix_key_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [id, name, slug, description, price, offer_price ?? null, cover_image, active ?? 1, drip_enabled ?? 0, payment_link ?? null, pix_key ?? null, pix_key_type ?? null]);
    res.status(201).json({ id });
  });
  app.put("/api/products/:id", auth, adminOnly, async (req, res) => {
    const { name, slug, description, price, offer_price, cover_image, active, drip_enabled, payment_link, pix_key, pix_key_type } = req.body;
    await pool.query("UPDATE products SET name=?,slug=?,description=?,price=?,offer_price=?,cover_image=?,active=?,drip_enabled=?,payment_link=?,pix_key=?,pix_key_type=? WHERE id=?",
      [name, slug, description, price, offer_price ?? null, cover_image, active, drip_enabled ?? 0, payment_link ?? null, pix_key ?? null, pix_key_type ?? null, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/products/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE products SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // BONUSES
  app.get("/api/bonuses", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [r]: any = await pool.query("SELECT * FROM bonuses ORDER BY created_at DESC");
      return res.json(r);
    }
    const [r]: any = await pool.query("SELECT * FROM bonuses WHERE active=1 AND target_audience=?", [req.user.role]);
    res.json(r);
  });
  app.post("/api/bonuses", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, download_url, content, target_audience, active } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO bonuses (id,title,description,cover_image,download_url,content,target_audience,active) VALUES (?,?,?,?,?,?,?,?)",
      [id, title, description, cover_image, download_url, content, target_audience || "MEMBRO", active ?? 1]);
    res.status(201).json({ id });
  });
  app.put("/api/bonuses/:id", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, download_url, content, target_audience, active } = req.body;
    await pool.query("UPDATE bonuses SET title=?,description=?,cover_image=?,download_url=?,content=?,target_audience=?,active=? WHERE id=?",
      [title, description, cover_image, download_url, content, target_audience, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonuses/:id", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM bonuses WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // ── Bonus Categories ──────────────────────────────────────
  app.get("/api/bonus-categories/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_categories WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });
  app.get("/api/bonus-categories", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_categories WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/bonus-categories", auth, adminOnly, async (req, res) => {
    const { id, name, description, sort_order, is_mandatory, drip_days } = req.body;
    await pool.query("INSERT INTO bonus_categories (id,name,description,sort_order,is_mandatory,drip_days) VALUES (?,?,?,?,?,?)",
      [id || null, name, description, sort_order ?? 0, is_mandatory ?? 0, drip_days ?? 0]);
    res.json({ ok: true });
  });
  app.put("/api/bonus-categories/:id", auth, adminOnly, async (req, res) => {
    const { name, description, sort_order, is_mandatory, drip_days, active } = req.body;
    await pool.query("UPDATE bonus_categories SET name=?,description=?,sort_order=?,is_mandatory=?,drip_days=?,active=? WHERE id=?",
      [name, description, sort_order ?? 0, is_mandatory ?? 0, drip_days ?? 0, active ?? 1, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-categories/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM bonus_categories WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-categories/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE bonus_categories SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // ── Bonus Items ───────────────────────────────────────────
  app.get("/api/bonus-items/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_items WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });
  app.get("/api/bonus-items", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_items WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/bonus-items", auth, adminOnly, async (req, res) => {
    const { id, bonus_category_id, title, description, cover_image, content, download_url, sort_order, drip_days } = req.body;
    await pool.query("INSERT INTO bonus_items (id,bonus_category_id,title,description,cover_image,content,download_url,sort_order,drip_days) VALUES (?,?,?,?,?,?,?,?,?)",
      [id || null, bonus_category_id, title, description, cover_image, content, download_url, sort_order ?? 0, drip_days ?? 0]);
    res.json({ ok: true });
  });
  app.put("/api/bonus-items/:id", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, content, download_url, sort_order, drip_days, active } = req.body;
    await pool.query("UPDATE bonus_items SET title=?,description=?,cover_image=?,content=?,download_url=?,sort_order=?,drip_days=?,active=? WHERE id=?",
      [title, description, cover_image, content, download_url, sort_order ?? 0, drip_days ?? 0, active ?? 1, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-items/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM bonus_items WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-items/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE bonus_items SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // LIBRARY
  app.get("/api/images", (_r, res) => {
    try {
      const imgDir = path.join(PROJECT_ROOT, "public", "img");
      if (!fs.existsSync(imgDir)) return res.json([]);
      const files = fs.readdirSync(imgDir);
      const images = files.filter(file => /\.(png|jpe?g|gif|svg|webp)$/i.test(file));
      res.json(images.map(img => `/img/${img}`));
    } catch { res.status(500).json({ error: "Falha ao listar imagens" }); }
  });

  // Upload de e-book para public/e-books (salva em subpasta categoria/subcategoria)
  app.post("/api/upload/ebook", auth, adminOnly, uploadEbook.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
    // Monta URL relativa ao diretório public/e-books
    const relativePath = path.relative(ebooksDir, req.file.path).replace(/\\/g, "/");
    const url = `/e-books/${relativePath}`;
    res.json({ url, filename: req.file.filename });
  });

  // UPLOAD COMPROVANTE DE PAGAMENTO
  app.post("/api/upload/proof", auth, uploadProof.single("file"), (req, res) => {
    if (!req.file) return (res as any).status(400).json({ error: "Arquivo não enviado ou formato inválido" });
    const url = `/proofs/${req.file.filename}`;
    res.json({ url });
  });

  // Listar arquivos em public/e-books
  app.get("/api/ebooks-files", auth, (_r, res) => {
    try {
      if (!fs.existsSync(ebooksDir)) return res.json([]);
      const files = fs.readdirSync(ebooksDir);
      const pdfs = files.filter(f => /\.(pdf|PDF)$/.test(f));
      res.json(pdfs.map(f => ({ name: f, url: `/e-books/${f}` })));
    } catch { res.status(500).json({ error: "Falha ao listar e-books" }); }
  });

  // Deletar arquivo de e-book
  app.delete("/api/ebooks-files/:filename", auth, adminOnly, (req, res) => {
    try {
      const filepath = path.join(ebooksDir, req.params.filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Falha ao deletar arquivo" }); }
  });

  app.get("/api/categories/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM categories WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });

  app.get("/api/categories", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM categories WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/categories", auth, adminOnly, async (req, res) => {
    const { id: rid, name, description, sort_order, is_mandatory, drip_days } = req.body;
    const id = rid || randomUUID();
    await pool.query("INSERT INTO categories (id,name,description,sort_order,is_mandatory,drip_days,active) VALUES (?,?,?,?,?,?,1)",
      [id, name, description, sort_order || 0, is_mandatory || 0, drip_days || 0]);
    // Cria pasta da categoria em public/e-books
    const catDir = path.join(ebooksDir, slugify(name));
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
    res.status(201).json({ id });
  });
  app.put("/api/categories/:id", auth, adminOnly, async (req, res) => {
    const { name, description, sort_order, is_mandatory, drip_days, active } = req.body;
    await pool.query("UPDATE categories SET name=?,description=?,sort_order=?,is_mandatory=?,drip_days=?,active=? WHERE id=?",
      [name, description, sort_order, is_mandatory, drip_days, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/categories/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE categories SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/categories/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM categories WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  app.get("/api/subcategories", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM subcategories WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.get("/api/subcategories/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM subcategories WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/subcategories", auth, adminOnly, async (req, res) => {
    const { id: rid, category_id, name, description, sort_order, drip_days } = req.body;
    const id = rid || randomUUID();
    await pool.query("INSERT INTO subcategories (id,category_id,name,description,sort_order,drip_days,active) VALUES (?,?,?,?,?,?,1)",
      [id, category_id, name, description, sort_order || 0, drip_days || 0]);
    // Cria pasta da subcategoria dentro da pasta da categoria
    const [catRows]: any = await pool.query("SELECT name FROM categories WHERE id=?", [category_id]);
    if (catRows.length > 0) {
      const subDir = path.join(ebooksDir, slugify(catRows[0].name), slugify(name));
      if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    }
    res.status(201).json({ id });
  });
  app.put("/api/subcategories/:id", auth, adminOnly, async (req, res) => {
    const { category_id, name, description, sort_order, drip_days, active } = req.body;
    await pool.query("UPDATE subcategories SET category_id=?,name=?,description=?,sort_order=?,drip_days=?,active=? WHERE id=?",
      [category_id, name, description, sort_order, drip_days, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/subcategories/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE subcategories SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/subcategories/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM subcategories WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  app.get("/api/ebooks", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM ebooks WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/ebooks", auth, adminOnly, async (req, res) => {
    const { id: rid, category_id, subcategory_id, title, description, cover_image, content, download_url, sort_order, drip_days } = req.body;
    const id = rid || randomUUID();
    await pool.query("INSERT INTO ebooks (id,category_id,subcategory_id,title,description,cover_image,content,download_url,sort_order,drip_days,active) VALUES (?,?,?,?,?,?,?,?,?,?,1)",
      [id, category_id, subcategory_id || null, title, description, cover_image, content, download_url, sort_order || 0, drip_days || 0]);
    res.status(201).json({ id });
  });
  app.get("/api/ebooks/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM ebooks WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });

  app.put("/api/ebooks/:id", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, content, download_url, sort_order, drip_days, active } = req.body;
    await pool.query("UPDATE ebooks SET title=?,description=?,cover_image=?,content=?,download_url=?,sort_order=?,drip_days=?,active=? WHERE id=?",
      [title, description, cover_image, content, download_url, sort_order, drip_days, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/ebooks/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE ebooks SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/ebooks/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM ebooks WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });


  // BOTS & TIMELINES
  app.get("/api/bots", async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bots ORDER BY name");
    res.json(r);
  });
  app.post("/api/bots", auth, adminOnly, async (req, res) => {
    const { name, avatar, persona, region, is_active, role, is_online } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO bots (id,name,avatar,persona,region,is_active,role,is_online) VALUES (?,?,?,?,?,?,?,?)",
      [id, name, avatar, persona, region, is_active ?? 1, role, is_online ?? 0]);
    res.status(201).json({ id });
  });
  app.get("/api/timelines", async (_r, res) => {
    const [timelines]: any = await pool.query("SELECT * FROM timelines");
    const [blocks]: any = await pool.query("SELECT * FROM timeline_blocks ORDER BY sort_order");
    res.json(timelines.map((t: any) => ({
      ...t,
      blocks: blocks.filter((b: any) => b.timeline_id === t.id)
    })));
  });
  app.post("/api/timelines", auth, adminOnly, async (req, res) => {
    const { name, bot_id, is_active, page_route, trigger_type, blocks } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO timelines (id,name,bot_id,is_active,page_route,trigger_type) VALUES (?,?,?,?,?,?)",
      [id, name, bot_id, is_active ?? 0, page_route, trigger_type || "manual"]);
    if (Array.isArray(blocks)) {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        await pool.query("INSERT INTO timeline_blocks (id,timeline_id,bot_id,category,script,delay_ms,typing_time_ms,condition_type,sort_order) VALUES (?,?,?,?,?,?,?,?,?)",
          [randomUUID(), id, b.botId || b.bot_id, b.category, b.script, b.delayMs || 1000, b.typingTimeMs || 2000, b.conditionType || "time", i]);
      }
    }
    res.status(201).json({ id });
  });
  app.patch("/api/timelines/:id/toggle", auth, adminOnly, async (req, res) => {
    const [r]: any = await pool.query("SELECT is_active FROM timelines WHERE id=?", [req.params.id]);
    const cur = r[0]?.is_active;
    await pool.query("UPDATE timelines SET is_active=? WHERE id=?", [cur ? 0 : 1, req.params.id]);
    res.json({ is_active: !cur });
  });

  // STRIPE
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(req.body.amount * 100),
        currency: req.body.currency || "brl",
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: pi.client_secret });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // SOCIAL MEMBERS
  app.get("/api/social-members", (_r, res) => {
    try {
      const dir = path.join(PROJECT_ROOT, "socialmembers");
      res.json({
        abbreviations: fs.readFileSync(path.join(dir, "500 abreviações.txt"), "utf-8").split("\n").filter(Boolean),
        names: fs.readFileSync(path.join(dir, "500 nomes próprios.txt"), "utf-8").split("\n").filter(Boolean),
        surnames: fs.readFileSync(path.join(dir, "500 sobrenomes.txt"), "utf-8").split("\n").filter(Boolean),
      });
    } catch { res.status(500).json({ error: "Falha" }); }
  });


  // ── NAVEGADOR DE ARQUIVOS HTML (e-books) ──────────────────
  app.get("/api/ebooks-files", auth, adminOnly, async (_req, res) => {
    try {
      const ebooksRoot = path.join(PROJECT_ROOT, "public", "e-books");

      function readDir(dir: string, base: string): any[] {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir)
          .filter(name => !name.startsWith('.'))
          .map(name => {
            const fullPath = path.join(dir, name);
            const relPath = path.join(base, name).replace(/\\/g, '/');
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              return { type: 'folder', name, path: relPath, children: readDir(fullPath, relPath) };
            }
            if (name.toLowerCase().endsWith('.html')) {
              return { type: 'file', name, path: '/e-books/' + relPath };
            }
            return null;
          })
          .filter(Boolean);
      }

      const tree = readDir(ebooksRoot, '');
      res.json(tree);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // TICKETS
  app.get("/api/tickets", auth, async (req: any, res) => {
    try {
      const isAdmin = req.user.role === 'ADMIN';
      const [rows]: any = isAdmin
        ? await pool.query(`SELECT t.*, u.name as user_name, u.email as user_email,
            (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id AND m.is_admin = 0 AND m.is_read = 0) as unread_count
            FROM tickets t LEFT JOIN users u ON u.id = t.user_id ORDER BY t.updated_at DESC`)
        : await pool.query(`SELECT t.*,
            (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id AND m.is_admin = 1 AND m.is_read = 0) as unread_count
            FROM tickets t WHERE t.user_id=? ORDER BY t.updated_at DESC`, [req.user.id]);
      res.json(rows);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/tickets", auth, async (req: any, res) => {
    try {
      const { subject, category, priority, message } = req.body;
      if (!subject?.trim() || !message?.trim()) return res.status(400).json({ error: "Assunto e mensagem são obrigatórios" });
      const id = randomUUID();
      await pool.query(
        "INSERT INTO tickets (id, user_id, subject, category, priority, status, created_at, updated_at) VALUES (?,?,?,?,?,'aberto',NOW(),NOW())",
        [id, req.user.id, subject.trim(), category || 'outro', priority || 'media']
      );
      const msgId = randomUUID();
      await pool.query(
        "INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_admin, created_at) VALUES (?,?,?,?,0,NOW())",
        [msgId, id, req.user.id, message.trim()]
      );
      res.status(201).json({ id, subject, status: 'aberto' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/tickets/:id/messages", auth, async (req: any, res) => {
    try {
      const [ticket]: any = await pool.query("SELECT * FROM tickets WHERE id=?", [req.params.id]);
      if (!ticket[0]) return res.status(404).json({ error: "Ticket não encontrado" });
      if (req.user.role !== 'ADMIN' && ticket[0].user_id !== req.user.id) return res.status(403).json({ error: "Acesso negado" });
      const [msgs]: any = await pool.query(
        "SELECT m.*, u.name as user_name FROM ticket_messages m LEFT JOIN users u ON u.id = m.user_id WHERE m.ticket_id=? ORDER BY m.created_at ASC",
        [req.params.id]
      );
      res.json(msgs);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/tickets/:id/messages", auth, async (req: any, res) => {
    try {
      const { message } = req.body;
      if (!message?.trim()) return res.status(400).json({ error: "Mensagem vazia" });
      const [ticket]: any = await pool.query("SELECT * FROM tickets WHERE id=?", [req.params.id]);
      if (!ticket[0]) return res.status(404).json({ error: "Ticket não encontrado" });
      if (req.user.role !== 'ADMIN' && ticket[0].user_id !== req.user.id) return res.status(403).json({ error: "Acesso negado" });
      const isAdmin = req.user.role === 'ADMIN' ? 1 : 0;
      await pool.query(
        "INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_admin, created_at) VALUES (?,?,?,?,?,NOW())",
        [randomUUID(), req.params.id, req.user.id, message.trim(), isAdmin]
      );
      await pool.query("UPDATE tickets SET updated_at=NOW(), status=? WHERE id=?",
        [isAdmin ? 'em_atendimento' : 'aberto', req.params.id]
      );
      res.json({ ok: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/tickets/:id/status", auth, async (req: any, res) => {
    try {
      const { status } = req.body;
      const allowed = ['aberto', 'em_atendimento', 'resolvido', 'fechado'];
      if (!allowed.includes(status)) return res.status(400).json({ error: "Status inválido" });
      const [ticket]: any = await pool.query("SELECT * FROM tickets WHERE id=?", [req.params.id]);
      if (!ticket[0]) return res.status(404).json({ error: "Ticket não encontrado" });
      if (req.user.role !== 'ADMIN' && ticket[0].user_id !== req.user.id) return res.status(403).json({ error: "Acesso negado" });
      await pool.query("UPDATE tickets SET status=?, updated_at=NOW() WHERE id=?", [status, req.params.id]);
      res.json({ ok: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // TRACK CLICK
  app.post("/api/track-click", async (req, res) => {
    await pool.query("INSERT INTO affiliate_clicks (id,affiliate_id,ip,user_agent,landing_page) VALUES (?,?,?,?,?)",
      [randomUUID(), req.body.affiliateId, req.ip, req.headers["user-agent"], req.body.landingPage]);
    res.json({ ok: true });
  });

  // VITE / static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    // Serve e-books estáticos do build (dist/e-books) com prefixo explícito
    // Garante que os HTML dos e-books do Vite sejam encontrados antes de public/e-books
    app.use("/e-books", express.static(path.join(PROJECT_ROOT, "dist", "e-books")));
    // Serve uploads dinâmicos (comprovantes, e-books enviados via upload, imagens)
    app.use(express.static(path.join(PROJECT_ROOT, "public")));
    // Serve assets buildados (JS, CSS, index.html, etc)
    app.use(express.static(path.join(PROJECT_ROOT, "dist")));
    app.get("/{*splat}", (_r, res) => res.sendFile(path.join(PROJECT_ROOT, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`[Server] http://localhost:${PORT}`));
}

startServer();
