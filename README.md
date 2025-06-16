# TG Cook - Telegram Recipe Bot

A modern Telegram bot with a web view interface that displays recipes from a Google Sheet.

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