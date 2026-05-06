import React, { useState, useEffect, useCallback } from 'react';
import * as api from './api.js';

// ─── Disclaimer Modal ───────────────────────────────────────────────────────
const DISCLAIMER_KEY = 'bomj_disclaimer_accepted';

function DisclaimerModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>⚠️ ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ</h2>
        <div className="legal-text">
          <p><strong>Настоящий сайт является исключительно шуточным/пародийным проектом (сатирическим произведением искусства) и не осуществляет реальную финансовую, посредническую, трудовую или иную регулируемую деятельность.</strong></p>
          <br />
          <p><span className="law">1. Ст. 1270 ГК РФ</span> — Сайт является результатом творческой деятельности (пародия/карикатура). Любые совпадения с реальными сервисами случайны.</p>
          <br />
          <p><span className="law">2. Ст. 1062 ГК РФ</span> — Требования, связанные с организацией игр/пари/финансовых операций на сайте, не подлежат судебной защите, так как сайт носит развлекательный характер.</p>
          <br />
          <p><span className="law">3. ФЗ № 54-ФЗ (ККТ)</span> — Сайт не осуществляет приём денежных средств за товары/работы/услуги. Все финансовые операции (USDT, Tron) являются частью игровой механики и не имеют реальной юридической силы.</p>
          <br />
          <p><span className="law">4. ФЗ № 152-ФЗ (О персональных данных)</span> — Номер телефона используется исключительно для идентификации в рамках игрового процесса. Сайт не собирает, не хранит и не передаёт третьим лицам персональные данные. Вы можете удалить аккаунт в любой момент, написав администратору.</p>
          <br />
          <p><span className="law">5. Ст. 5.61 КоАП РФ / Ст. 128.1 УК РФ</span> — Использование ненормативной лексики, оскорблений, клеветы на сайте и в его названии является частью художественного замысла и не направлено на унижение чьей-либо чести и достоинства.</p>
          <br />
          <p><span className="law">6. Ст. 14.1 КоАП РФ</span> — Сайт не осуществляет предпринимательскую деятельность. Все взаимодействия между пользователями происходят на их собственный страх и риск и не являются реальными трудовыми/гражданско-правовыми отношениями.</p>
          <br />
          <p><strong>Администрация сайта не несёт ответственности:</strong></p>
          <p>— за любые убытки, прямые или косвенные, связанные с использованием сайта;</p>
          <p>— за действия пользователей, совершённые на основе информации с сайта;</p>
          <p>— за содержание задач, созданных пользователями;</p>
          <p>— за невозможность использования сайта по техническим причинам.</p>
          <br />
          <p style={{ color: '#ff7043', fontWeight: 700, textAlign: 'center' }}>Используя сайт, вы подтверждаете, что:
          — осознаёте его шуточный характер;
          — не имеете претензий к администрации;
          — вам есть 18 лет (или вы смотрите на это как на мем).</p>
        </div>
        <button className="btn btn-primary" onClick={onClose}>
          Я всё понял. Погнали.
        </button>
      </div>
    </div>
  );
}

