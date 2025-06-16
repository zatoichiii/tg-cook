import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
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
    }
  } catch (error) {
    console.error('GOOGLE SHEETS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}