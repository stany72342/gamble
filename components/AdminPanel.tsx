import React, { useState } from 'react';
import { ShieldAlert, Zap, Mail, Percent, AlertTriangle, TrendingUp, Gift, Users, Server, Construction, Edit } from 'lucide-react';
import { GameState } from '../types';

interface AdminPanelProps {
  gameState: GameState;
  onSetLuck: (multiplier: number) => void;
  onTriggerEvent: (eventName: string | null) => void;
  onSendEmail: (subject: string, body: string) => void;
  onSetLevel: (level: number) => void;
  onCreatePromo: (code: string, reward: number, maxUses: number) => void;
  onToggleMaintenance: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    gameState, 
    onSetLuck, 
    onTriggerEvent, 
    onSendEmail, 
    onSetLevel, 
    onCreatePromo, 
    onToggleMaintenance, 
    onClose 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const [promoCode, setPromoCode] = useState('');
  const [promoReward, setPromoReward] = useState('1000');
  const [promoMax, setPromoMax] = useState('100');

  // Simulated User Data for display
  const mockUsers = [
      { id: 1001, username: 'NinjaSlayer99', level: 42, balance: 15400000, lastLogin: '2 mins ago' },
      { id: 1002, username: 'KaiCenatFan', level: 38, balance: 12000000, lastLogin: '5 hours ago' },
      { id: 1003, username: 'CaseOpenerPro', level: 35, balance: 8500000, lastLogin: '1 day ago' },
      { id: 1004, username: 'RNG_God', level: 29, balance: 5000000, lastLogin: '3 days ago' },
      { id: 1005, username: 'LuckyStrike', level: 20, balance: 2100000, lastLogin: '1 week ago' },
  ];

  // Add current user to list
  const allUsers = [
      { id: 9999, username: gameState.username, level: gameState.level, balance: gameState.balance, lastLogin: 'Active Now' },
      ...mockUsers
  ];
  
