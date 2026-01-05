import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, BookOpen, Smile, Plus, Check, TrendingUp, Skull, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Configuration ---
const STATS = {
  STR: { label: 'Strength', icon: <Shield size={16} />, color: 'bg-red-600', text: 'text-red-400' },
  INT: { label: 'Intellect', icon: <BookOpen size={16} />, color: 'bg-blue-600', text: 'text-blue-400' },
  DEX: { label: 'Dexterity', icon: <Zap size={16} />, color: 'bg-yellow-500', text: 'text-yellow-400' },
  CHA: { label: 'Charisma', icon: <Smile size={16} />, color: 'bg-purple-600', text: 'text-purple-400' },
};

const LEVEL_BASE_XP = 100;
const MAX_HP = 100;
const DAMAGE_PER_MISSED_HABIT = 10;

// --- Sound Effects URLs ---
const SOUNDS = {
  complete: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3', // Retro coin sound
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Success fanfare
  damage: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Retro negative hit
};

// --- Helper Components ---
const StatBar = ({ label, value, max, colorClass, icon }) => (
  <div className="mb-3">
    <div className="flex justify-between text-[10px] uppercase mb-1 font-bold text-gray-400 tracking-wider">
      <span className="flex items-center gap-2">{icon} {label}</span>
      <span>{value}</span>
    </div>
    <div className="h-3 w-full bg-gray-900 border border-gray-700 rounded-full overflow-hidden">
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-gray-900 border-2 border-gray-700 p-6 rounded-xl max-w-sm w-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {children}
        <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs uppercase tracking-widest text-gray-400 font-bold">
          Close Menu
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
    hp: MAX_HP,
    stats: { STR: 5, INT: 5, DEX: 5, CHA: 5 }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', stat: 'STR' });
  const [history, setHistory] = useState([]);

  // Audio Refs
  const sfxComplete = useRef(new Audio(SOUNDS.complete));
  const sfxLevelUp = useRef(new Audio(SOUNDS.levelUp));
  const sfxDamage = useRef(new Audio(SOUNDS.damage));

  // Load Data
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('rpg_user'));
    const savedHabits = JSON.parse(localStorage.getItem('rpg_habits'));
    const savedHistory = JSON.parse(localStorage.getItem('rpg_history'));
    
    if (savedUser) setUser(savedUser);
    if (savedHabits) setHabits(savedHabits);
    if (savedHistory) setHistory(savedHistory);
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('rpg_user', JSON.stringify(user));
    localStorage.setItem('rpg_habits', JSON.stringify(habits));
    localStorage.setItem('rpg_history', JSON.stringify(history));
  }, [user, habits, history]);

  // Helper: Play Sound
  const playSound = (audioRef) => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.log("Audio play failed:", e));
  };

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

    playSound(sfxComplete);

    const habit = habits[habitIndex];
    const statKey = habit.stat;
    const xpGain = 20;
    const statGain = 1;

    // XP & Level Logic
    const nextLevelXP = user.level * LEVEL_BASE_XP;
    let newXP = user.xp + xpGain;
    let newLevel = user.level;
    
    if (newXP >= nextLevelXP) {
      newXP = newXP - nextLevelXP;
      newLevel += 1;
      playSound(sfxLevelUp);
      alert(`LEVEL UP! You are now level ${newLevel}`);
    }

    // Heal slightly on completion
    let newHP = Math.min(user.hp + 5, MAX_HP);

    setUser(prev => ({
      ...prev,
      level: newLevel,
      xp: newXP,
      hp: newHP,
      stats: {
        ...prev.stats,
        [statKey]: prev.stats[statKey] + statGain
      }
    }));

    // Update Habit
    const newHabits = [...habits];
    newHabits[habitIndex] = { ...habit, completedToday: true, streak: habit.streak + 1 };
    setHabits(newHabits);

    // Update Chart History
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

  // Logic: End Day (Calculate Damage)
  const endDay = () => {
    const missedHabits = habits.filter(h => !h.completedToday);
    const damage = missedHabits.length * DAMAGE_PER_MISSED_HABIT;

    if (damage > 0) {
      playSound(sfxDamage);
      let newHP = user.hp - damage;
      
      if (newHP <= 0) {
        newHP = MAX_HP; // Respawn
        alert("YOU DIED. You lost a level. Respawning...");
        setUser(prev => ({ 
          ...prev, 
          level: Math.max(1, prev.level - 1), 
          hp: MAX_HP,
          xp: 0
        }));
      } else {
        alert(`You took ${damage} damage from missed quests!`);
        setUser(prev => ({ ...prev, hp: newHP }));
      }
    } else {
      alert("Perfect day! Full heal.");
      setUser(prev => ({ ...prev, hp: MAX_HP }));
    }

    // Reset habits for next day
    const newHabits = habits.map(h => ({ 
      ...h, 
      completedToday: false,
      streak: h.completedToday ? h.streak : 0 // Reset streak if missed
    }));
    setHabits(newHabits);
  };

  const xpToNextLevel = user.level * LEVEL_BASE_XP;
  const progressPercent = (user.xp / xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans pb-10">
      
      {/* --- HEADER --- */}
      <div className="bg-gray-900 border-b-2 border-gray-800 p-6 shadow-2xl">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Character</h2>
              <h1 className="text-3xl font-black text-white tracking-tighter drop-shadow-md">{user.name}</h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Lvl</span>
              <div className="text-4xl font-black text-yellow-400 leading-none">{user.level}</div>
            </div>
          </div>

          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
              <span className="flex items-center gap-1"><Heart size={10} fill="currentColor"/> HP</span>
              <span>{user.hp} / {MAX_HP}</span>
            </div>
            <div className="h-4 w-full bg-gray-950 border border-gray-800 rounded-sm relative">
              <div 
                className="h-full bg-red-600 transition-all duration-300" 
                style={{ width: `${(user.hp / MAX_HP) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">
              <span>XP</span>
              <span>{user.xp} / {xpToNextLevel}</span>
            </div>
            <div className="h-2 w-full bg-gray-950 border border-gray-800 rounded-sm">
              <div 
                className="h-full bg-green-500 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
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

      {/* --- CONTENT --- */}
      <div className="max-w-md mx-auto p-4 space-y-8">
        
        {/* Actions */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="text-yellow-400" size={18}/> Active Quests
          </h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all border border-blue-400"
          >
            <Plus size={14} /> Add Quest
          </button>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
              <p className="text-gray-500 font-bold text-sm">QUEST LOG EMPTY</p>
            </div>
          )}
          
          {habits.map((habit) => (
            <div 
              key={habit.id} 
              className={`relative group p-4 rounded-lg border-l-4 transition-all duration-200 ${
                habit.completedToday 
                  ? 'bg-gray-900 border-gray-700 border-l-gray-600 opacity-50' 
                  : 'bg-gray-800 border-gray-700 border-l-yellow-500 hover:bg-gray-750 hover:translate-x-1'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded bg-gray-900 ${STATS[habit.stat].text}`}>
                    {STATS[habit.stat].icon}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm uppercase tracking-wide ${habit.completedToday ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {habit.name}
                    </h4>
                    <span className={`text-[10px] font-bold ${STATS[habit.stat].text}`}>
                      +{STATS[habit.stat].label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => completeHabit(habit.id)}
                  disabled={habit.completedToday}
                  className={`h-10 w-10 flex items-center justify-center rounded border transition-all ${
                    habit.completedToday 
                      ? 'bg-gray-800 border-gray-700 text-gray-600' 
                      : 'bg-gray-900 border-gray-600 text-gray-400 hover:bg-green-600 hover:text-white hover:border-green-400'
                  }`}
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
              
              {habit.streak > 0 && (
                 <div className="absolute -top-2 -right-2 text-[10px] bg-red-600 border border-red-400 px-2 py-0.5 rounded-full text-white font-bold shadow-sm">
                   {habit.streak} DAY STREAK
                 </div>
              )}
            </div>
          ))}
        </div>

        {/* End Day Button */}
        <div className="pt-4 border-t border-gray-800">
           <button 
             onClick={endDay}
             className="w-full py-4 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 hover:border-red-500 text-red-500 rounded-lg text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
           >
             <Skull size={16} className="group-hover:animate-pulse"/> End Day (Calculate Damage)
           </button>
           <p className="text-center text-[10px] text-gray-600 mt-2">
             WARNING: Unfinished quests deal {DAMAGE_PER_MISSED_HABIT} damage.
           </p>
        </div>

        {/* Charts */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
             <TrendingUp size={14}/> XP History
           </h3>
           <div className="h-40 w-full text-[10px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={history.length ? history : [{day: 'Start', xp: 0}]}>
                 <XAxis dataKey="day" stroke="#525252" tick={{fill: '#525252'}} />
                 <YAxis stroke="#525252" tick={{fill: '#525252'}} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} 
                    itemStyle={{ color: '#fbbf24' }}
                 />
                 <Line type="monotone" dataKey="xp" stroke="#fbbf24" strokeWidth={3} dot={{r: 4, fill: '#fbbf24', strokeWidth: 0}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* --- MODAL --- */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-b border-gray-700 pb-2">New Quest</h2>
        <input 
          autoFocus
          type="text" 
          placeholder="Quest Name..." 
          className="w-full bg-black border-2 border-gray-800 text-white p-3 rounded-lg mb-4 focus:border-blue-500 outline-none font-bold placeholder-gray-700"
          value={newHabit.name}
          onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-2 mb-6">
          {Object.entries(STATS).map(([key, stat]) => (
            <button
              key={key}
              onClick={() => setNewHabit({...newHabit, stat: key})}
              className={`p-3 rounded-lg border-2 text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${
                newHabit.stat === key 
                  ? 'bg-gray-800 border-white text-white' 
                  : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'
              }`}
            >
              {stat.icon} {stat.label}
            </button>
          ))}
        </div>
        <button 
          onClick={addHabit}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg uppercase tracking-widest shadow-lg"
        >
          Initialize
        </button>
      </Modal>

    </div>
  );
}