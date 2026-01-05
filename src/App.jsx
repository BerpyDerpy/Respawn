import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Zap, BookOpen, Smile, Plus, Check, Trash2, LogOut, Heart, Settings, RotateCcw, X, User } from 'lucide-react';

// --- 1. SUPABASE CONFIG ---
const SUPABASE_URL = 'https://qfnlgqgxrznvjpghqgvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmxncWd4cnpudmpwZ2hxZ3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTQ2NzQsImV4cCI6MjA4MzE5MDY3NH0.l1-5XzPJmR9oMDMiey7Ig30tg4DiEGsPZrL-RfPF3qo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFIGURATION ---
const STATS = {
  STR: { label: 'Strength', icon: <Shield size={16} />, color: 'text-red-400', border: 'border-red-500' },
  INT: { label: 'Intellect', icon: <BookOpen size={16} />, color: 'text-blue-400', border: 'border-blue-500' },
  DEX: { label: 'Dexterity', icon: <Zap size={16} />, color: 'text-yellow-400', border: 'border-yellow-500' },
  CHA: { label: 'Charisma', icon: <Smile size={16} />, color: 'text-purple-400', border: 'border-purple-500' },
};

const playSound = (url) => {
  const audio = new Audio(url);
  audio.volume = 0.5;
  audio.play().catch(e => console.log("Audio ignored"));
};

const SOUNDS = {
  coin: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  hit: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
};

const DEFAULT_GAME_DATA = {
  name: 'Player',
  level: 1, 
  xp: 0, 
  hp: 100, 
  maxHp: 100,
  stats: { STR: 5, INT: 5, DEX: 5, CHA: 5 },
  habits: []
};

