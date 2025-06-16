import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebApp } from '@twa-dev/sdk';
import { GoogleSpreadsheet } from 'google-spreadsheet';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Telegram Web App
    WebApp.ready();
    WebApp.expand();

    // Load data from Google Sheets
    const loadData = async () => {
      try {
        const doc = new GoogleSpreadsheet(import.meta.env.VITE_SHEET_ID);
        await doc.useServiceAccountAuth({
          client_email: import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY,
        });
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        // Get balance from A1
        const balanceCell = await sheet.loadCells('A1');
        setBalance(balanceCell.getCellByA1('A1').value);

        // Get recipes
        const recipesData = rows.map(row => ({
          name: row.get('name'),
          image: row.get('image'),
          price: row.get('price'),
          description: row.get('description'),
        }));

        setRecipes(recipesData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Balance</h2>
          <p className="text-3xl font-bold text-green-600">${balance}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.name}</h3>
                  <p className="text-gray-600 mb-2">{recipe.description}</p>
                  <p className="text-lg font-bold text-green-600">${recipe.price}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default App; 