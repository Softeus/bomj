import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4173',
    'https://bomj-client.onrender.com',
  ],
}));
app.use(express.json());

// ─── Auth ────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { phone, role, tron_wallet } = req.body;
  if (!phone || !/^\+?\d{10,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Нормальный номер введи, брат' });
  }
  if (!role || !['worker', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'Ты кто? Работяга или заказчик?' });
  }
  if (role === 'customer' && !tron_wallet) {
    return res.status(400).json({ error: 'Заказчику нужен Tron кошелёк' });
  }
  try {
    const stmt = db.prepare('INSERT INTO users (phone, role, tron_wallet) VALUES (?, ?, ?)');
    const info = stmt.run(phone, role, tron_wallet || '');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json({ user, token: user.id.toString() });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Такой номер уже есть. Зайди по-нормальному.' });
    }
    res.status(500).json({ error: 'Всё упало. Пиши админу.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Номер телефона нужен' });
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) return res.status(404).json({ error: 'Нет такого. Регайся.' });
  res.json({ user, token: user.id.toString() });
});

// ─── Auth middleware ─────────────────────────────────────────────────────────
function auth(req, res, next) {
  const uid = req.headers['x-user-id'];
  if (!uid) return res.status(401).json({ error: 'Кто ты такой?' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  if (!user) return res.status(401).json({ error: 'Ты не зареган.' });
  req.user = user;
  next();
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
app.get('/api/tasks', auth, (req, res) => {
  let tasks;
  if (req.user.role === 'worker') {
    tasks = db.prepare(`
      SELECT t.*, u.phone as customer_phone
      FROM tasks t JOIN users u ON t.customer_id = u.id
      WHERE t.status = 'open' OR t.worker_id = ?
      ORDER BY t.created_at DESC
    `).all(req.user.id);
  } else {
    tasks = db.prepare(`
      SELECT t.*, u.phone as worker_phone
      FROM tasks t LEFT JOIN users u ON t.worker_id = u.id
      WHERE t.customer_id = ?
      ORDER BY t.created_at DESC
    `).all(req.user.id);
  }
  res.json(tasks);
});

app.post('/api/tasks', auth, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Ты не заказчик. Задачи создавать нельзя.' });
  }
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Название задачи введи' });
  const stmt = db.prepare('INSERT INTO tasks (title, description, customer_id) VALUES (?, ?, ?)');
  const info = stmt.run(title, description || '', req.user.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.json(task);
});

app.post('/api/tasks/:id/assign', auth, (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Ты не работяга.' });
  }
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND status = ?').get(req.params.id, 'open');
  if (!task) return res.status(404).json({ error: 'Задачи нет или её уже взяли.' });
  db.prepare('UPDATE tasks SET status = ?, worker_id = ? WHERE id = ?')
    .run('assigned', req.user.id, req.params.id);
  res.json({ ok: true });
});

app.post('/api/tasks/:id/done', auth, (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Ты не работяга.' });
  }
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND worker_id = ? AND status = ?')
    .get(req.params.id, req.user.id, 'assigned');
  if (!task) return res.status(404).json({ error: 'Не твоя задача или уже сделана.' });

  // ─── Simulate Tron USDT transfer ──────────────────────────────────────────
  const customer = db.prepare('SELECT * FROM users WHERE id = ?').get(task.customer_id);
  const tx_id = `tron_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  db.prepare(`
    UPDATE tasks SET status = 'paid', done_at = datetime('now'), tx_id = ? WHERE id = ?
  `).run(tx_id, req.params.id);

  res.json({
    ok: true,
    tx_id,
    message: `✅ ${task.price_usdt} USDT отправлено заказчиком ${customer.phone} (кошелёк: ${customer.tron_wallet})`,
  });
});

app.post('/api/tasks/:id/cancel', auth, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Нет такой.' });
  if (task.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Не твоя задача.' });
  }
  if (task.status !== 'open') {
    return res.status(400).json({ error: 'Уже взяли, нельзя отменить.' });
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── User info ───────────────────────────────────────────────────────────────
app.get('/api/me', auth, (req, res) => {
  res.json(req.user);
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚬 Бомж-сервер дымит на порту ${PORT}`);
});
