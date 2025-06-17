import { useEffect, useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

console.log('GOOGLE_PRIVATE_KEY:', process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY);
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('GOOGLE_SHEET_ID:', process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID);

function DishCard({ dish, onDetail, inCart, onAddToCart }) {
  return (
    <motion.div
      className="dish-card"
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="dish-image-wrap">
        <img src={dish.image || '/no-image.png'} alt={dish.name} />
        {dish.type && <span className="dish-type-badge">{dish.type}</span>}
      </div>
      <div className="name">{dish.name}</div>
      <div className="price-row">
        <div className="price">{dish.price ? `${dish.price} Баллов` : '—'}</div>
        <button className="fav-btn" title="В избранное"><Star size={18} /></button>
      </div>
      <motion.button
        className={inCart ? 'add' : 'add'}
        onClick={() => onAddToCart(dish)}
        disabled={inCart}
        whileTap={{ scale: 0.96 }}
      >
        {inCart ? 'В корзине' : 'В корзину'}
      </motion.button>
      <button className="detail" onClick={() => onDetail(dish)}>
        Подробнее
      </button>
    </motion.div>
  );
}

function AddDishModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', image: '', price: '', description: '', type: 'Завтрак' });
  const [loading, setLoading] = useState(false);
  const [customType, setCustomType] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);

  const dishTypes = ['Завтрак', 'Обед', 'Ужин', 'Другое'];

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'Другое') {
      setShowCustomType(true);
      setForm(f => ({ ...f, type: '' }));
    } else {
      setShowCustomType(false);
      setForm(f => ({ ...f, type: value }));
    }
  };

  const handleCustomTypeChange = (e) => {
    const value = e.target.value;
    setCustomType(value);
    setForm(f => ({ ...f, type: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await onAdd(form);
    setForm({ name: '', image: '', price: '', description: '', type: 'Завтрак' });
    setCustomType('');
    setShowCustomType(false);
    setLoading(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="add-modal">
      <form className="add-modal-content" onSubmit={handleSubmit}>
        <h2>Добавить блюдо</h2>
        <input name="name" required placeholder="Название" className="input" value={form.name} onChange={handleChange} />
        <input name="image" placeholder="URL картинки" className="input" value={form.image} onChange={handleChange} />
        <input name="price" required placeholder="Цена" type="number" min="0" className="input" value={form.price} onChange={handleChange} />
        <textarea name="description" placeholder="Описание" className="input" value={form.description} onChange={handleChange} />
        
        <select 
          className="input" 
          value={showCustomType ? 'Другое' : form.type} 
          onChange={handleTypeChange}
          style={{ marginBottom: showCustomType ? 8 : 16 }}
        >
          {dishTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {showCustomType && (
          <input
            name="customType"
            placeholder="Введите свой тип блюда"
            className="input"
            value={customType}
            onChange={handleCustomTypeChange}
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="button-accent" disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
          <button type="button" className="input" onClick={onClose} disabled={loading}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

function CartModal({ open, onClose, cart, onOrder, balance }) {
  const total = cart.reduce((sum, d) => sum + Number(d.price || 0), 0);
  if (!open) return null;
  return (
    <div className="cart-modal">
      <div className="cart-modal-content">
        <h2>Корзина</h2>
        {cart.length === 0 ? (
          <div style={{ color: '#9ca3af', marginBottom: 16, textAlign: 'center' }}>Корзина пуста</div>
        ) : (
          <ul style={{ marginBottom: 16, borderTop: '1px solid #f3f4f6' }}>
            {cart.map((dish, i) => (
              <li key={i} style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{dish.name}</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{dish.price} Баллов</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginBottom: 8, textAlign: 'center' }}>Итого: <b>{total} Баллов</b></div>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>Баланс: <b>{balance} Баллов</b></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{ background: '#22c55e', color: '#fff', padding: '8px 16px', borderRadius: '1rem', fontWeight: 600, fontSize: 16, border: 'none', width: '100%' }}
            onClick={onOrder}
            disabled={cart.length === 0 || total > balance}
          >
            Оформить заказ
          </button>
          <button style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: '1rem', fontSize: 16, border: 'none', width: '100%' }} onClick={onClose}>Закрыть</button>
        </div>
        {total > balance && <div style={{ color: '#ef4444', marginTop: 8, textAlign: 'center' }}>Недостаточно средств</div>}
      </div>
    </div>
  );
}

function DishDetailModal({ open, dish, inCart, onAddToCart, onRemoveFromCart, onDelete, onClose }) {
  if (!open || !dish) return null;
  return (
    <div className="add-modal">
      <div className="add-modal-content" style={{ maxWidth: 400 }}>
        <img src={dish.image || '/no-image.png'} alt={dish.name} style={{ width: '100%', borderRadius: 12, marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>{dish.name}</h2>
        <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{dish.price ? `${dish.price} Баллов` : '—'}</div>
        <div style={{ marginBottom: 16, color: '#374151' }}>{dish.description || <span style={{ color: '#e8e8e8' }}>Нет описания</span>}</div>
        <div style={{ display: 'flex', flexDirection: "column",  gap: 8, marginBottom: 8 }}>
          {!inCart ? (
            <button className="button-accent" onClick={() => { onAddToCart(dish); onClose(); }}>
              В корзину
            </button>
          ) : (
            <button className="input" style={{ background: '#f3f4f6' }} onClick={() => { onRemoveFromCart(dish); onClose(); }}>
              Убрать из корзины
            </button>
          )}
          <button className="input" onClick={onClose}>Закрыть</button>
        </div>
        <button className="input" style={{ background: '#ef4444', color: '#fff', width: '100%' }} onClick={() => onDelete(dish)}>
          Удалить блюдо
        </button>
      </div>
    </div>
  );
}

function Notification({ message, onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#fff', padding: '12px 24px', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', zIndex: 1000, fontWeight: 600, fontSize: 16 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SkeletonLoader() {
  return (
    <div className="dishes-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="dish-card skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-text" style={{ width: '80%' }} />
          <div className="skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton-button" />
          <div className="skeleton-button" style={{ width: '60%' }} />
        </div>
      ))}
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="header">
      <div className="balance skeleton-text" style={{ width: '120px' }} />
      <div className="balance-label skeleton-text" style={{ width: '80px' }} />
      <div>
        <button className="button-accent" disabled>Добавить блюдо</button>
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
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('Все');
  const [isLoading, setIsLoading] = useState(true);

  // Get unique categories
  const categories = ['Все', ...new Set(dishes.map(dish => dish.type).filter(Boolean))];

  // Filter dishes based on active tab
  const filteredDishes = activeTab === 'Все' 
    ? dishes 
    : dishes.filter(dish => dish.type === activeTab);

  // Загрузка данных
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sheets');
      const json = await res.json();
      if (json.data) setDishes(json.data);
      if (json.balanceA2 !== undefined) setBalance(Number(json.balanceA2));
      if (json.error) setError(json.error);
    } catch (e) {
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
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
  // Корзина: убрать блюдо
  const handleRemoveFromCart = (dish) => {
    setCart(cart.filter(d => d.name !== dish.name));
  };
  // Корзина: оформить заказ
  const handleOrder = async () => {
    const total = cart.reduce((sum, d) => sum + Number(d.price || 0), 0);
    try {
      const res = await fetch('/api/sheets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total, items: cart }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка оформления заказа');
      setBalance(json.balance);
      setCart([]);
      setCartOpen(false);
      setNotification('Заказ успешно оформлен!');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      setError(e.message);
    }
  };

  // Удаление блюда
  const handleDeleteDish = async (dish) => {
    try {
      const res = await fetch('/api/sheets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dish.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка удаления блюда');
      setDishes(json.data.filter(d => d.name && d.price));
      if (json.balanceA2 !== undefined) setBalance(Number(json.balanceA2));
      setCart(cart.filter(d => d.name !== dish.name));
      setDetail(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="app-container">
      {isLoading ? (
        <>
          <BalanceSkeleton />
          <main className="main-content">
            <SkeletonLoader />
          </main>
        </>
      ) : (
        <>
          <header className="header">
            <div className="balance">{balance} Баллов</div>
            <div className="balance-label">Ваш баланс</div>
            <div>
              <button onClick={() => setAddOpen(true)} className="button-accent">Добавить блюдо</button>
            </div>
          </header>
          <main className="main-content">
            {error && <div className="error-message">Ошибка: {error}</div>}
            
            {/* Tabs */}
            <motion.div className="tabs-container" layout>
              {categories.map(category => (
                <motion.button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`tab-button ${activeTab === category ? 'active' : ''}`}
                  whileTap={{ scale: 0.96 }}
                  layout
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>

            <AnimatePresence mode="popLayout">
              <div className="dishes-grid">
                {filteredDishes.map((dish, i) => (
                  <DishCard
                    key={dish.name + i}
                    dish={dish}
                    onDetail={setDetail}
                    inCart={!!cart.find(d => d.name === dish.name)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </AnimatePresence>
          </main>
        </>
      )}
      <motion.button
        onClick={() => setCartOpen(true)}
        className="cart-fab"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ boxShadow: '0 8px 32px 0 rgba(59,130,246,0.25)' }}
      >
        <ShoppingCart size={28} />
        {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
      </motion.button>
      <AnimatePresence>
        {addOpen && <AddDishModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddDish} />}
        {cartOpen && <CartModal open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onOrder={handleOrder} balance={balance} />}
        {detail && <DishDetailModal
          open={!!detail}
          dish={detail}
          inCart={!!detail && !!cart.find(d => d.name === detail.name)}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onDelete={handleDeleteDish}
          onClose={() => setDetail(null)}
        />}
      </AnimatePresence>
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
    </div>
  );
}

