import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ClipboardList, UtensilsCrossed, Copy, CheckSquare } from 'lucide-react';
import { fetchMenuData } from './lib/api';
import MenuCard from './components/MenuCard';
import PrepModal from './components/PrepModal';

const App = () => {
  const [foodData, setFoodData] = useState(null);
  const [menu, setMenu] = useState(null);
  const [prepData, setPrepData] = useState({ preps: [], shops: [] });
  const [isPrepOpen, setIsPrepOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      const data = await fetchMenuData();
      if (data) {
        setFoodData(data);
        generateMenu(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getRandom = useCallback((arr) => arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null, []);

  const calculatePrep = useCallback((currentMenu) => {
    const items = [
      currentMenu.breakfast.light, currentMenu.breakfast.heavy,
      currentMenu.lunch.light, currentMenu.lunch.heavy,
      currentMenu.dinner.light, currentMenu.dinner.heavy,
      currentMenu.extra
    ].filter(Boolean);

    const preps = new Set();
    const shops = new Set();

    items.forEach(item => {
      if (item.prep) preps.add(`${item.name}: ${item.prep}`);
      if (item.critical) item.critical.split(',').forEach(i => shops.add(i.trim()));
    });

    setPrepData({
      preps: Array.from(preps),
      shops: Array.from(shops)
    });
  }, []);

  const generateMenu = useCallback((data = foodData) => {
    if (!data) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);

    // Access via name string in lists, then look up in recipes map
    const pick = (list) => {
      const name = getRandom(list);
      return name ? data.recipes[name] : null;
    };

    const newMenu = {
      breakfast: {
        light: pick(data.breakfast.light),
        heavy: pick(data.breakfast.heavy),
      },
      lunch: {
        light: pick(data.lunch.light),
        heavy: pick(data.lunch.heavy),
      },
      dinner: {
        light: pick(data.dinner.light),
        heavy: pick(data.dinner.heavy),
      },
      extra: pick(data.extras),
      fruit: pick(data.fruits),
      timestamp: Date.now()
    };

    setMenu(newMenu);
    calculatePrep(newMenu);
  }, [foodData, getRandom, calculatePrep]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      setSelectedCards(new Set());
    }
  }, [selectionMode]);

  const toggleCardSelection = useCallback((dishName) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dishName)) {
        newSet.delete(dishName);
      } else {
        newSet.add(dishName);
      }
      return newSet;
    });
  }, []);

  const copySelectedToClipboard = useCallback(() => {
    if (!menu || selectedCards.size === 0) return;

    const categorizedDishes = {
      breakfast: [],
      lunch: [],
      dinner: [],
      fruit: null,
      extra: null
    };

    // Categorize selected dishes
    if (selectedCards.has(menu.breakfast?.light?.name)) categorizedDishes.breakfast.push(menu.breakfast.light.name);
    if (selectedCards.has(menu.breakfast?.heavy?.name)) categorizedDishes.breakfast.push(menu.breakfast.heavy.name);
    if (selectedCards.has(menu.lunch?.light?.name)) categorizedDishes.lunch.push(menu.lunch.light.name);
    if (selectedCards.has(menu.lunch?.heavy?.name)) categorizedDishes.lunch.push(menu.lunch.heavy.name);
    if (selectedCards.has(menu.dinner?.light?.name)) categorizedDishes.dinner.push(menu.dinner.light.name);
    if (selectedCards.has(menu.dinner?.heavy?.name)) categorizedDishes.dinner.push(menu.dinner.heavy.name);
    if (selectedCards.has(menu.fruit?.name)) categorizedDishes.fruit = menu.fruit.name;
    if (selectedCards.has(menu.extra?.name)) categorizedDishes.extra = menu.extra.name;

    // Build formatted text
    let text = '';

    if (categorizedDishes.breakfast.length > 0) {
      text += `Breakfast: ${categorizedDishes.breakfast.join(', ')}`;
      if (categorizedDishes.fruit) text += `, ${categorizedDishes.fruit}`;
      text += '\n';
    }

    if (categorizedDishes.lunch.length > 0) {
      text += `Lunch: ${categorizedDishes.lunch.join(', ')}`;
      if (categorizedDishes.extra) text += `, ${categorizedDishes.extra}`;
      text += '\n';
    }

    if (categorizedDishes.dinner.length > 0) {
      text += `Dinner: ${categorizedDishes.dinner.join(', ')}\n`;
    }

    // Add prep notes if any selected dishes have prep requirements
    if (prepData.preps.length > 0 || prepData.shops.length > 0) {
      const selectedPreps = prepData.preps.filter(prep => {
        const dishName = prep.split(':')[0].trim();
        return selectedCards.has(dishName);
      });

      if (selectedPreps.length > 0 || prepData.shops.length > 0) {
        text += '\nNote: ';
        if (selectedPreps.length > 0) {
          text += selectedPreps.join('; ');
        }
        if (prepData.shops.length > 0 && selectedPreps.length > 0) {
          text += '; ';
        }
        if (prepData.shops.length > 0) {
          text += `Shop for: ${prepData.shops.join(', ')}`;
        }
      }
    }

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert(`✓ Copied ${selectedCards.size} dishes to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }, [menu, selectedCards, prepData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-primary">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw size={48} />
        </motion.div>
        <p className="mt-4 font-heading text-xl animate-pulse">Curating Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[100px] animate-blob -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000 -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary mb-2">
              What's Cooking?
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-light">
              Your Daily Indian Meal Planner
            </p>
          </motion.div>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => generateMenu()}
            disabled={animating}
            className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:shadow-primary/40 transition-shadow"
          >
            <RefreshCw size={20} className={animating ? 'animate-spin' : ''} />
            Generate Menu
          </motion.button>

          {(prepData.preps.length > 0 || prepData.shops.length > 0) && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPrepOpen(!isPrepOpen)}
              className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-medium backdrop-blur-md flex items-center gap-2 hover:bg-white/20 transition-colors"
            >
              <ClipboardList size={20} />
              Prep Plan
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSelectionMode}
            className={`${selectionMode ? 'bg-green-500/20 border-green-400' : 'bg-white/10 border-white/20'} border text-white px-6 py-3 rounded-full font-medium backdrop-blur-md flex items-center gap-2 hover:bg-white/20 transition-colors`}
          >
            <CheckSquare size={20} />
            {selectionMode ? 'Done' : 'Select Cards'}
          </motion.button>

          {selectionMode && selectedCards.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copySelectedToClipboard}
              className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Copy size={20} />
              Copy {selectedCards.size} {selectedCards.size === 1 ? 'Dish' : 'Dishes'}
            </motion.button>
          )}
        </div>


        {/* Menu Grid - Improved Responsive Layout */}
        {menu && (
          <div className="space-y-8">
            {/* Main Meals Grid - Breakfast, Lunch, Dinner */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {/* Breakfast */}
              <Section title="Breakfast" icon={<UtensilsCrossed size={20} />}>
                <div className="space-y-4">
                  <MenuCard
                    dish={menu.breakfast.light}
                    selectionMode={selectionMode}
                    isSelected={selectedCards.has(menu.breakfast.light?.name)}
                    onToggleSelect={() => toggleCardSelection(menu.breakfast.light?.name)}
                  />
                  <MenuCard
                    dish={menu.breakfast.heavy}
                    selectionMode={selectionMode}
                    isSelected={selectedCards.has(menu.breakfast.heavy?.name)}
                    onToggleSelect={() => toggleCardSelection(menu.breakfast.heavy?.name)}
                  />
                </div>
              </Section>

              {/* Lunch */}
              <Section title="Lunch" icon={<UtensilsCrossed size={20} />}>
                <div className="space-y-4">
                  <MenuCard
                    dish={menu.lunch.light}
                    selectionMode={selectionMode}
                    isSelected={selectedCards.has(menu.lunch.light?.name)}
                    onToggleSelect={() => toggleCardSelection(menu.lunch.light?.name)}
                  />
                  <MenuCard
                    dish={menu.lunch.heavy}
                    selectionMode={selectionMode}
                    isSelected={selectedCards.has(menu.lunch.heavy?.name)}
                    onToggleSelect={() => toggleCardSelection(menu.lunch.heavy?.name)}
                  />
                </div>
              </Section>

              {/* Dinner */}
              <Section title="Dinner" icon={<UtensilsCrossed size={20} />}>
                <div className="space-y-4">
                  <MenuCard
                    dish={menu.dinner.light}
                    selectionMode={selectionMode}
                    isSelected={selectedCards.has(menu.dinner.light?.name)}
                    onToggleSelect={() => toggleCardSelection(menu.dinner.light?.name)}
                  />
                  <MenuCard
                    dish={menu.dinner.heavy}
                    selectionMode={selectionMode}
                    isSelected={selectedCards.has(menu.dinner.heavy?.name)}
                    onToggleSelect={() => toggleCardSelection(menu.dinner.heavy?.name)}
                  />
                </div>
              </Section>
            </div>

            {/* Extras - Side Dish and Fruit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl">🍲</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary font-heading font-bold text-lg md:text-xl mb-1">Side Dish</h3>
                    <p className="text-white/80 font-medium">{menu.extra?.name || 'None'}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl">🍎</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-green-400 font-heading font-bold text-lg md:text-xl mb-1">Fruit</h3>
                    <p className="text-white/80 font-medium">{menu.fruit?.name || 'None'}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isPrepOpen && (
        <PrepModal
          isOpen={isPrepOpen}
          onClose={() => setIsPrepOpen(false)}
          prepData={prepData}
        />
      )}

      <footer className="text-center text-white/30 py-8 mt-12 border-t border-white/5">
        <p>Made with 🧡 & 🌶️</p>
      </footer>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 text-white/50 mb-4 px-1">
      {icon}
      <h2 className="text-base md:text-lg font-bold uppercase tracking-widest">{title}</h2>
    </div>
    {children}
  </div>
);

export default App;
