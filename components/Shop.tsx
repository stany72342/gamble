import React from 'react';
import { Coins, ShoppingCart, RefreshCw, Key } from 'lucide-react';
import { GameState, ItemTemplate, RARITY_COLORS } from '../types';
import { ITEMS } from '../constants';
import * as Icons from 'lucide-react';

interface ShopProps {
  gameState: GameState;
  addBalance: (amount: number) => void;
  onBuyItem: (template: ItemTemplate, price: number) => void;
}

export const Shop: React.FC<ShopProps> = ({ gameState, addBalance, onBuyItem }) => {
  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  // Mock sales items
  const flashSales = React.useMemo(() => {
    const allItems = Object.values(ITEMS).filter(i => i.rarity !== 'COMMON' && i.type !== 'key' && !i.hidden);
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(item => ({
        ...item,
        price: Math.floor(item.baseValue * 1.5)
    }));
  }, []);

  const keys = [
      { templateId: 'starter_key' },
      { templateId: 'warrior_key' },
      { templateId: 'hero_key' },
      { templateId: 'royal_key' },
      { templateId: 'black_market_key' },
  ];

  const handleBuyCoins = (amount: number) => {
      addBalance(amount);
      alert(`Success! Added ${amount} coins.`);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
        
        {/* Coin Shop Section */}
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Coins className="text-yellow-400" />
                Coin Store
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { amount: 1000, label: "Handful of Coins", color: "bg-slate-800", cost: "$3.00" },
                    { amount: 5000, label: "Sack of Coins", color: "bg-slate-800", cost: "$10.00" },
                    { amount: 10000, label: "Chest of Coins", color: "bg-gradient-to-br from-slate-800 to-slate-900", cost: "$18.00" }
                ].map((pack, idx) => (
                    <div key={idx} className={`${pack.color} border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center hover:border-yellow-500 transition-colors group`}>
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Coins className="text-yellow-400 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{pack.label}</h3>
                        <p className="text-yellow-400 font-mono font-bold text-lg mb-6">+{pack.amount.toLocaleString()}</p>
                        <button 
                            onClick={() => handleBuyCoins(pack.amount)}
                            className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors shadow-lg"
                        >
                            BUY FOR {pack.cost}
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Keys Section */}
        <div className="mb-12">
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Key className="text-orange-400" />
                Case Keys
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {keys.map((offer) => {
                    const item = ITEMS[offer.templateId];
                    if (!item) return null;
                    return (
                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center hover:border-orange-500 transition-colors">
                             <div className={`w-12 h-12 rounded-lg ${RARITY_COLORS[item.rarity].bg} bg-opacity-20 flex items-center justify-center border ${RARITY_COLORS[item.rarity].border} mb-4`}>
                                <LucideIcon name={item.icon} size={24} className={RARITY_COLORS[item.rarity].text} />
                            </div>
                            <h3 className={`font-bold text-sm ${RARITY_COLORS[item.rarity].text} mb-2`}>{item.name}</h3>
                            <div className="text-lg font-mono font-bold text-white mb-4">
                                ${item.baseValue.toLocaleString()}
                            </div>
                            <button 
                                onClick={() => onBuyItem(item, item.baseValue)}
                                disabled={gameState.balance < item.baseValue}
                                className={`w-full py-2 rounded-lg font-bold text-xs transition-colors ${gameState.balance >= item.baseValue ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                            >
                                BUY KEY
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Flash Sales Section */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="text-blue-400" />
                    Flash Sales
                </h2>
                <div className="text-slate-400 text-sm flex items-center gap-1">
                    <RefreshCw size={14} className="animate-spin-slow" /> Resets hourly
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {flashSales.map((item) => (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-bl-xl`}>
                            HOT
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-16 h-16 rounded-lg ${RARITY_COLORS[item.rarity].bg} bg-opacity-20 flex items-center justify-center border ${RARITY_COLORS[item.rarity].border}`}>
                                <LucideIcon name={item.icon} size={32} className={RARITY_COLORS[item.rarity].text} />
                            </div>
                            <div>
                                <h3 className={`font-bold ${RARITY_COLORS[item.rarity].text}`}>{item.name}</h3>
                                <span className="text-xs text-slate-500 uppercase">{item.type} • {item.rarity}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="text-2xl font-mono font-bold text-white">
                                ${item.price.toLocaleString()}
                            </div>
                            <button 
                                onClick={() => onBuyItem(item, item.price)}
                                disabled={gameState.balance < item.price}
                                className={`
                                    px-4 py-2 rounded-lg font-bold text-sm transition-colors
                                    ${gameState.balance >= item.price 
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                                `}
                            >
                                BUY NOW
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    </div>
  );
};