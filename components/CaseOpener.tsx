import React, { useState, useRef } from 'react';
import { CASES, ITEMS } from '../constants';
import { Case, ItemTemplate, RARITY_COLORS } from '../types';
import * as Icons from 'lucide-react';
import { GameState } from '../types';

interface CaseOpenerProps {
  gameState: GameState;
  onOpen: (caseId: string) => ItemTemplate | null;
  onWin: (templateId: string) => void;
  removeBalance: (amount: number) => void;
}

const CARD_WIDTH = 160;
const GAP = 16;
const SLOT_WIDTH = CARD_WIDTH + GAP;

export const CaseOpener: React.FC<CaseOpenerProps> = ({ gameState, onOpen, onWin, removeBalance }) => {
  const [selectedCase, setSelectedCase] = useState<Case>(CASES[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [wonItem, setWonItem] = useState<ItemTemplate | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [rollItems, setRollItems] = useState<ItemTemplate[]>([]);

  // Sound effects (dummy functions for now)
  const playClickSound = () => {};
  const playWinSound = () => {};

  // Check if user has key
  const userHasKey = selectedCase.keyTemplateId 
    ? gameState.inventory.some(i => i.templateId === selectedCase.keyTemplateId)
    : true;
  
  const requiredKeyName = selectedCase.keyTemplateId ? ITEMS[selectedCase.keyTemplateId]?.name : null;


  // Generate the visual strip of items for the animation
  const generateRollStrip = (winningItem: ItemTemplate) => {
    const strip: ItemTemplate[] = [];
    const caseItems = selectedCase.contains.map(c => ITEMS[c.templateId]);
    
    // Fill with random items from the case
    for (let i = 0; i < 50; i++) {
        const randomItem = caseItems[Math.floor(Math.random() * caseItems.length)];
        strip.push(randomItem);
    }
    
    // Place winning item at a specific index (e.g., 45)
    strip[45] = winningItem;
    // Add buffer at end
    for(let i = 0; i < 5; i++) {
       const randomItem = caseItems[Math.floor(Math.random() * caseItems.length)];
       strip.push(randomItem);
    }
    
    return strip;
  };

  const handleOpen = () => {
    if (isRolling) return;
    
    if (selectedCase.keyTemplateId && !userHasKey) {
        alert(`You need a ${requiredKeyName} to open this case! Buy one in the Shop.`);
        return;
    }

    if (selectedCase.price > 0 && gameState.balance < selectedCase.price) {
        alert("Not enough coins!");
        return;
    }

    const winner = onOpen(selectedCase.id);
    if (!winner) return;

    // 1. Set State for Roll
    setIsRolling(true);
    setWonItem(null);
    const strip = generateRollStrip(winner);
    setRollItems(strip);
    playClickSound();

    // 2. Handle Animation with Forced Reflow
    if (scrollContainerRef.current) {
        // A. Reset immediately to start position without animation
        scrollContainerRef.current.style.transition = 'none';
        scrollContainerRef.current.style.transform = 'translateX(0px)';

        // B. Force Reflow: Accessing offsetHeight forces the browser to apply the style change above immediately.
        // This prevents the browser from batching the reset with the spin, which causes the "teleport" glitch.
        void scrollContainerRef.current.offsetHeight;

        // C. Start the Spin Animation
        const targetIndex = 45;
        const randomOffset = Math.floor(Math.random() * 20) - 10; 
        const position = -(targetIndex * SLOT_WIDTH) + randomOffset;

        scrollContainerRef.current.style.transition = 'transform 6s cubic-bezier(0.15, 0.25, 0.10, 1.0)'; // Ease out quint
        scrollContainerRef.current.style.transform = `translateX(${position}px)`;
    }

    // 3. End rolling timeout matches animation duration
    setTimeout(() => {
        setIsRolling(false);
        setWonItem(winner);
        onWin(winner.id);
        playWinSound();
    }, 6000);
  };

  const handleReroll = () => {
      if (selectedCase.keyTemplateId && !userHasKey) {
          alert(`You need another ${requiredKeyName} to reroll!`);
          return;
      }
      
      const rerollCost = Math.floor(selectedCase.price / 2);
      if (rerollCost > 0 && gameState.balance < rerollCost) {
          alert("Not enough coins to reroll!");
          return;
      }
      
      if (rerollCost > 0) removeBalance(rerollCost);
      
      setWonItem(null);
      handleOpen();
  };

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-6">
      
      {/* Roller Area */}
      <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden mb-8">
        
        {/* Admin Luck Indicator */}
        {gameState.globalLuckMultiplier > 1 && (
            <div className="absolute top-2 right-2 z-30 bg-yellow-500/20 text-yellow-500 border border-yellow-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                <Icons.Zap size={12} /> LUCK x{gameState.globalLuckMultiplier} ACTIVE
            </div>
        )}

        {/* Center Line Indicator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-yellow-500 z-20 transform -translate-x-1/2 shadow-[0_0_15px_rgba(234,179,8,1)]"></div>
        <div className="absolute left-1/2 top-4 -translate-x-1/2 z-20 text-yellow-500 animate-bounce"><Icons.ChevronDown size={24} /></div>
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 text-yellow-500 animate-bounce"><Icons.ChevronUp size={24} /></div>

        {/* Fade overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

        {/* Moving Strip */}
        <div 
            className="absolute top-1/2 -translate-y-1/2 left-1/2 h-48 flex items-center will-change-transform"
            style={{ marginLeft: `-${CARD_WIDTH / 2}px`, gap: `${GAP}px` }}
            ref={scrollContainerRef}
        >
            {rollItems.length > 0 ? rollItems.map((item, idx) => (
                <div 
                    key={idx}
                    className={`flex-shrink-0 rounded-lg border-2 ${RARITY_COLORS[item.rarity].bg} bg-opacity-0 ${RARITY_COLORS[item.rarity].border} flex flex-col items-center justify-center p-4 relative overflow-hidden group`}
                    style={{ width: `${CARD_WIDTH}px`, height: `${CARD_WIDTH}px` }}
                >
                    <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-60`}></div>
                    <div className={`relative z-10 ${RARITY_COLORS[item.rarity].text} mb-2`}>
                        <LucideIcon name={item.icon} size={48} />
                    </div>
                </div>
            )) : (
                // Placeholder when not rolling
                <div className="text-slate-600 font-mono absolute left-1/2 -translate-x-1/2 whitespace-nowrap opacity-50">READY TO ROLL</div>
            )}
        </div>
      </div>

      {/* Won Item Modal/Overlay */}
      {wonItem && !isRolling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className={`bg-slate-900 border-2 ${RARITY_COLORS[wonItem.rarity].border} p-8 rounded-2xl max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-100 transition-all`}>
                {/* Background Glow */}
                <div className={`absolute top-0 left-0 right-0 h-32 ${RARITY_COLORS[wonItem.rarity].bg} opacity-20 blur-3xl`}></div>
                
                <h2 className="text-3xl font-bold text-white mb-2 relative z-10">YOU WON!</h2>
                
                <div className="my-8 flex justify-center relative z-10">
                    <div className={`w-32 h-32 rounded-xl flex items-center justify-center ${RARITY_COLORS[wonItem.rarity].bg} bg-opacity-20 border-2 ${RARITY_COLORS[wonItem.rarity].border} ${RARITY_COLORS[wonItem.rarity].glow}`}>
                        <LucideIcon name={wonItem.icon} size={64} className={RARITY_COLORS[wonItem.rarity].text} />
                    </div>
                </div>

                <h3 className={`text-2xl font-bold mb-2 ${RARITY_COLORS[wonItem.rarity].text}`}>{wonItem.name}</h3>
                <span className="text-xs uppercase bg-black/40 px-2 py-1 rounded text-slate-300 mb-2 inline-block">{wonItem.type}</span>
                <p className="text-slate-400 mb-6 font-mono text-lg">${wonItem.baseValue}</p>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setWonItem(null)}
                        className="py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                    >
                        Collect
                    </button>
                    <button 
                        onClick={handleReroll}
                        className="py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors flex flex-col items-center justify-center leading-tight"
                    >
                        <span>Reroll</span>
                        {/* If it costs money, show cost, otherwise show KEY required */}
                        {selectedCase.price > 0 ? (
                            <span className="text-xs text-yellow-400 font-mono">${Math.floor(selectedCase.price / 2)}</span>
                        ) : (
                            <span className="text-xs text-orange-400 font-mono">1 Key</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Case Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CASES.map((box) => (
            <button
                key={box.id}
                onClick={() => !isRolling && setSelectedCase(box)}
                disabled={isRolling}
                className={`relative group p-6 rounded-xl border-2 transition-all duration-200 text-left
                    ${selectedCase.id === box.id 
                        ? 'border-yellow-500 bg-slate-800' 
                        : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'}
                `}
            >
                <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-200">{box.image}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{box.name}</h3>
                <p className="text-slate-400 text-xs mb-3 h-8">{box.description}</p>
                <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold">
                    {box.price > 0 && <><Icons.DollarSign size={14} />{box.price}</>}
                </div>
                {selectedCase.id === box.id && (
                     <div className="absolute inset-0 border-2 border-yellow-500 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(234,179,8,0.2)]"></div>
                )}
            </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md flex justify-center z-40">
        <button
            onClick={handleOpen}
            // Logic: Disable ONLY if rolling. If key missing, we want to allow click so alert shows (or use enabled state to show orange button)
            // But visually we want distinct styles.
            disabled={isRolling}
            className={`
                px-12 py-4 rounded-full font-bold text-xl tracking-wide shadow-lg transform transition-all
                flex items-center gap-3
                ${isRolling 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : !userHasKey && selectedCase.keyTemplateId
                        ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-orange-900/50' // Orange for Key
                        : (selectedCase.price > 0 && gameState.balance < selectedCase.price)
                            ? 'bg-red-900/50 text-red-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:scale-105 active:scale-95'}
            `}
        >
            {isRolling ? (
                <>Opening...</>
            ) : (
                <>
                    {userHasKey ? (
                        <>OPEN CASE {selectedCase.price > 0 && <span className="bg-black/20 px-2 py-0.5 rounded text-sm">${selectedCase.price}</span>}</>
                    ) : (
                        <span className="flex items-center gap-2">
                             <Icons.Lock size={18} /> NEED {requiredKeyName?.toUpperCase()}
                        </span>
                    )}
                </>
            )}
        </button>
      </div>

        {/* Case Contents Preview */}
        <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Case Contents</h3>
            <div className="flex flex-wrap gap-2">
                {selectedCase.contains.map((c) => {
                    const item = ITEMS[c.templateId];
                    return (
                        <div key={item.id} className={`
                            px-3 py-2 rounded-lg border bg-slate-900 flex items-center gap-2
                            ${RARITY_COLORS[item.rarity].border}
                        `}>
                            <LucideIcon name={item.icon} size={16} className={RARITY_COLORS[item.rarity].text} />
                            <span className={`text-xs font-medium ${RARITY_COLORS[item.rarity].text}`}>{item.name}</span>
                            <span className="text-xs text-slate-500 ml-1">{c.weight}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
        <div className="h-20"></div> {/* Spacer for fixed bottom bar */}
    </div>
  );
};