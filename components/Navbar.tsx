import React from 'react';
import { LayoutDashboard, Package, Dna, Coins, Menu, X, Trophy, ShoppingBag, LogOut, User, Gavel, ArrowRightLeft, Crown, TrendingUp, BookOpen } from 'lucide-react';
import { GameState } from '../types';
import { XP_PER_LEVEL_BASE, XP_MULTIPLIER } from '../constants';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  gameState: GameState;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, gameState, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const xpForNext = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, gameState.level - 1));
  const progress = Math.min(100, (gameState.xp / xpForNext) * 100);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);
  };

  const navItems = [
    { id: 'cases', label: 'Cases', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'catalog', label: 'Catalog', icon: BookOpen },
    { id: 'auction', label: 'Auction', icon: Gavel },
    { id: 'trade', label: 'Trade', icon: ArrowRightLeft },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'upgrader', label: 'Upgrader', icon: Dna },
    { id: 'slots', label: 'Slots', icon: Coins },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setTab('cases')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Case<span className="text-yellow-400">Clicker</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${currentTab === item.id 
                    ? 'bg-slate-800 text-yellow-400 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                  ${item.id === 'premium' ? 'text-yellow-400 hover:text-yellow-300' : ''}
                `}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Stats Display */}
          <div className="flex items-center gap-4">
             {/* Level/XP */}
             <div className="hidden sm:flex flex-col items-end min-w-[80px]">
                <div className="text-xs font-bold text-slate-300">Lvl {gameState.level}</div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Wallet */}
            <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-yellow-900">
                    $
                </div>
                <span className="font-mono font-bold text-yellow-400">{formatNumber(gameState.balance)}</span>
            </div>

            {/* User Profile / Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
               <div className="flex flex-col items-end">
                  <span className={`text-xs font-bold ${gameState.isPremium ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {gameState.username} {gameState.isPremium && '👑'}
                  </span>
                  <button onClick={onLogout} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                    <LogOut size={10} /> Logout
                  </button>
               </div>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${gameState.isPremium ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                  <User size={16} />
               </div>
            </div>

            {/* Mobile menu button */}
            <div className="xl:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-400 hover:text-white p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full px-3 py-3 rounded-md text-base font-medium flex items-center gap-3
                  ${currentTab === item.id 
                    ? 'bg-slate-800 text-yellow-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <button
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="w-full px-3 py-3 rounded-md text-base font-medium flex items-center gap-3 text-red-400 hover:bg-slate-800"
            >
                <LogOut size={20} />
                Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};