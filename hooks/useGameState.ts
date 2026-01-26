import { useState, useEffect, useCallback } from 'react';
import { GameState, Item, ItemTemplate, Rarity, RARITY_ORDER, AuctionListing, TradeOffer, PromoCode } from '../types';
import { ITEMS, INITIAL_STATE, XP_PER_LEVEL_BASE, XP_MULTIPLIER } from '../constants';

const STORAGE_KEY = 'case_clicker_v2_5'; 

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Handle "Remember Me" logic
        if (parsed.rememberMe === false) {
             parsed.username = null; // Require login again
             parsed.email = null;
        }

        // Ensure stats object is merged correctly for old saves
        setGameState({ 
            ...INITIAL_STATE, 
            ...parsed,
            stats: { ...INITIAL_STATE.stats, ...parsed.stats },
            circulationCounts: parsed.circulationCounts || {},
            promoCodes: parsed.promoCodes || [],
            redeemedCodes: parsed.redeemedCodes || []
        });
      } catch (e) {
        console.error("Failed to parse save data", e);
      }
    }
    setLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, loaded]);

  // Passive Income Logic: +100 coins every 60 seconds
  useEffect(() => {
      if (!loaded || !gameState.username) return;

      const interval = setInterval(() => {
          setGameState(prev => ({
              ...prev,
              balance: prev.balance + 100
          }));
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
  }, [loaded, gameState.username]);

  // Logic to clean up expired user listings only
  useEffect(() => {
      if (!loaded) return;
      
      const interval = setInterval(() => {
          setGameState(prev => {
              const now = Date.now();
              // Remove expired auctions
              const validListings = prev.auctionListings.filter(l => l.expiresAt > now);
              
              if (validListings.length !== prev.auctionListings.length) {
                  return {
                      ...prev,
                      auctionListings: validListings
                  };
              }
              return prev;
          });
      }, 10000);

      return () => clearInterval(interval);
  }, [loaded]);

  // Updated Login Logic: No Email Required
  const login = useCallback((username: string, password: string, rememberMe: boolean) => {
    let isAdmin = false;
    
    // Hardcoded Admin Credentials Check
    if (username === 'StashyM' && password === 'S3pt3mb3r2012!') {
        isAdmin = true;
    }

    setGameState(prev => ({ 
        ...prev, 
        username,
        email: null, // No longer used
        isAdmin,
        rememberMe,
        // If admin, give unlimited money for testing
        balance: isAdmin ? 999999999 : prev.balance 
    }));
  }, []);

  const logout = useCallback(() => {
     setGameState(prev => ({ ...prev, username: null, isAdmin: false, email: null }));
  }, []);

  const addBalance = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, balance: prev.balance + amount }));
  }, []);

  const removeBalance = useCallback((amount: number) => {
    setGameState(prev => {
      // Admins don't lose balance
      if (prev.isAdmin) return prev;
      if (prev.balance < amount) return prev;
      return { ...prev, balance: prev.balance - amount };
    });
  }, []);

  // FIXED: Synchronously check for key existence using current state
  const consumeKey = useCallback((keyTemplateId: string) => {
      // Check against the current gameState in scope
      const hasKey = gameState.inventory.some(i => i.templateId === keyTemplateId);
      
      if (!hasKey) {
          return false;
      }

      setGameState(prev => {
          const keyItem = prev.inventory.find(i => i.templateId === keyTemplateId);
          if (!keyItem) return prev;
          
          return {
              ...prev,
              inventory: prev.inventory.filter(i => i.id !== keyItem.id)
          };
      });
      return true;
  }, [gameState.inventory]);

  const hasKey = useCallback((keyTemplateId: string) => {
      return gameState.inventory.some(i => i.templateId === keyTemplateId);
  }, [gameState.inventory]);

  // Stats Tracking Helper
  const recordDropStats = useCallback((item: ItemTemplate, cost: number) => {
      setGameState(prev => {
          const isBest = item.baseValue > prev.stats.bestDropValue;
          const loss = cost > item.baseValue ? cost - item.baseValue : 0;
          const isWorstLoss = loss > prev.stats.worstLossValue;

          return {
              ...prev,
              stats: {
                  ...prev.stats,
                  casesOpened: prev.stats.casesOpened + 1,
                  totalMoneySpent: prev.stats.totalMoneySpent + cost,
                  totalItemValueObtained: prev.stats.totalItemValueObtained + item.baseValue,
                  bestDropValue: isBest ? item.baseValue : prev.stats.bestDropValue,
                  bestDropName: isBest ? item.name : prev.stats.bestDropName,
                  worstLossValue: isWorstLoss ? loss : prev.stats.worstLossValue,
                  legendariesPulled: item.rarity === Rarity.LEGENDARY ? prev.stats.legendariesPulled + 1 : prev.stats.legendariesPulled,
                  mythicsPulled: item.rarity === Rarity.MYTHIC ? prev.stats.mythicsPulled + 1 : prev.stats.mythicsPulled,
                  contrabandsPulled: item.rarity === Rarity.CONTRABAND ? prev.stats.contrabandsPulled + 1 : prev.stats.contrabandsPulled,
              }
          };
      });
  }, []);

  const addItem = useCallback((templateId: string) => {
    const template = ITEMS[templateId];
    if (!template) return;

    const newItem: Item = {
      id: crypto.randomUUID(),
      templateId: template.id,
      name: template.name,
      rarity: template.rarity,
      value: template.baseValue,
      icon: template.icon,
      type: template.type,
      obtainedAt: Date.now(),
    };

    // Update state AND circulation count
    setGameState(prev => {
      const currentCirculation = prev.circulationCounts[templateId] || 0;
      return {
        ...prev,
        inventory: [newItem, ...prev.inventory],
        circulationCounts: {
            ...prev.circulationCounts,
            [templateId]: currentCirculation + 1
        }
      };
    });
    return newItem;
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== itemId)
    }));
  }, []);

  const sellItem = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item) return prev;
      return {
        ...prev,
        balance: prev.balance + item.value,
        inventory: prev.inventory.filter(i => i.id !== itemId)
      };
    });
  }, []);

  const sellItems = useCallback((itemIds: string[]) => {
    setGameState(prev => {
        const itemsToSell = prev.inventory.filter(i => itemIds.includes(i.id));
        const totalValue = itemsToSell.reduce((acc, i) => acc + i.value, 0);
        return {
            ...prev,
            balance: prev.balance + totalValue,
            inventory: prev.inventory.filter(i => !itemIds.includes(i.id))
        };
    });
  }, []);

  const buyAuctionItem = useCallback((listingId: string) => {
      setGameState(prev => {
          const listing = prev.auctionListings.find(l => l.id === listingId);
          if (!listing || prev.balance < listing.price) return prev;

          const newItem: Item = {
            id: crypto.randomUUID(),
            templateId: listing.item.id,
            name: listing.item.name,
            rarity: listing.item.rarity,
            value: listing.item.baseValue,
            icon: listing.item.icon,
            type: listing.item.type,
            obtainedAt: Date.now(),
          };

          return {
              ...prev,
              balance: prev.balance - listing.price,
              auctionListings: prev.auctionListings.filter(l => l.id !== listingId),
              inventory: [newItem, ...prev.inventory]
          };
      });
  }, []);

  const listUserItem = useCallback((itemId: string, price: number) => {
      setGameState(prev => {
          const item = prev.inventory.find(i => i.id === itemId);
          if (!item) return prev;

          return {
              ...prev,
              inventory: prev.inventory.filter(i => i.id !== itemId),
              userListings: [...prev.userListings, {
                  id: crypto.randomUUID(),
                  item: item,
                  price: price,
                  listedAt: Date.now()
              }]
          };
      });
  }, []);

  const cancelUserListing = useCallback((listingId: string) => {
      setGameState(prev => {
          const listing = prev.userListings.find(l => l.id === listingId);
          if (!listing) return prev;

          return {
              ...prev,
              userListings: prev.userListings.filter(l => l.id !== listingId),
              inventory: [listing.item, ...prev.inventory]
          };
      });
  }, []);

  // Trading System
  const createTradeOffer = useCallback((itemId: string) => {
      let code = '';
      setGameState(prev => {
          const item = prev.inventory.find(i => i.id === itemId);
          if (!item) return prev;

          code = Math.random().toString(36).substring(2, 8).toUpperCase();

          const newTrade: TradeOffer = {
              code,
              item,
              creator: prev.username || 'Anonymous',
              createdAt: Date.now()
          };

          return {
              ...prev,
              inventory: prev.inventory.filter(i => i.id !== itemId),
              activeTrades: [...(prev.activeTrades || []), newTrade]
          };
      });
      return code;
  }, []);

  const redeemTradeCode = useCallback((code: string) => {
      let result = 'invalid';
      setGameState(prev => {
          const tradeIndex = (prev.activeTrades || []).findIndex(t => t.code === code);
          if (tradeIndex === -1) {
              result = 'invalid';
              return prev;
          }
          
          const trade = prev.activeTrades[tradeIndex];
          const newItem = { ...trade.item, id: crypto.randomUUID() };

          result = 'success';
          return {
              ...prev,
              inventory: [newItem, ...prev.inventory],
              activeTrades: prev.activeTrades.filter((_, i) => i !== tradeIndex)
          };
      });
      return result;
  }, []);

  const addXp = useCallback((amount: number) => {
    setGameState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let xpForNext = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, newLevel - 1));

      while (newXp >= xpForNext) {
        newXp -= xpForNext;
        newLevel++;
        xpForNext = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, newLevel - 1));
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  }, []);
  
  const setLevel = useCallback((level: number) => {
      setGameState(prev => ({ ...prev, level: level }));
  }, []);

  const claimDailyReward = useCallback(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    setGameState(prev => {
        if (now - prev.lastDailyReward < oneDay) return prev;
        
        const reward = 100 * prev.level;
        return {
            ...prev,
            balance: prev.balance + reward,
            lastDailyReward: now
        };
    });
  }, []);

  const resetGame = useCallback(() => {
    if (confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
        setGameState({ ...INITIAL_STATE, username: gameState.username }); 
        localStorage.removeItem(STORAGE_KEY);
    }
  }, [gameState.username]);

  const buyPremium = useCallback(() => {
      setGameState(prev => ({ ...prev, isPremium: true }));
  }, []);

  // Admin Actions
  const setGlobalLuck = useCallback((multiplier: number) => {
      setGameState(prev => ({ ...prev, globalLuckMultiplier: multiplier }));
  }, []);

  const triggerEvent = useCallback((eventName: string | null) => {
      setGameState(prev => ({ ...prev, activeEvent: eventName }));
  }, []);
  
  const toggleMaintenance = useCallback(() => {
      setGameState(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
  }, []);

  const sendAdminEmail = useCallback((subject: string, body: string) => {
      console.log(`[EMAIL SYSTEM] Broadcasting to all users.\nSubject: ${subject}\nBody: ${body}`);
      alert(`Admin Email System:\nQueued "${subject}" to all active players.`);
  }, []);
  
  // Promo Code System
  const createPromoCode = useCallback((code: string, reward: number, maxUses: number) => {
      setGameState(prev => ({
          ...prev,
          promoCodes: [...prev.promoCodes, { code, reward, maxUses, currentUses: 0 }]
      }));
  }, []);

  const redeemPromoCode = useCallback((code: string) => {
      setGameState(prev => {
          if (prev.redeemedCodes.includes(code)) {
              alert("You have already redeemed this code!");
              return prev;
          }

          const promoIndex = prev.promoCodes.findIndex(c => c.code === code);
          if (promoIndex === -1) {
              alert("Invalid code.");
              return prev;
          }

          const promo = prev.promoCodes[promoIndex];
          if (promo.currentUses >= promo.maxUses) {
              alert("Code is fully redeemed.");
              return prev;
          }

          const newPromoCodes = [...prev.promoCodes];
          newPromoCodes[promoIndex] = { ...promo, currentUses: promo.currentUses + 1 };

          alert(`Redeemed! +$${promo.reward}`);

          return {
              ...prev,
              balance: prev.balance + promo.reward,
              promoCodes: newPromoCodes,
              redeemedCodes: [...prev.redeemedCodes, code]
          };
      });
  }, []);


  const getNextRarity = (currentRarity: Rarity): Rarity | null => {
      const index = RARITY_ORDER.indexOf(currentRarity);
      if (index === -1 || index === RARITY_ORDER.length - 1) return null;
      return RARITY_ORDER[index + 1];
  };

  const getItemsByRarity = (rarity: Rarity): ItemTemplate[] => {
      return Object.values(ITEMS).filter(i => i.rarity === rarity);
  };

  return {
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
    resetGame,
    buyPremium,
    getNextRarity,
    getItemsByRarity,
    recordDropStats,
    // Admin exports
    setGlobalLuck,
    triggerEvent,
    sendAdminEmail,
    createPromoCode,
    redeemPromoCode,
    consumeKey,
    hasKey,
    toggleMaintenance
  };
};