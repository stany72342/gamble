import React from 'react';
import { GameState } from '../types';
import { Crown, Zap, Coins, Clock, Star } from 'lucide-react';

interface PremiumProps {
  gameState: GameState;
  onBuyPremium: () => void;
}

export const Premium: React.FC<PremiumProps> = ({ gameState, onBuyPremium }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        
        <div className="mb-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                <Crown size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-black text-white mb-2">BECOME A LEGEND</h1>
            <p className="text-xl text-yellow-400 font-bold">Unlock Exclusive Perks & 2x Rewards</p>
        </div>

        {gameState.isPremium ? (
             <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-500/50 rounded-2xl p-12 max-w-2xl mx-auto">
                 <h2 className="text-3xl font-bold text-white mb-4">YOU ARE PREMIUM!</h2>
                 <p className="text-slate-300 mb-6">Your benefits are currently active.</p>
                 <div className="flex justify-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" />
                    <Star className="text-yellow-400 fill-yellow-400" />
                    <Star className="text-yellow-400 fill-yellow-400" />
                    <Star className="text-yellow-400 fill-yellow-400" />
                    <Star className="text-yellow-400 fill-yellow-400" />
                 </div>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Free Plan */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-slate-400 mb-2">Standard</h3>
                    <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                    
                    <ul className="space-y-4 mb-8 text-left w-full">
                        <li className="flex items-center gap-3 text-slate-300">
                            <Clock size={16} /> Basic Passive Income
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <Coins size={16} /> Standard Luck
                        </li>
                        <li className="flex items-center gap-3 text-slate-500 line-through">
                            <Zap size={16} /> 2x XP Gain
                        </li>
                    </ul>
                    
                    <button disabled className="mt-auto w-full py-3 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed">
                        CURRENT PLAN
                    </button>
                </div>

                {/* Premium Plan */}
                <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl p-8 flex flex-col items-center transform scale-105 shadow-2xl shadow-yellow-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
                    
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">PREMIUM ELITE</h3>
                    <div className="text-3xl font-bold text-white mb-6">$4.99 <span className="text-sm font-normal text-slate-500">/ month</span></div>
                    
                    <ul className="space-y-4 mb-8 text-left w-full">
                        <li className="flex items-center gap-3 text-white">
                            <Clock size={16} className="text-yellow-500" /> <span className="font-bold">2x Passive Income</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <Zap size={16} className="text-yellow-500" /> <span className="font-bold">2x XP Gain</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <Crown size={16} className="text-yellow-500" /> <span className="font-bold">Golden Name Color</span>
                        </li>
                         <li className="flex items-center gap-3 text-white">
                            <Star size={16} className="text-yellow-500" /> <span className="font-bold">Priority Support</span>
                        </li>
                    </ul>
                    
                    <button 
                        onClick={onBuyPremium}
                        className="mt-auto w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                    >
                        UPGRADE NOW
                    </button>
                </div>
            </div>
        )}
        
        <p className="text-slate-500 text-sm">Payments are processed securely (Simulation).</p>
    </div>
  );
};