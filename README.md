# 💀 БОМЖ-СЕРВИС

Full Stack приложение: React + Express + SQLite.  
Регистрация по номеру телефона, два типа пользователей, задачи за 5 USDT в Tron сети.

## 🚀 Быстрый старт локально

```bash
# Терминал 1 — сервер
cd server
npm install
npm start          # http://localhost:4000

# Терминал 2 — клиент
cd client
npm install
npm run dev        # http://localhost:3000
```

## 🌐 Деплой на Render.com (бесплатно)

### Способ 1 — Blueprint (одна кнопка)

1. Создай репозиторий на GitHub и запушь этот проект
2. Зайди на https://dashboard.render.com/blueprints
3. Нажми **New Blueprint Instance** → Connect repo
4. Render сам прочитает [`render.yaml`](render.yaml) и поднимет оба сервиса

### Способ 2 — Вручную

**Бэкенд:**
1. Dashboard → New Web Service → Connect repo
2. Name: `bomj-server`, Root Directory: `server`
3. Build: `npm install`, Start: `node index.js`
4. Free plan → Deploy

**Фронтенд:**
1. Dashboard → New Static Site → Connect repo
2. Name: `bomj-client`, Root Directory: `client`
3. Build: `npm install && npm run build`
4. Publish: `dist`
5. Environment Variable: `VITE_API_URL=https://bomj-server.onrender.com/api`

## 📱 Что внутри

- **Регистрация** по номеру телефона (без симки не пускает)
- **Роли**: работяга (видит задачи) / заказчик (создаёт задачи)
- **Оплата**: 5 USDT автоматически при нажатии "Выполнено" (симуляция Tron)
- **Дизайн**: чёрный фон, зелёный акцент, крупные кнопки