function DisclaimerFooter({ onShow }) {
  return (
    <div className="disclaimer-footer">
      <button onClick={onShow}>Юридическая информация / Отказ от ответственности</button>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return <div className={`toast ${type}`}>{message}</div>;
}

// ─── Auth Screen ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('worker');
  const [wallet, setWallet] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = isLogin
        ? await api.login(phone)
        : await api.register(phone, role, wallet);
      localStorage.setItem('userId', data.user.id.toString());
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <div className="logo">💀</div>
        <h1 style={{ textAlign: 'center', color: '#00e676', fontSize: 26, marginBottom: 8 }}>
          БОМЖ-СЕРВИС
        </h1>
        <p style={{ textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 16 }}>
          {isLogin ? 'Заходи, брат' : 'Регайся, работяга'}
        </p>

        {!isLogin && (
          <div className="role-toggle">
            <button
              className={`btn btn-small ${role === 'worker' ? 'active btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('worker')}
            >
              🛠 Работяга
            </button>
            <button
              className={`btn btn-small ${role === 'customer' ? 'active btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('customer')}
            >
              💰 Заказчик
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          {!isLogin && role === 'customer' && (
            <>
              <input
                className="input"
                type="text"
                placeholder="Tron кошелёк (TR7...)"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
              />
              <p className="wallet-hint">С этого кошелька будут списываться USDT за задачи</p>
            </>
          )}

          <button type="submit" className="btn btn-primary">
            {isLogin ? 'Войти' : 'Погнали'}
          </button>
        </form>

        {error && <p style={{ color: '#d32f2f', textAlign: 'center', marginTop: 8 }}>{error}</p>}

        <button
          className="btn btn-small btn-secondary"
          style={{ marginTop: 8 }}
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
        >
          {isLogin ? 'Нет аккаунта? Регайся' : 'Уже есть? Заходи'}
        </button>
      </div>
    </div>
  );
}

// ─── Customer View ───────────────────────────────────────────────────────────
function CustomerView({ user, onLogout, showDisclaimer, onShowDisclaimer }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      setTasks(await api.getTasks());
    } catch (e) {
      setToast({ m: e.message, t: 'error' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createTask(title, desc);
      setTitle('');
      setDesc('');
      setToast({ m: '✅ Задача создана', t: 'success' });
      load();
    } catch (e) {
      setToast({ m: e.message, t: 'error' });
    }
  };

  const cancel = async (id) => {
    try {
      await api.cancelTask(id);
      setToast({ m: '🗑 Отменено', t: 'success' });
      load();
    } catch (e) {
      setToast({ m: e.message, t: 'error' });
    }
  };

  const statusBadge = (s) => {
    const map = { open: 'Открыта', assigned: 'В работе', done: 'Готова', paid: 'Оплачено' };
    return <span className={`badge badge-${s}`}>{map[s] || s}</span>;
  };

  return (
    <div className="container">
      <Toast message={toast?.m} type={toast?.t} onClose={() => setToast(null)} />

      <div className="header">
        <h1>💀 БОМЖ-СЕРВИС</h1>
        <div className="sub">Заказчик · {user.phone}</div>
      </div>

      <form className="create-form" onSubmit={create}>
        <input
          className="input"
          placeholder="Название задачи"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Описание (не обязательно)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">➕ Создать задачу · 5 USDT</button>
      </form>

      <div className="task-list">
        {tasks.length === 0 && (
          <p style={{ textAlign: 'center', color: '#444', marginTop: 40 }}>
            Задач пока нет. Создай первую.
          </p>
        )}
        {tasks.map((t) => (
          <div className="card" key={t.id}>
            <div className="card-title">{t.title}</div>
            {t.description && <div className="card-desc">{t.description}</div>}
            <div className="card-meta">
              <span>{statusBadge(t.status)}</span>
              <span>{t.price_usdt} USDT</span>
            </div>
            {t.worker_phone && (
              <div className="card-meta" style={{ marginTop: 6 }}>
                <span>Работяга: {t.worker_phone}</span>
              </div>
            )}
            {t.tx_id && (
              <div className="card-meta" style={{ marginTop: 6 }}>
                <span style={{ color: '#00e676', fontSize: 11 }}>TX: {t.tx_id}</span>
              </div>
            )}
            {t.status === 'open' && (
              <div className="task-actions">
                <button className="btn btn-small btn-danger" onClick={() => cancel(t.id)}>
                  Отменить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <DisclaimerFooter onShow={onShowDisclaimer} />
      <div className="bottom-bar">
        <button className="btn btn-small btn-secondary" onClick={onLogout}>Выйти</button>
      </div>
      {showDisclaimer && <DisclaimerModal onClose={() => onShowDisclaimer(false)} />}
    </div>
  );
}

// ─── Worker View ─────────────────────────────────────────────────────────────
function WorkerView({ user, onLogout, showDisclaimer, onShowDisclaimer }) {
  const [tasks, setTasks] = useState([]);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      setTasks(await api.getTasks());
    } catch (e) {
      setToast({ m: e.message, t: 'error' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const assign = async (id) => {
    try {
      await api.assignTask(id);
      setToast({ m: '✅ Задача твоя! Погнали', t: 'success' });
      load();
    } catch (e) {
      setToast({ m: e.message, t: 'error' });
    }
  };

  const complete = async (id) => {
    try {
      const res = await api.completeTask(id);
      setToast({ m: res.message || '✅ Готово! USDT ушли', t: 'success' });
      load();
    } catch (e) {
      setToast({ m: e.message, t: 'error' });
    }
  };

  const statusBadge = (s) => {
    const map = { open: 'Открыта', assigned: 'В работе', done: 'Готова', paid: 'Оплачено' };
    return <span className={`badge badge-${s}`}>{map[s] || s}</span>;
  };

  return (
    <div className="container">
      <Toast message={toast?.m} type={toast?.t} onClose={() => setToast(null)} />

      <div className="header">
        <h1>💀 БОМЖ-СЕРВИС</h1>
        <div className="sub">Работяга · {user.phone}</div>
      </div>

      <div className="task-list">
        {tasks.length === 0 && (
          <p style={{ textAlign: 'center', color: '#444', marginTop: 40 }}>
            Задач пока нет. Жди.
          </p>
        )}
        {tasks.map((t) => (
          <div className="card" key={t.id}>
            <div className="card-title">{t.title}</div>
            {t.description && <div className="card-desc">{t.description}</div>}
            <div className="card-meta">
              <span>{statusBadge(t.status)}</span>
              <span>{t.price_usdt} USDT</span>
            </div>
            <div className="card-meta" style={{ marginTop: 4 }}>
              <span>Заказчик: {t.customer_phone}</span>
            </div>
            {t.tx_id && (
              <div className="card-meta" style={{ marginTop: 6 }}>
                <span style={{ color: '#00e676', fontSize: 11 }}>TX: {t.tx_id}</span>
              </div>
            )}
            <div className="task-actions">
              {t.status === 'open' && (
                <button className="btn btn-small btn-primary" onClick={() => assign(t.id)}>
                  👊 Взял
                </button>
              )}
              {t.status === 'assigned' && t.worker_id === user.id && (
                <button className="btn btn-small btn-primary" onClick={() => complete(t.id)}>
                  ✅ Выполнено
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <DisclaimerFooter onShow={onShowDisclaimer} />
      <div className="bottom-bar">
        <button className="btn btn-small btn-secondary" onClick={onLogout}>Выйти</button>
      </div>
      {showDisclaimer && <DisclaimerModal onClose={() => onShowDisclaimer(false)} />}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid) {
      api.getMe()
        .then((u) => setUser(u))
        .catch(() => { localStorage.removeItem('userId'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // Show disclaimer on first visit
    if (!localStorage.getItem(DISCLAIMER_KEY)) {
      setShowDisclaimer(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <p style={{ color: '#00e676', fontSize: 20 }}>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={(u) => setUser(u)} showDisclaimer={showDisclaimer} onShowDisclaimer={setShowDisclaimer} />;
  }

  if (user.role === 'customer') {
    return <CustomerView user={user} onLogout={() => { localStorage.removeItem('userId'); setUser(null); }} showDisclaimer={showDisclaimer} onShowDisclaimer={setShowDisclaimer} />;
  }

  return <WorkerView user={user} onLogout={() => { localStorage.removeItem('userId'); setUser(null); }} showDisclaimer={showDisclaimer} onShowDisclaimer={setShowDisclaimer} />;
}
