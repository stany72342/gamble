import React, { useMemo, useState } from 'react';
import { GameState, RARITY_COLORS } from '../types';
import { ITEMS } from '../constants';
import * as Icons from 'lucide-react';

interface InventoryProps {
  gameState: GameState;
  onSell: (itemId: string) => void;
  onSellBulk: (itemIds: string[]) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ gameState, onSell, onSellBulk }) => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'value'>('newest');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const LucideIcon = ({ name, size = 24 }: { name: string, size?: number }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} /> : <Icons.HelpCircle size={size} />;
  };

  const sortedItems = useMemo(() => {
    const items = [...gameState.inventory];
    if (sortOrder === 'newest') {
        return items.sort((a, b) => b.obtainedAt - a.obtainedAt);
    } else {
        return items.sort((a, b) => b.value - a.value);
    }
  }, [gameState.inventory, sortOrder]);

  const totalValue = useMemo(() => {
    return gameState.inventory.reduce((acc, item) => acc + item.value, 0);
  }, [gameState.inventory]);

  const toggleSelect = (itemId: string) => {
      setSelectedItems(prev => 
          prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
      );
  };

  const toggleSelectAll = () => {
      if (selectedItems.length === sortedItems.length) {
          setSelectedItems([]);
      } else {
          setSelectedItems(sortedItems.map(i => i.id));
      }
  };

  const handleBulkSell = () => {
      if (confirm(`Sell ${selectedItems.length} items?`)) {
          onSellBulk(selectedItems);
          setSelectedItems([]);
          setIsBulkMode(false);
      }
  };

  const selectedValue = selectedItems.reduce((acc, id) => {
      const item = gameState.inventory.find(i => i.id === id);
      return acc + (item ? item.value : 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
        
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-slate-800 pb-6">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Inventory</h2>
                <p className="text-slate-400">Manage your collection. Sell items for coins or keep them for glory.</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total Value</div>
                    <div className="text-2xl font-mono font-bold text-green-400">${totalValue.toLocaleString()}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Items</div>
                    <div className="text-2xl font-mono font-bold text-white">{gameState.inventory.length}</div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
             <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                        setIsBulkMode(!isBulkMode);
                        setSelectedItems([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${isBulkMode ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-slate-800 text-white border-slate-700 hover:border-slate-500'}`}
                >
                    <Icons.Layers size={16} /> {isBulkMode ? 'Exit Bulk Mode' : 'Bulk Sell'}
                </button>
                {isBulkMode && (
                    <>
                         <button 
                            onClick={toggleSelectAll}
                            className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                        >
                            {selectedItems.length === sortedItems.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {selectedItems.length > 0 && (
                            <button 
                                onClick={handleBulkSell}
                                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20 animate-in fade-in"
                            >
                                Sell {selectedItems.length} for ${selectedValue.toLocaleString()}
                            </button>
                        )}
                    </>
                )}
            </div>

            <select 
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'value')}
            >
                <option value="newest">Sort by: Newest</option>
                <option value="value">Sort by: Value</option>
            </select>
        </div>

        {/* Grid */}
        {gameState.inventory.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800">
                <Icons.PackageOpen className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400">Your inventory is empty</h3>
                <p className="text-slate-500 mt-1">Open some cases to get started!</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sortedItems.map((item) => {
                    const baseCirculation = ITEMS[item.templateId]?.circulation || 0;
                    // Add dynamically generated count to base count
                    const dynamicCount = gameState.circulationCounts[item.templateId] || 0;
                    const totalCirculation = baseCirculation + dynamicCount;

                    return (
                        <div 
                            key={item.id}
                            onClick={() => isBulkMode && toggleSelect(item.id)}
                            className={`
                                relative group bg-slate-900 rounded-xl border transition-all duration-200 overflow-visible
                                ${isBulkMode ? 'cursor-pointer' : 'hover:-translate-y-1 hover:shadow-lg'}
                                ${isBulkMode && selectedItems.includes(item.id) ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-800 hover:border-slate-600'}
                            `}
                        >
                            {/* Hover Tooltip (Only when not in bulk mode) */}
                            {!isBulkMode && (
                                <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 w-48 bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-2xl z-50 hidden group-hover:block pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                                    <div className={`font-bold text-sm mb-1 ${RARITY_COLORS[item.rarity].text}`}>{item.name}</div>
                                    <div className="text-xs text-slate-400 mb-2 flex justify-between">
                                        <span>{item.type}</span>
                                        <span>{item.rarity}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono mb-2">
                                        Obtained: {new Date(item.obtainedAt).toLocaleDateString()}
                                    </div>
                                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                                        <span className="text-xs text-slate-400">Value</span>
                                        <span className="text-sm font-mono font-bold text-green-400">${item.value.toLocaleString()}</span>
                                    </div>
                                     <div className="pt-1 flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Circulation</span>
                                        <span className="text-xs font-mono font-bold text-slate-300">{totalCirculation.toLocaleString()}</span>
                                    </div>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950"></div>
                                </div>
                            )}

                            {/* Selection Checkbox */}
                            {isBulkMode && (
                                <div className={`absolute top-2 right-2 w-5 h-5 rounded border flex items-center justify-center ${selectedItems.includes(item.id) ? 'bg-yellow-500 border-yellow-500' : 'bg-slate-900 border-slate-600'}`}>
                                    {selectedItems.includes(item.id) && <Icons.Check size={14} className="text-black" />}
                                </div>
                            )}

                            {/* Rarity Stripe */}
                            <div className={`h-1 w-full ${RARITY_COLORS[item.rarity].bg} rounded-t-xl`}></div>

                            <div className="p-4 flex flex-col items-center">
                                <div className={`mb-3 p-3 rounded-full bg-slate-800 ${RARITY_COLORS[item.rarity].text}`}>
                                    <LucideIcon name={item.icon} size={32} />
                                </div>
                                <h3 className={`text-sm font-bold text-center truncate w-full mb-1 ${RARITY_COLORS[item.rarity].text}`}>
                                    {item.name}
                                </h3>
                                <div className="text-xs text-slate-500 font-mono mb-1">
                                    ${item.value.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono mb-3">
                                    Circ: {totalCirculation.toLocaleString()}
                                </div>
                                
                                {!isBulkMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSell(item.id);
                                        }}
                                        className="w-full py-1.5 px-3 bg-slate-800 hover:bg-green-600 hover:text-white text-slate-300 text-xs font-bold rounded transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Icons.DollarSign size={12} /> SELL
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};