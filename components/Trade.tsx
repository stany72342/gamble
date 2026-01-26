import React, { useState } from 'react';
import { GameState, RARITY_COLORS } from '../types';
import * as Icons from 'lucide-react';

interface TradeProps {
  gameState: GameState;
  onCreateTrade: (itemId: string) => string;
  onRedeemTrade: (code: string) => string;
}

export const Trade: React.FC<TradeProps> = ({ gameState, onCreateTrade, onRedeemTrade }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'redeem'>('send');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  const handleCreate = (itemId: string) => {
      const code = onCreateTrade(itemId);
      setGeneratedCode(code);
  };

  const handleRedeem = (e: React.FormEvent) => {
      e.preventDefault();
      const result = onRedeemTrade(redeemCode.toUpperCase());
      if (result === 'success') {
          setRedeemMessage('SUCCESS! Item received.');
          setRedeemCode('');
      } else {
          setRedeemMessage('ERROR: Invalid or expired code.');
      }
      setTimeout(() => setRedeemMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Icons.ArrowRightLeft className="text-green-400" />
            Player Exchange
        </h2>

        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => setActiveTab('send')}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${activeTab === 'send' ? 'bg-slate-800 text-white border-2 border-green-500' : 'bg-slate-900 text-slate-500 border-2 border-transparent'}`}
            >
                SEND ITEM
            </button>
            <button 
                onClick={() => setActiveTab('redeem')}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${activeTab === 'redeem' ? 'bg-slate-800 text-white border-2 border-blue-500' : 'bg-slate-900 text-slate-500 border-2 border-transparent'}`}
            >
                REDEEM CODE
            </button>
        </div>

        {activeTab === 'send' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                {generatedCode ? (
                    <div className="text-center py-12 animate-in fade-in zoom-in">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icons.Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Trade Offer Created!</h3>
                        <p className="text-slate-400 mb-6">Share this code with your friend. The item has been removed from your inventory.</p>
                        
                        <div className="bg-black p-6 rounded-xl border-2 border-dashed border-slate-700 max-w-sm mx-auto mb-6">
                            <span className="font-mono text-4xl font-bold tracking-[0.2em] text-yellow-400 select-all">{generatedCode}</span>
                        </div>

                        <button 
                            onClick={() => setGeneratedCode(null)}
                            className="text-slate-500 hover:text-white underline"
                        >
                            Send another item
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-400 mb-6">Select an item to generate a secure transfer code.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {gameState.inventory.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => handleCreate(item.id)}
                                    className={`
                                        bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-green-500 transition-all text-left group
                                        hover:bg-slate-900
                                    `}
                                >
                                    <div className={`mb-3 ${RARITY_COLORS[item.rarity].text}`}>
                                        <LucideIcon name={item.icon} size={32} />
                                    </div>
                                    <div className={`font-bold text-sm truncate ${RARITY_COLORS[item.rarity].text}`}>{item.name}</div>
                                    <div className="text-xs text-slate-500">${item.value}</div>
                                </button>
                            ))}
                        </div>
                        {gameState.inventory.length === 0 && <div className="text-slate-500 text-center py-10">Your inventory is empty.</div>}
                    </>
                )}
            </div>
        )}

        {activeTab === 'redeem' && (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-full max-w-md">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">Enter Trade Code</h3>
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="XXXXXX"
                            maxLength={6}
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value)}
                            className="w-full bg-black border-2 border-slate-700 rounded-xl p-6 text-center text-3xl font-mono tracking-[0.5em] text-white focus:border-blue-500 outline-none uppercase placeholder-slate-800"
                        />
                        <button 
                            type="submit"
                            disabled={redeemCode.length < 6}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                        >
                            CLAIM ITEM
                        </button>
                    </form>
                    
                    {redeemMessage && (
                        <div className={`mt-6 p-4 rounded-lg text-center font-bold animate-in fade-in slide-in-from-bottom-2 ${redeemMessage.includes('SUCCESS') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {redeemMessage}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};