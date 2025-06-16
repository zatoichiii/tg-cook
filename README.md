# Next.js Google Sheets Telegram WebApp

Этот проект — Telegram WebApp на Next.js с интеграцией Google Sheets через API. Подходит для деплоя на Netlify/Vercel и безопасной работы с сервисным аккаунтом Google.

## Запуск локально

1. Установи зависимости:
   ```bash
   npm install
   ```
2. Создай файл `.env.local` в корне и добавь:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your_google_sheet_id
   ```
3. Запусти проект:
   ```bash
   npm run dev
   ```

## Структура

- `/pages/index.jsx` — фронтенд для WebView
- `/pages/api/sheet.js` — API-роут для работы с Google Sheets

## Деплой

- Для Netlify/Vercel: добавь переменные окружения в настройках проекта.
- Build command: `next build`
- Publish directory: `.next` (или `out` для next export)

---

## Старые файлы

- `vite.config.js`, `index.html`, папка `src/` больше не используются.

## Features

- Modern React application with animations
- Integration with Telegram Web App
- Google Sheets integration for recipe data
- Responsive design with Tailwind CSS
- Beautiful animations with Framer Motion

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
VITE_SHEET_ID=your_google_sheet_id
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
VITE_GOOGLE_PRIVATE_KEY=your_private_key
```

3. Set up Google Sheets:
   - Create a new Google Sheet
   - Share it with your service account email
   - Add the following columns: name, image, price, description
   - Put the balance in cell A1

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Google Sheets Setup

1. Go to Google Cloud Console
2. Create a new project
3. Enable Google Sheets API
4. Create a service account
5. Download the service account credentials
6. Share your Google Sheet with the service account email

## Telegram Bot Setup

1. Create a new bot with @BotFather
2. Enable Web App feature
3. Set the Web App URL to your deployed application URL
4. Share the bot link with users

## Development

The application uses:
- Vite for fast development
- React for UI
- Tailwind CSS for styling
- Framer Motion for animations
- Google Sheets API for data storage
- Telegram Web App SDK for bot integration

## Tailwind CSS

Если нужен Tailwind CSS, следуй официальной инструкции для Next.js: https://tailwindcss.com/docs/guides/nextjs 

## Пример .env.local

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id
```

## Миграция с Vite/React

- Все старые файлы из src/ и конфиги Vite удалены.
- Теперь используется Next.js (pages, api routes).
- Для стилей можно использовать Tailwind CSS (см. выше). 

## Стартовые файлы Next.js

- /pages/index.jsx — основной frontend
- /pages/api/sheet.js — API для Google Sheets 

## После изменений

- Не забудь выполнить `npm install` для обновления зависимостей! 

## Документация

- Next.js: https://nextjs.org/docs
- Google Sheets API (google-spreadsheet): https://theoephraim.github.io/node-google-spreadsheet/ 

## Вопросы и поддержка

Если что-то не работает — создай issue или напиши в чат! 