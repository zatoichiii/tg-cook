import { useEffect, useState } from 'react';

function DishCard({ dish, onDetail, inCart, onAddToCart }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col items-center hover:shadow-lg transition cursor-pointer relative group">
      <img src={dish.image || '/no-image.png'} alt={dish.name} className="w-28 h-28 object-cover rounded-xl mb-2 shadow-sm group-hover:scale-105 transition-transform" />
      <div className="font-semibold text-base mb-1 text-center line-clamp-2 min-h-[2.5em]">{dish.name}</div>
      <div className="text-primary font-bold text-lg mb-2">{dish.price ? `${dish.price} ₽` : '—'}</div>
      <button
        className={`w-full py-2 rounded-xl text-base font-medium transition-all ${inCart ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white active:bg-primary-dark hover:bg-primary-dark'}`}
        onClick={() => onAddToCart(dish)}
        disabled={inCart}
      >
        {inCart ? 'В корзине' : 'В корзину'}
      </button>
      <button className="text-primary underline text-xs mt-1" onClick={() => onDetail(dish)}>
        Подробнее
      </button>
    </div>
  );
}

function AddDishModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', image: '', price: '', description: '' });
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await onAdd(form);
    setForm({ name: '', image: '', price: '', description: '' });
    setLoading(false);
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fadeIn" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-center">Добавить блюдо</h2>
        <input name="name" required placeholder="Название" className="input mb-2" value={form.name} onChange={handleChange} />
        <input name="image" placeholder="URL картинки" className="input mb-2" value={form.image} onChange={handleChange} />
        <input name="price" required placeholder="Цена" type="number" min="0" className="input mb-2" value={form.price} onChange={handleChange} />
        <textarea name="description" placeholder="Описание" className="input mb-2" value={form.description} onChange={handleChange} />
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-xl w-full font-semibold text-base hover:bg-primary-dark transition" disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
          <button type="button" className="bg-gray-100 px-4 py-2 rounded-xl w-full text-base" onClick={onClose} disabled={loading}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

function CartModal({ open, onClose, cart, onOrder, balance }) {
  const total = cart.reduce((sum, d) => sum + Number(d.price || 0), 0);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 text-center">Корзина</h2>
        {cart.length === 0 ? (
          <div className="text-gray-400 mb-4 text-center">Корзина пуста</div>
        ) : (
          <ul className="mb-4 divide-y divide-gray-100">
            {cart.map((dish, i) => (
              <li key={i} className="py-2 flex justify-between items-center">
                <span className="font-medium text-sm">{dish.name}</span>
                <span className="font-bold text-primary">{dish.price} ₽</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mb-2 text-center">Итого: <b>{total} ₽</b></div>
        <div className="mb-4 text-center">Баланс: <b>{balance} ₽</b></div>
        <div className="flex gap-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-xl w-full font-semibold text-base hover:bg-green-600 disabled:bg-gray-300 transition"
            onClick={onOrder}
            disabled={cart.length === 0 || total > balance}
          >
            Оформить заказ
          </button>
          <button className="bg-gray-100 px-4 py-2 rounded-xl w-full text-base" onClick={onClose}>Закрыть</button>
        </div>
        {total > balance && <div className="text-red-500 mt-2 text-center">Недостаточно средств</div>}
      </div>
    </div>
  );
}

export default function Home() {
  const [dishes, setDishes] = useState([]);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [detail, setDetail] = useState(null);

  // Загрузка данных
  const fetchData = async () => {
    const res = await fetch('/api/sheets');
    const json = await res.json();
    console.log('Fetched data:', json); // Логируем весь ответ
    if (json.data) {
      console.log('Fetched dishes array:', json.data);
      json.data.forEach((d, i) => console.log('Dish', i, d));
      setDishes(json.data);
    }
    if (json.balanceA2 !== undefined) setBalance(Number(json.balanceA2));
    if (json.error) setError(json.error);
  };
  useEffect(() => { fetchData(); }, []);

  // Добавление блюда
  const handleAddDish = async (form) => {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.data) setDishes(json.data.filter(d => d.name && d.price));
    if (json.balanceA2 !== undefined) setBalance(Number(json.balanceA2));
  };

  // Корзина: добавить блюдо (только уникальные)
  const handleAddToCart = (dish) => {
    if (!cart.find(d => d.name === dish.name)) setCart([...cart, dish]);
  };
  // Корзина: оформить заказ
  const handleOrder = () => {
    // Списываем баланс (на фронте)
    const total = cart.reduce((sum, d) => sum + Number(d.price || 0), 0);
    setBalance(b => b - total);
    // TODO: отправить заказ через Telegram WebApp API
    alert('Заказ отправлен!\n' + cart.map(d => `${d.name} — ${d.price}₽`).join('\n'));
    setCart([]);
    setCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg font-sans pb-24 relative">
      <header className="flex flex-col items-center justify-center px-4 pt-6 pb-2 bg-white/80 backdrop-blur shadow-none sticky top-0 z-10">
        <div className="text-2xl font-extrabold mb-1 text-primary tracking-tight">{balance} ₽</div>
        <div className="text-xs text-gray-400 mb-2">Ваш баланс</div>
        <div className="flex gap-2 w-full justify-center">
          <button onClick={() => setAddOpen(true)} className="bg-accent text-white px-4 py-2 rounded-xl font-semibold text-base shadow-card active:scale-95 transition">Добавить блюдо</button>
        </div>
      </header>
      <main className="max-w-md mx-auto px-2 mt-4">
        {error && <div className="text-red-500 mb-4 text-center">Ошибка: {error}</div>}
        <div className="grid grid-cols-2 gap-4">
          {dishes.map((dish, i) => (
            <DishCard
              key={i}
              dish={dish}
              onDetail={setDetail}
              inCart={!!cart.find(d => d.name === dish.name)}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full shadow-card w-16 h-16 flex items-center justify-center text-3xl active:scale-95 transition z-50"
        style={{ boxShadow: '0 8px 32px 0 rgba(37,99,235,0.18)' }}
      >
        🛒
        {cart.length > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{cart.length}</span>}
      </button>
      <AddDishModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddDish} />
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onOrder={handleOrder} balance={balance} />
      {/* TODO: Детальная страница блюда (модалка или отдельный роут) */}
    </div>
  );
}

// Tailwind input style
// Вставьте в globals.css:
// .input { @apply w-full border rounded-xl px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary; }
// .animate-fadeIn { @apply animate-fadeIn; }