  // Calculate Stats
  const totalMembers = allUsers.length + 140000; // Simulated big number
  // Assume each mock user has ~100 items + current user inventory
  const totalWeapons = gameState.inventory.length + (mockUsers.length * 100) + 2500000;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    onSendEmail(emailSubject, emailBody);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleCreatePromo = (e: React.FormEvent) => {
      e.preventDefault();
      onCreatePromo(promoCode, parseInt(promoReward), parseInt(promoMax));
      setPromoCode('');
      alert("Code Created!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-red-600 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.5)] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-red-900/50 p-6 flex justify-between items-center border-b border-red-800 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-lg">
               <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Admin Command Center</h2>
              <p className="text-red-300 text-sm font-mono">Logged in as: {gameState.username} (SUPERUSER)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold px-4 py-2 hover:bg-red-950/50 rounded">
            CLOSE TERMINAL
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-4 font-bold text-sm uppercase tracking-wide ${activeTab === 'dashboard' ? 'bg-slate-900 text-white border-b-2 border-red-500' : 'text-slate-500 hover:text-white'}`}
            >
                Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-bold text-sm uppercase tracking-wide ${activeTab === 'users' ? 'bg-slate-900 text-white border-b-2 border-red-500' : 'text-slate-500 hover:text-white'}`}
            >
                User Accounts
            </button>
             <button 
                onClick={() => setActiveTab('editor')}
                className={`px-6 py-4 font-bold text-sm uppercase tracking-wide ${activeTab === 'editor' ? 'bg-slate-900 text-white border-b-2 border-red-500' : 'text-slate-500 hover:text-white'}`}
            >
                GUI Editor
            </button>
        </div>

        {activeTab === 'users' ? (
            <div className="p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="text-blue-500" /> Registered Accounts
                </h3>
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Level</th>
                                <th className="p-4">Balance</th>
                                <th className="p-4">Last Seen</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                            {allUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-900/50">
                                    <td className="p-4 font-mono text-slate-500">#{user.id}</td>
                                    <td className="p-4 font-bold text-white">{user.username}</td>
                                    <td className="p-4">{user.level}</td>
                                    <td className="p-4 text-green-400 font-mono">${user.balance.toLocaleString()}</td>
                                    <td className="p-4">{user.lastLogin}</td>
                                    <td className="p-4">
                                        <button className="text-red-500 hover:text-red-400 font-bold text-xs uppercase" onClick={() => alert("Action restricted in Demo Mode")}>Ban</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : activeTab === 'editor' ? (
            <div className="p-8">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Edit className="text-purple-500" /> GUI & System Config
                </h3>
                
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-6">
                    <h4 className="font-bold text-white mb-4">System Status</h4>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-400">Maintenance Mode</div>
                            <div className="text-xs text-slate-500">Blocks access for non-admin users.</div>
                        </div>
                        <button 
                            onClick={onToggleMaintenance}
                            className={`px-4 py-2 rounded font-bold transition-all ${gameState.maintenanceMode ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}`}
                        >
                            {gameState.maintenanceMode ? 'ACTIVE' : 'DISABLED'}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 opacity-50 pointer-events-none">
                     <h4 className="font-bold text-white mb-4">Theme Editor (Locked)</h4>
                     <p className="text-slate-400 text-sm">Theme customization requires restart.</p>
                </div>
            </div>
        ) : (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Server Stats */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 md:col-span-2">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Server className="text-green-500" /> 
                    Live Network Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-lg">
                        <div className="text-slate-400 text-xs font-bold uppercase">Total Members</div>
                        <div className="text-2xl font-mono font-bold text-white">{totalMembers.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg">
                         <div className="text-slate-400 text-xs font-bold uppercase">Total Items (Weapons)</div>
                         <div className="text-2xl font-mono font-bold text-yellow-400">{totalWeapons.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Admin Abuse / Luck Control */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Percent className="text-yellow-500" /> 
                    RNG Manipulation
                </h3>
                
                <div className="space-y-4">
                    <p className="text-slate-400 text-sm">
                    Global Luck Multiplier affects all drops for ALL players. Use with caution.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                    {[1, 5, 10, 50, 100].map(mult => (
                        <button
                        key={mult}
                        onClick={() => onSetLuck(mult)}
                        className={`py-3 rounded font-bold font-mono transition-all
                            ${gameState.globalLuckMultiplier === mult 
                            ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                        `}
                        >
                        {mult}x
                        </button>
                    ))}
                    </div>
                    {gameState.globalLuckMultiplier > 1 && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded text-yellow-500 text-center font-bold animate-pulse">
                        WARNING: MARKET INFLATION IMMINENT
                    </div>
                    )}
                </div>
            </div>

            {/* Level / Progression Control */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-purple-500" /> 
                    Player Progression
                </h3>
                
                <div className="space-y-4">
                    <p className="text-slate-400 text-sm">
                    Force set your account level. High levels unlock exclusive cases.
                    </p>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-white">Current Level: {gameState.level}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onSetLevel(1)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-sm font-bold">Lvl 1</button>
                        <button onClick={() => onSetLevel(10)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-sm font-bold">Lvl 10</button>
                        <button onClick={() => onSetLevel(50)} className="bg-purple-600 hover:bg-purple-500 p-2 rounded text-sm font-bold text-white">Lvl 50 (MAX)</button>
                    </div>
                </div>
            </div>

            {/* Event Triggers */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="text-blue-500" /> 
                    Live Operations
                </h3>
                
                <div className="space-y-4">
                    <button
                    onClick={() => onTriggerEvent(gameState.activeEvent ? null : 'GOLDEN_HOUR')}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all
                        ${gameState.activeEvent === 'GOLDEN_HOUR'
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg animate-pulse'
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}
                    `}
                    >
                    {gameState.activeEvent === 'GOLDEN_HOUR' ? 'END GOLDEN HOUR' : 'START GOLDEN HOUR'}
                    </button>
                    <div className="text-xs text-slate-500 text-center">
                    Event status: {gameState.activeEvent || 'NONE'}
                    </div>
                </div>
            </div>

            {/* Promo Codes */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Gift className="text-pink-500" /> 
                    Create Promo Code
                </h3>
                
                <form onSubmit={handleCreatePromo} className="space-y-3">
                    <input 
                        type="text" placeholder="Code (e.g. FREE100)"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                        value={promoCode} onChange={e => setPromoCode(e.target.value)} required
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            type="number" placeholder="Reward $"
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                            value={promoReward} onChange={e => setPromoReward(e.target.value)} required
                        />
                        <input 
                            type="number" placeholder="Max Uses"
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                            value={promoMax} onChange={e => setPromoMax(e.target.value)} required
                        />
                    </div>
                    <button className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded">CREATE CODE</button>
                </form>
            </div>

            {/* Broadcast System */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Mail className="text-green-500" /> 
                    Mass Communication
                </h3>

                <form onSubmit={handleSendEmail} className="space-y-4">
                    <input 
                    type="text" 
                    placeholder="Subject Line"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    required
                    />
                    <textarea 
                    placeholder="Message body (HTML supported)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500 outline-none h-24"
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    required
                    />
                    <div className="flex justify-between items-center">
                    <div className="text-slate-500 text-sm">
                        Recipients: <span className="text-white font-mono">{(totalMembers/1000000).toFixed(1)}M</span>
                    </div>
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                        >
                        SEND <AlertTriangle size={16} />
                    </button>
                    </div>
                    {emailSent && (
                    <div className="text-green-400 font-bold text-center mt-2 animate-in fade-in">
                        ✓ Sent
                    </div>
                    )}
                </form>
            </div>

            </div>
        )}
      </div>
    </div>
  );
};