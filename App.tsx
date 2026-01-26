import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CaseOpener } from './components/CaseOpener';
import { Inventory } from './components/Inventory';
import { Upgrader } from './components/Upgrader';
import { Slots } from './components/Slots';
import { Shop } from './components/Shop';
import { AuctionHouse } from './components/AuctionHouse';
import { Trade } from './components/Trade';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { Premium } from './components/Premium';
import { Leaderboard } from './components/Leaderboard';
import { Stats } from './components/Stats';
import { Catalog } from './components/Catalog';
import { useGameState } from './hooks/useGameState';
import { CASES, ITEMS } from './constants';
import * as Icons from 'lucide-react';
import { ItemTemplate, Rarity } from './types';

const App = () => {
  const [currentTab, setTab] = useState('cases');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  const { 
    gameState, 
    login,
    logout,
    addBalance, 
    removeBalance, 
    addItem, 
    removeItem, 
    sellItem,
    sellItems,
    buyAuctionItem,
    listUserItem,
    cancelUserListing,
    createTradeOffer,
    redeemTradeCode,
    addXp, 
    setLevel,
    claimDailyReward,
    getNextRarity,
    getItemsByRarity,
    resetGame,
    buyPremium,
    recordDropStats,
    // Key functions
    consumeKey,
    // Admin functions
    setGlobalLuck,
    triggerEvent,
    sendAdminEmail,
    createPromoCode,
    redeemPromoCode,
    toggleMaintenance
  } = useGameState();

  const handleCaseOpen = (caseId: string) => {
    const box = CASES.find(c => c.id === caseId);
    if (!box) return null;
    
    // Check and consume key if required
    if (box.keyTemplateId) {
        const consumed = consumeKey(box.keyTemplateId);
        if (!consumed) return null; // Should be handled by UI check, but double safety
    }

    // Deduct cost (if any)
    if (box.price > 0) {
        removeBalance(box.price);
    }
    
    // Weight Calculation with Luck Multiplier
    // If luck is active, multiply weights of Rare+ items
    const luckMult = gameState.globalLuckMultiplier;
    
    const weightedItems = box.contains.map(c => {
        const item = ITEMS[c.templateId];
        let weight = c.weight;
        
        // Apply luck multiplier to rare items
        if (item.rarity !== Rarity.COMMON && item.rarity !== Rarity.UNCOMMON) {
            weight = weight * luckMult;
        }
        
        return { ...c, calculatedWeight: weight };
    });

    const totalWeight = weightedItems.reduce((sum, item) => sum + item.calculatedWeight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedTemplateId = weightedItems[0].templateId;
    
    for (const item of weightedItems) {
        if (random < item.calculatedWeight) {
            selectedTemplateId = item.templateId;
            break;
        }
        random -= item.calculatedWeight;
    }

    // New: Record detailed stats for the stats page
    recordDropStats(ITEMS[selectedTemplateId], box.price);

    return ITEMS[selectedTemplateId];
  };

  const handleWinItem = (templateId: string) => {
      addItem(templateId);
      addXp(10);
  };

  const handleUpgradeAttempt = (itemId: string, targetTemplateId: string, chance: number) => {
      // Use the chance calculated by the UI (based on value)
      // chance is 0-100
      const roll = Math.random() * 100;
      const success = roll < chance;
      
      removeItem(itemId); // Always remove the input item
      
      if (success) {
          addItem(targetTemplateId);
          addXp(50);
          return true;
      }
      return false;
  };

  const handleBuyItem = (template: ItemTemplate, price: number) => {
      if (gameState.balance >= price) {
          removeBalance(price);
          addItem(template.id);
          addXp(5);
          alert(`You bought ${template.name}!`);
      }
  };

  // If no username, show login screen
  if (!gameState.username) {
      return <Login onLogin={login} />;
  }

  // Maintenance Mode (Blocks regular users)
  if (gameState.maintenanceMode && !gameState.isAdmin) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg">
                  <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Icons.Construction size={48} className="text-yellow-500" />
                  </div>
                  <h1 className="text-4xl font-black text-white mb-2">MAINTENANCE</h1>
                  <p className="text-slate-400 mb-6">
                      The server is currently under maintenance. We are updating the inventory system and fixing glitches.
                  </p>
                  <div className="text-xs text-slate-500 font-mono">Estimated time: 1 Hour</div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-500 selection:text-black pb-20 relative">
      <Navbar currentTab={currentTab} setTab={setTab} gameState={gameState} onLogout={logout} />
      
      {/* Admin Button (Floating) */}
      {gameState.isAdmin && (
        <button 
            onClick={() => setShowAdminPanel(true)}
            className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-900/50 animate-pulse"
        >
            <Icons.ShieldAlert className="inline-block mr-2" size={16} />
            ADMIN PANEL
        </button>
      )}

      {showAdminPanel && (
          <AdminPanel 
            gameState={gameState} 
            onClose={() => setShowAdminPanel(false)} 
            onSetLuck={setGlobalLuck}
            onTriggerEvent={triggerEvent}
            onSendEmail={sendAdminEmail}
            onSetLevel={setLevel}
            onCreatePromo={createPromoCode}
            onToggleMaintenance={toggleMaintenance}
          />
      )}

      {/* Active Event Banner */}
      {gameState.activeEvent && (
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-center py-2 px-4 shadow-lg animate-pulse flex items-center justify-center gap-2 relative z-40">
              <Icons.Zap size={16} />
              EVENT ACTIVE: {gameState.activeEvent.replace('_', ' ')}
              <Icons.Zap size={16} />
          </div>
      )}

      {gameState.maintenanceMode && gameState.isAdmin && (
           <div className="bg-red-600/20 border-b border-red-500/50 text-red-500 font-bold text-center py-1 text-xs uppercase tracking-widest">
               ⚠ MAINTENANCE MODE ACTIVE - USER ACCESS RESTRICTED ⚠
           </div>
      )}

      <main className="container mx-auto px-4 mt-8 animate-in fade-in duration-500">
        {currentTab === 'cases' && (
            <>
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                        OPEN CASES. GET RICH.
                    </h1>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Test your luck, collect legendary items, and climb the leaderboards. 
                        Daily reward available every 24h.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <button 
                            onClick={claimDailyReward}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-700"
                        >
                            <Icons.Calendar size={16} /> Daily Reward
                        </button>
                        <button 
                            onClick={resetGame}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-red-900/30 text-red-500 hover:text-red-400 rounded-lg text-sm font-bold transition-colors border border-slate-800 hover:border-red-900"
                        >
                            <Icons.Trash2 size={16} /> Reset Save
                        </button>
                    </div>
                </div>
                <CaseOpener 
                    gameState={gameState} 
                    onOpen={handleCaseOpen} 
                    onWin={handleWinItem} 
                    removeBalance={removeBalance}
                />
            </>
        )}
        
        {currentTab === 'inventory' && (
            <Inventory gameState={gameState} onSell={sellItem} onSellBulk={sellItems} />
        )}

        {currentTab === 'shop' && (
            <Shop gameState={gameState} addBalance={addBalance} onBuyItem={handleBuyItem} />
        )}

        {currentTab === 'stats' && (
            <Stats gameState={gameState} onRedeemCode={redeemPromoCode} />
        )}

        {currentTab === 'catalog' && (
            <Catalog />
        )}

        {currentTab === 'auction' && (
            <AuctionHouse 
                gameState={gameState} 
                onBuy={buyAuctionItem}
                onList={listUserItem}
                onCancel={cancelUserListing}
            />
        )}
        
        {currentTab === 'trade' && (
            <Trade
                gameState={gameState}
                onCreateTrade={createTradeOffer}
                onRedeemTrade={redeemTradeCode}
            />
        )}
        
        {currentTab === 'upgrader' && (
            <Upgrader 
                gameState={gameState} 
                onUpgradeAttempt={handleUpgradeAttempt} 
                getNextRarity={getNextRarity}
                getItemsByRarity={getItemsByRarity}
            />
        )}
        
        {currentTab === 'slots' && (
            <Slots 
                gameState={gameState}
                onSpinResult={(amount) => {
                    addBalance(amount);
                    addXp(5);
                }}
                removeBalance={removeBalance}
            />
        )}

        {currentTab === 'premium' && (
             <Premium gameState={gameState} onBuyPremium={buyPremium} />
        )}

        {currentTab === 'leaderboard' && (
             <Leaderboard gameState={gameState} />
        )}
      </main>
    </div>
  );
};

export default App;