// --- SETTINGS MODAL ---
const SettingsModal = ({ isOpen, onClose, gameData, updateGame }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-sm rounded-xl border border-gray-700 p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings size={20} /> Settings
        </h2>

        {/* Name Edit */}
        <div className="mb-6">
          <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Character Name</label>
          <input 
            type="text" 
            value={gameData.name || ''}
            onChange={(e) => updateGame({ ...gameData, name: e.target.value })}
            className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none font-bold"
          />
        </div>

        <hr className="border-gray-800 mb-6"/>

        {/* Resets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
            <div>
              <p className="font-bold text-red-400 text-sm">Reset Stats</p>
              <p className="text-[10px] text-gray-500">Sets all stats to 5</p>
            </div>
            <button 
              onClick={() => confirm("Reset stats?") && updateGame({...gameData, stats: {STR:5, INT:5, DEX:5, CHA:5}})} 
              className="p-2 bg-red-900/20 text-red-500 rounded hover:bg-red-500 hover:text-white"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
            <div>
              <p className="font-bold text-yellow-400 text-sm">Reset Progress</p>
              <p className="text-[10px] text-gray-500">Back to Level 1</p>
            </div>
            <button 
              onClick={() => confirm("Reset Level?") && updateGame({...gameData, level: 1, xp: 0, hp: 100, maxHp: 100})} 
              className="p-2 bg-yellow-900/20 text-yellow-500 rounded hover:bg-yellow-500 hover:text-black"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [profileId, setProfileId] = useState(''); // The database ID (lowercase)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState(DEFAULT_GAME_DATA);
  const [inputHabit, setInputHabit] = useState('');
  const [selectedStat, setSelectedStat] = useState('STR');
  const [showSettings, setShowSettings] = useState(false);

  // --- DATABASE LOGIC ---
  const loadProfile = async (inputName) => {
    if (!inputName) return;
    setIsLoading(true);
    
    // Human Friendly Logic: 
    // ID = "mahit hazaris" (lowercase, unique key)
    // Name = "Mahit Hazaris" (display name)
    const dbId = inputName.trim().toLowerCase(); 

    const { data } = await supabase
      .from('saves')
      .select('game_data')
      .eq('username', dbId)
      .single();

    if (data) {
      // Existing User
      setGameData({ ...DEFAULT_GAME_DATA, ...data.game_data });
    } else {
      // New User - Use their input as the character name
      const newGameData = { ...DEFAULT_GAME_DATA, name: inputName }; 
      await supabase
        .from('saves')
        .insert([{ username: dbId, game_data: newGameData }]);
      setGameData(newGameData);
    }
    
    setProfileId(dbId);
    setIsLoggedIn(true);
    setIsLoading(false);
  };

  const updateGame = async (newData) => {
    setGameData(newData);
    if (profileId) {
      await supabase.from('saves').update({ game_data: newData }).eq('username', profileId);
    }
  };

  // --- ACTIONS ---
  const addHabit = () => {
    if (!inputHabit) return;
    updateGame({ 
      ...gameData, 
      habits: [...gameData.habits, { id: Date.now(), text: inputHabit, stat: selectedStat, completed: false }] 
    });
    setInputHabit('');
  };

  const deleteHabit = (id) => {
    if (confirm("Delete this quest?")) {
      updateGame({ ...gameData, habits: gameData.habits.filter(h => h.id !== id) });
    }
  };

  const completeHabit = (id) => {
    const habit = gameData.habits.find(h => h.id === id);
    if (habit.completed) return;

    playSound(SOUNDS.coin);
    
    let nextData = { ...gameData };
    nextData.habits = nextData.habits.map(h => h.id === id ? { ...h, completed: true } : h);
    
    // Stats & XP
    nextData.xp += 20;
    nextData.hp = Math.min(nextData.hp + 5, nextData.maxHp);
    nextData.stats[habit.stat] += 1;

    // Level Up Check
    const xpNeeded = nextData.level * 100;
    if (nextData.xp >= xpNeeded) {
      nextData.xp -= xpNeeded;
      nextData.level += 1;
      alert(`LEVEL UP! Welcome to level ${nextData.level}`);
    }
    
    updateGame(nextData);
  };

  const endDay = () => {
    const damage = gameData.habits.filter(h => !h.completed).length * 10;
    
    if (damage > 0) {
      playSound(SOUNDS.hit);
      alert(`You took ${damage} damage from missed quests!`);
    } else {
      alert("Perfect day! Full heal.");
    }

    let nextData = { ...gameData };
    nextData.hp -= damage;

    // Death Logic
    if (nextData.hp <= 0) {
      alert("YOU DIED. Respawning at previous level...");
      nextData.hp = 100;
      nextData.level = Math.max(1, nextData.level - 1);
      nextData.xp = 0;
    } else if (damage === 0) {
      nextData.hp = 100;
    }

    // Reset Habits
    nextData.habits = nextData.habits.map(h => ({ ...h, completed: false }));
    updateGame(nextData);
  };

  // --- RENDER ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-gray-900 border-2 border-green-600 p-8 rounded-xl shadow-[0_0_40px_rgba(34,197,94,0.2)]">
          <div className="flex justify-center mb-6">
             <div className="p-4 bg-green-900/20 rounded-full border border-green-500/50">
               <User size={32} className="text-green-500" />
             </div>
          </div>
          <h1 className="text-3xl font-black text-center text-white mb-2 font-mono tracking-tighter">RESPAWN</h1>

          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Who are you?</label>
              <input 
                autoFocus
                className="w-full bg-black border-2 border-gray-800 text-white p-4 rounded-lg text-lg font-bold placeholder-gray-700 focus:border-green-500 outline-none transition-colors"
                placeholder="e.g. McPoopyPants"
                onKeyDown={(e) => e.key === 'Enter' && loadProfile(e.target.value)}
              />
            </div>
            <button 
               className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-4 rounded-lg uppercase tracking-widest text-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={(e) => loadProfile(e.target.previousSibling.firstChild.lastChild.value)}
               disabled={isLoading}
            >
              {isLoading ? "LOADING..." : "ENTER WORLD"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 selection:bg-green-500 selection:text-black">
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        gameData={gameData} 
        updateGame={updateGame} 
      />

      {/* HERO SECTION */}
      <div className="bg-gradient-to-b from-gray-900 to-black border-b border-gray-800 p-6 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
               <h1 className="text-2xl font-black text-white tracking-tighter">{gameData.name}</h1>
               <div className="flex items-center gap-2 text-xs font-bold text-green-500 mt-1">
                 <span className="bg-green-900/30 px-2 py-0.5 rounded border border-green-900/50">LVL {gameData.level}</span>
               </div>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-400">
              <Settings size={20} />
            </button>
          </div>

          {/* STATUS BARS */}
          <div className="space-y-4">
             {/* HP */}
             <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
               <div className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300" style={{width: `${(gameData.hp/gameData.maxHp)*100}%`}}></div>
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md tracking-wider">
                 HP {gameData.hp}/{gameData.maxHp}
               </div>
             </div>
             
             {/* XP */}
             <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
               <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500" style={{width: `${(gameData.xp/(gameData.level*100))*100}%`}}></div>
             </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {Object.entries(gameData.stats).map(([key, val]) => (
              <div key={key} className={`text-center p-2 rounded-lg bg-gray-900/50 border ${STATS[key].border}`}>
                <div className={`flex justify-center mb-1 ${STATS[key].color}`}>{STATS[key].icon}</div>
                <div className="text-lg font-black">{val}</div>
                <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{key}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUESTS */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl">
          <input 
            className="w-full bg-black border-2 border-gray-800 p-3 rounded-lg text-white mb-3 focus:border-green-500 outline-none font-bold placeholder-gray-600 transition-colors"
            placeholder="New Quest Name..."
            value={inputHabit}
            onChange={(e) => setInputHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          />
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {Object.keys(STATS).map(stat => (
               <button 
                 key={stat}
                 onClick={() => setSelectedStat(stat)}
                 className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold border transition-all ${selectedStat === stat ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-black text-gray-500 border-gray-700'}`}
               >
                 {stat}
               </button>
            ))}
          </div>
          <button onClick={addHabit} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 active:translate-y-0.5 transition-all">
            <Plus size={14} className="inline mr-2"/> Initialize Quest
          </button>
        </div>

        <div className="space-y-3">
          {gameData.habits.length === 0 && <div className="text-center text-gray-600 text-sm py-8">No active quests.</div>}
          
          {gameData.habits.map(habit => (
            <div key={habit.id} className={`flex items-center justify-between p-4 rounded-xl border-l-4 transition-all duration-200 ${habit.completed ? 'bg-gray-900/30 border-gray-800 border-l-gray-600 opacity-50' : 'bg-gray-900 border-gray-800 border-l-blue-500 hover:translate-x-1'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-black ${STATS[habit.stat].color}`}>
                  {STATS[habit.stat].icon}
                </div>
                <div>
                  <p className={`font-bold text-sm ${habit.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{habit.text}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">+{STATS[habit.stat].label}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <button onClick={() => deleteHabit(habit.id)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                 <button 
                   onClick={() => completeHabit(habit.id)}
                   disabled={habit.completed}
                   className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition-all ${habit.completed ? 'bg-green-900/20 border-green-900 text-green-700' : 'bg-black border-gray-700 text-gray-400 hover:bg-green-500 hover:text-black hover:border-green-400 hover:scale-110'}`}
                 >
                   <Check size={24} strokeWidth={3} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={endDay} className="w-full mt-8 py-5 border-2 border-red-900/30 text-red-500 hover:bg-red-900/10 hover:border-red-500 rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 group">
          <Heart size={16} className="group-hover:animate-pulse"/> End Day & Sleep
        </button>
      </div>
    </div>
  );
}