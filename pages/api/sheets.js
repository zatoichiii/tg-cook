import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY);
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const cells = await sheet.loadCells('A2');
      const balanceA2 = sheet.getCellByA1('A2').value;
      console.log('Balance in A2:', balanceA2);
      const rows = await sheet.getRows();
      console.log('RAW ROWS:', rows.map(r => r._rawData));
      console.log('ROW OBJECTS:', rows.map(r => r.toObject()));
      const mapped = rows.map(row => row.toObject());
      console.log('MAPPED:', mapped);
      const data = mapped.filter(d => d.name && d.price);
      console.log('FILTERED:', data);
      res.status(200).json({ data, balanceA2 });
    } else if (req.method === 'POST') {
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const { name, image, price, description } = req.body;
      await sheet.addRow({ name, image, price, description });
      // Получаем баланс и блюда после добавления
      await sheet.loadCells('A2');
      const balanceA2 = sheet.getCellByA1('A2').value;
      const rows = await sheet.getRows();
      console.log('RAW ROWS:', rows.map(r => r._rawData));
      console.log('ROW OBJECTS:', rows.map(r => r.toObject()));
      const mapped = rows.map(row => row.toObject());
      console.log('MAPPED:', mapped);
      const data = mapped.filter(d => d.name && d.price);
      console.log('FILTERED:', data);
      res.status(200).json({ data, balanceA2 });
    } else if (req.method === 'PATCH') {
      // Списание баланса при заказе
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      await sheet.loadCells('A2');
      const cell = sheet.getCellByA1('A2');
      let balance = Number(cell.value);
      const { total, items } = req.body;
      if (typeof total !== 'number' || isNaN(total) || total <= 0) {
        return res.status(400).json({ error: 'Некорректная сумма заказа' });
      }
      if (balance < total) {
        return res.status(400).json({ error: 'Недостаточно средств' });
      }
      balance -= total;
      cell.value = balance;
      await sheet.saveUpdatedCells();
      // Отправка сообщения в Telegram
      try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID && Array.isArray(items)) {
          const orderText = `Новый заказ!\n` +
            items.map(d => `${d.name} — ${d.price} Баллов`).join('\n') +
            `\nСумма: ${total} Баллов`;
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: orderText,
            }),
          });
        }
      } catch (e) {
        console.error('Ошибка отправки в Telegram:', e);
      }
      res.status(200).json({ balance });
    } else if (req.method === 'DELETE') {
      // Удаление блюда по имени
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Не указано имя блюда' });
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('name') === name);
      if (!row) return res.status(404).json({ error: 'Блюдо не найдено' });
      await row.delete();
      // Получаем обновлённые блюда и баланс
      await sheet.loadCells('A2');
      const balanceA2 = sheet.getCellByA1('A2').value;
      const updatedRows = await sheet.getRows();
      const mapped = updatedRows.map(r => r.toObject());
      const data = mapped.filter(d => d.name && d.price);
      res.status(200).json({ data, balanceA2 });
    }
  } catch (error) {
    console.error('GOOGLE SHEETS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}