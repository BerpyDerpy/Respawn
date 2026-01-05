import React, { useState, useEffect } from 'react';
import { Shield, Zap, BookOpen, Smile, Award, Plus, Check, Trash2, Activity, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Constants & Config ---
const STATS = {
  STR: { label: 'Strength', icon: <Shield size={16} />, color: 'bg-red-500', text: 'text-red-400' },
  INT: { label: 'Intellect', icon: <BookOpen size={16} />, color: 'bg-blue-500', text: 'text-blue-400' },
  DEX: { label: 'Dexterity', icon: <Zap size={16} />, color: 'bg-yellow-500', text: 'text-yellow-400' },
  CHA: { label: 'Charisma', icon: <Smile size={16} />, color: 'bg-purple-500', text: 'text-purple-400' },
};

const LEVEL_BASE_XP = 100;

// --- Helper Components ---

const StatBar = ({ label, value, max, colorClass, icon }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-1 font-bold text-gray-300">
      <span className="flex items-center gap-1">{icon} {label}</span>
      <span>{value}</span>
    </div>
    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-500`} 
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl max-w-sm w-full shadow-2xl">
        {children}
        <button onClick={onClose} className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-400">
          Close
        </button>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function LifeRPG() {
  // State
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState({
    name: 'Player 1',
    level: 1,
    xp: 0,
    stats: { STR: 5, INT: 5, DEX: 5, CHA: 5 }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', stat: 'STR' });
  const [history, setHistory] = useState([]); // For chart data

  // Load Data on Mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('rpg_user'));
    const savedHabits = JSON.parse(localStorage.getItem('rpg_habits'));
    const savedHistory = JSON.parse(localStorage.getItem('rpg_history'));
    
    if (savedUser) setUser(savedUser);
    if (savedHabits) setHabits(savedHabits);
    if (savedHistory) setHistory(savedHistory);
  }, []);

  // Save Data on Change
  useEffect(() => {
    localStorage.setItem('rpg_user', JSON.stringify(user));
    localStorage.setItem('rpg_habits', JSON.stringify(habits));
    localStorage.setItem('rpg_history', JSON.stringify(history));
  }, [user, habits, history]);

  // Logic: Add Habit
  const addHabit = () => {
    if (!newHabit.name) return;
    const habit = {
      id: Date.now(),
      name: newHabit.name,
      stat: newHabit.stat,
      completedToday: false,
      streak: 0
    };
    setHabits([...habits, habit]);
    setNewHabit({ name: '', stat: 'STR' });
    setShowAddModal(false);
  };

  // Logic: Complete Habit
  const completeHabit = (id) => {
    const habitIndex = habits.findIndex(h => h.id === id);
    if (habits[habitIndex].completedToday) return;

    const habit = habits[habitIndex];
    const statKey = habit.stat;
    const xpGain = 20;
    const statGain = 1;

    // Update User
    const nextLevelXP = user.level * LEVEL_BASE_XP;
    let newXP = user.xp + xpGain;
    let newLevel = user.level;
    
    // Level Up Logic
    if (newXP >= nextLevelXP) {
      newXP = newXP - nextLevelXP;
      newLevel += 1;
      alert(`LEVEL UP! You are now level ${newLevel}`);
    }

    setUser(prev => ({
      ...prev,
      level: newLevel,
      xp: newXP,
      stats: {
        ...prev.stats,
        [statKey]: prev.stats[statKey] + statGain
      }
    }));

    // Update Habit
    const newHabits = [...habits];
    newHabits[habitIndex] = { ...habit, completedToday: true, streak: habit.streak + 1 };
    setHabits(newHabits);

    // Update History (Simulated for chart)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    setHistory(prev => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.day === today) {
            const updated = [...prev];
            updated[updated.length - 1].xp = (updated[updated.length - 1].xp || 0) + xpGain;
            return updated;
        }
        return [...prev.slice(-6), { day: today, xp: xpGain }];
    });
  };

  // Logic: Reset Daily (Ideally handled by backend, simulated here)
  const resetDaily = () => {
     const newHabits = habits.map(h => ({ ...h, completedToday: false }));
     setHabits(newHabits);
  };

  const xpToNextLevel = user.level * LEVEL_BASE_XP;
  const progressPercent = (user.xp / xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-green-500 selection:text-black">
      
      {/* --- HEADER / HERO --- */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black p-6 border-b border-gray-800">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-gray-400 text-xs tracking-widest uppercase">Character Profile</h2>
              <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
            </div>
            <div className="text-center bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
               <span className="block text-xs text-gray-400 uppercase">Level</span>
               <span className="text-2xl font-bold text-green-400">{user.level}</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="relative h-4 w-full bg-gray-800 rounded-full overflow-hidden mb-6 border border-gray-700">
            <div 
              className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
                <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-widest text-white drop-shadow-md">
              XP: {user.xp} / {xpToNextLevel}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(user.stats).map(([key, val]) => (
              <StatBar 
                key={key} 
                label={STATS[key].label} 
                value={val} 
                max={50 + (user.level * 5)} 
                colorClass={STATS[key].color} 
                icon={STATS[key].icon} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-md mx-auto p-4 pb-24">
        
        {/* Actions Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-green-500" size={20}/> Quest Log
          </h3>
          <div className="flex gap-2">
            <button onClick={resetDaily} className="p-2 bg-gray-800 rounded-lg text-xs hover:bg-gray-700 text-gray-400">Debug: New Day</button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              <Plus size={16} /> New Quest
            </button>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 && (
            <div className="text-center p-8 text-gray-600 border border-gray-800 border-dashed rounded-xl">
              <p>No active quests.</p>
              <p className="text-sm">Add a habit to start gaining XP.</p>
            </div>
          )}
          
          {habits.map((habit) => (
            <div 
              key={habit.id} 
              className={`relative group overflow-hidden p-4 rounded-xl border transition-all duration-300 ${
                habit.completedToday 
                  ? 'bg-gray-900 border-green-900/50 opacity-60' 
                  : 'bg-gray-900 border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-opacity-20 ${STATS[habit.stat].color.replace('bg-', 'text-')}`}>
                    {STATS[habit.stat].icon}
                  </div>
                  <div>
                    <h4 className={`font-bold ${habit.completedToday ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {habit.name}
                    </h4>
                    <span className={`text-xs font-mono ${STATS[habit.stat].text}`}>
                      +{STATS[habit.stat].label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => completeHabit(habit.id)}
                  disabled={habit.completedToday}
                  className={`p-3 rounded-full transition-all ${
                    habit.completedToday 
                      ? 'bg-green-900 text-green-500' 
                      : 'bg-gray-800 hover:bg-green-600 hover:text-black text-gray-400'
                  }`}
                >
                  <Check size={20} />
                </button>
              </div>
              
              {/* Streak Badge */}
              {habit.streak > 0 && (
                 <div className="absolute top-2 right-14 text-[10px] bg-gray-800 px-2 py-0.5 rounded text-yellow-500 font-mono">
                   🔥 {habit.streak}
                 </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="mt-8 bg-gray-900 p-4 rounded-xl border border-gray-800">
           <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
             <TrendingUp size={16}/> XP History
           </h3>
           <div className="h-40 w-full text-xs">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={history.length ? history : [{day: 'Now', xp: 0}]}>
                 <XAxis dataKey="day" stroke="#525252" />
                 <YAxis stroke="#525252" />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }} 
                    itemStyle={{ color: '#4ade80' }}
                 />
                 <Line type="monotone" dataKey="xp" stroke="#4ade80" strokeWidth={2} dot={{r: 4, fill: '#4ade80'}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* --- ADD HABIT MODAL --- */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 className="text-xl font-bold text-white mb-4">New Quest</h2>
        <input 
          autoFocus
          type="text" 
          placeholder="Quest Name (e.g. 10 Pushups)" 
          className="w-full bg-black border border-gray-700 text-white p-3 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
          value={newHabit.name}
          onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(STATS).map(([key, stat]) => (
            <button
              key={key}
              onClick={() => setNewHabit({...newHabit, stat: key})}
              className={`p-2 rounded-lg border text-sm flex items-center gap-2 transition-colors ${
                newHabit.stat === key 
                  ? 'bg-green-900/30 border-green-500 text-green-400' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
              }`}
            >
              {stat.icon} {stat.label}
            </button>
          ))}
        </div>
        <button 
          onClick={addHabit}
          className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded-lg"
        >
          Initialize Quest
        </button>
      </Modal>

    </div>
  );
}