import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Zap, BookOpen, Smile, Plus, Check, Trash2, LogOut, Heart, Settings, RotateCcw, X } from 'lucide-react';

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

// --- DEFAULT STATE ---
const DEFAULT_GAME_DATA = {
  name: 'Player', // Character Display Name
  level: 1, 
  xp: 0, 
  hp: 100, 
  maxHp: 100,
  stats: { STR: 5, INT: 5, DEX: 5, CHA: 5 },
  habits: []
};

// --- SETTINGS MODAL COMPONENT ---
const SettingsModal = ({ isOpen, onClose, gameData, updateGame }) => {
  if (!isOpen) return null;

  const handleNameChange = (e) => {
    updateGame({ ...gameData, name: e.target.value });
  };

  const resetStats = () => {
    if (!confirm("Reset all stats to 5? This cannot be undone.")) return;
    updateGame({
      ...gameData,
      stats: { STR: 5, INT: 5, DEX: 5, CHA: 5 }
    });
  };

  const resetProgress = () => {
    if (!confirm("Reset Level and XP? You will be Level 1 again.")) return;
    updateGame({
      ...gameData,
      level: 1,
      xp: 0,
      maxHp: 100,
      hp: 100
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-sm rounded-xl border border-gray-700 p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings size={20} /> Settings
        </h2>

        {/* 1. Profile Name */}
        <div className="mb-6">
          <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Character Name</label>
          <input 
            type="text" 
            value={gameData.name || ''}
            onChange={handleNameChange}
            className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none font-bold"
            placeholder="Enter Name..."
          />
        </div>

        <hr className="border-gray-800 mb-6"/>

        {/* 2. Danger Zone Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
            <div>
              <p className="font-bold text-red-400 text-sm">Reset Stats</p>
              <p className="text-[10px] text-gray-500">Sets STR, INT, DEX, CHA to 5.</p>
            </div>
            <button onClick={resetStats} className="p-2 bg-red-900/20 hover:bg-red-500 hover:text-white text-red-500 rounded transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
            <div>
              <p className="font-bold text-yellow-400 text-sm">Reset Progress</p>
              <p className="text-[10px] text-gray-500">Resets Level to 1 and XP to 0.</p>
            </div>
            <button onClick={resetProgress} className="p-2 bg-yellow-900/20 hover:bg-yellow-500 hover:text-black text-yellow-500 rounded transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-gray-600">
          Your Save ID: <span className="font-mono text-gray-400">Connected</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [profileName, setProfileName] = useState(''); // This is the SAVE SLOT ID
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState(DEFAULT_GAME_DATA);
  const [inputHabit, setInputHabit] = useState('');
  const [selectedStat, setSelectedStat] = useState('STR');
  
  // New State for Modal
  const [showSettings, setShowSettings] = useState(false);

  // --- DATABASE FUNCTIONS ---
  const loadProfile = async (saveSlotId) => {
    if (!saveSlotId) return;
    setIsLoading(true);
    
    // Normalize save slot ID (lowercase, no spaces) to avoid duplicate issues
    const safeId = saveSlotId.trim().toLowerCase();

    const { data, error } = await supabase
      .from('saves')
      .select('game_data')
      .eq('username', safeId)
      .single();

    if (data) {
      setGameData({ ...DEFAULT_GAME_DATA, ...data.game_data }); // Merge to ensure new fields exist
      setProfileName(safeId);
      setIsLoggedIn(true);
    } else {
      // Create new profile
      const newGameData = { ...DEFAULT_GAME_DATA, name: saveSlotId }; // Default char name = save slot
      const { error: createError } = await supabase
        .from('saves')
        .insert([{ username: safeId, game_data: newGameData }]);
        
      if (!createError) {
        setGameData(newGameData);
        setProfileName(safeId);
        setIsLoggedIn(true);
      } else {
        alert("Error creating profile: " + createError.message);
      }
    }
    setIsLoading(false);
  };

  const updateGame = async (newData) => {
    setGameData(newData); // Immediate UI update
    if (profileName) {
      await supabase
        .from('saves')
        .update({ game_data: newData })
        .eq('username', profileName);
    }
  };

  // --- GAME ACTIONS ---
  const addHabit = () => {
    if (!inputHabit) return;
    const newHabit = {
      id: Date.now(),
      text: inputHabit,
      stat: selectedStat,
      completed: false
    };
    const newData = { ...gameData, habits: [...gameData.habits, newHabit] };
    updateGame(newData);
    setInputHabit('');
  };

  const deleteHabit = (id) => {
    if (!confirm("Delete this quest?")) return;
    const newData = { ...gameData, habits: gameData.habits.filter(h => h.id !== id) };
    updateGame(newData);
  };

  const completeHabit = (id) => {
    const habit = gameData.habits.find(h => h.id === id);
    if (habit.completed) return;

    playSound(SOUNDS.coin);

    let newXp = gameData.xp + 20;
    let newLevel = gameData.level;
    const xpNeeded = gameData.level * 100;

    if (newXp >= xpNeeded) {
      newXp = newXp - xpNeeded;
      newLevel++;
      alert("LEVEL UP!");
    }

    const newData = {
      ...gameData,
      xp: newXp,
      level: newLevel,
      hp: Math.min(gameData.hp + 5, gameData.maxHp),
      stats: {
        ...gameData.stats,
        [habit.stat]: gameData.stats[habit.stat] + 1
      },
      habits: gameData.habits.map(h => h.id === id ? { ...h, completed: true } : h)
    };
    updateGame(newData);
  };

  const endDay = () => {
    const missed = gameData.habits.filter(h => !h.completed).length;
    const damage = missed * 10;
    
    if (damage > 0) playSound(SOUNDS.hit);

    let newHp = gameData.hp - damage;
    let newLevel = gameData.level;
    let newXp = gameData.xp;

    if (newHp <= 0) {
      alert("YOU DIED. Level lost.");
      newHp = 100;
      newLevel = Math.max(1, newLevel - 1);
      newXp = 0;
    } else if (damage > 0) {
      alert(`Took ${damage} damage!`);
    } else {
      alert("Perfect day! Fully healed.");
      newHp = 100;
    }

    const newData = {
      ...gameData,
      hp: newHp,
      level: newLevel,
      xp: newXp,
      habits: gameData.habits.map(h => ({ ...h, completed: false }))
    };
    updateGame(newData);
  };

  // --- RENDER ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-gray-900 border-2 border-green-500 p-8 rounded-xl text-center shadow-[0_0_30px_rgba(0,255,0,0.1)]">
          <h1 className="text-2xl font-bold text-green-500 mb-6 font-mono tracking-tighter">RESPAWN</h1>
          <p className="text-gray-400 mb-4 text-xs uppercase tracking-widest">Enter Save Slot ID</p>
          <input 
            className="w-full bg-black border border-gray-700 text-white p-3 rounded mb-4 text-center uppercase tracking-widest focus:border-green-500 outline-none"
            placeholder="SLOT_1"
            onKeyDown={(e) => e.key === 'Enter' && loadProfile(e.target.value)}
          />
          <button 
             className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded disabled:opacity-50 uppercase tracking-widest text-sm"
             onClick={(e) => loadProfile(e.target.previousSibling.value)}
             disabled={isLoading}
          >
            {isLoading ? "SYNCING..." : "LOAD GAME"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 selection:bg-green-500 selection:text-black">
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        gameData={gameData} 
        updateGame={updateGame}
      />

      {/* HEADER */}
      <div className="bg-gray-900 p-6 border-b border-gray-800">
        <div className="flex justify-between items-start mb-6">
          <div>
             <h2 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Character Profile</h2>
             <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
               {gameData.name || profileName}
             </h1>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="text-red-500 hover:text-red-400 transition-colors">
              <LogOut size={20}/> 
            </button>
          </div>
        </div>

        {/* BARS */}
        <div className="space-y-3">
           {/* HP */}
           <div>
             <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
               <span className="flex items-center gap-1"><Heart size={10} fill="currentColor"/> HP</span>
               <span>{gameData.hp}/{gameData.maxHp}</span>
             </div>
             <div className="h-3 bg-gray-950 border border-gray-800 rounded-sm overflow-hidden">
               <div className="h-full bg-red-600 transition-all duration-300" style={{width: `${(gameData.hp/gameData.maxHp)*100}%`}}></div>
             </div>
           </div>
           
           {/* XP */}
           <div>
             <div className="flex justify-between text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">
               <span>Level {gameData.level}</span>
               <span>{gameData.xp} / {gameData.level * 100} XP</span>
             </div>
             <div className="h-2 bg-gray-950 border border-gray-800 rounded-sm overflow-hidden">
               <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${(gameData.xp/(gameData.level*100))*100}%`}}></div>
             </div>
           </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {Object.entries(gameData.stats).map(([key, val]) => (
            <div key={key} className={`text-center p-2 rounded bg-gray-950 border ${STATS[key].border}`}>
              <div className={`flex justify-center mb-1 ${STATS[key].color}`}>{STATS[key].icon}</div>
              <div className="text-lg font-black">{val}</div>
              <div className="text-[10px] text-gray-500 font-bold">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUEST INPUT */}
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6 shadow-lg">
          <input 
            className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white mb-3 focus:border-green-500 outline-none font-bold placeholder-gray-600"
            placeholder="New Quest Name..."
            value={inputHabit}
            onChange={(e) => setInputHabit(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Object.keys(STATS).map(stat => (
               <button 
                 key={stat}
                 onClick={() => setSelectedStat(stat)}
                 className={`px-3 py-1 rounded text-[10px] uppercase font-bold border transition-colors ${selectedStat === stat ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-700'}`}
               >
                 {stat}
               </button>
            ))}
          </div>
          <button onClick={addHabit} className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20">
            <Plus size={14} className="inline mr-2"/> Initialize Quest
          </button>
        </div>

        {/* HABIT LIST */}
        <div className="space-y-3">
          {gameData.habits.map(habit => (
            <div key={habit.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${habit.completed ? 'bg-gray-900/40 border-gray-800 opacity-50' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded bg-black ${STATS[habit.stat].color}`}>
                  {STATS[habit.stat].icon}
                </div>
                <div>
                  <p className={`font-bold text-sm ${habit.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{habit.text}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">+{STATS[habit.stat].label}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => deleteHabit(habit.id)}
                   className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                 >
                   <Trash2 size={16} />
                 </button>
                 <button 
                   onClick={() => completeHabit(habit.id)}
                   disabled={habit.completed}
                   className={`h-10 w-10 flex items-center justify-center rounded border transition-all ${habit.completed ? 'bg-green-900/20 border-green-900 text-green-700' : 'bg-black border-gray-600 text-gray-400 hover:bg-green-500 hover:text-black hover:border-green-400'}`}
                 >
                   <Check size={18} strokeWidth={3} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        {/* END DAY */}
        <button 
          onClick={endDay}
          className="w-full mt-12 py-5 border border-red-900/50 text-red-500 hover:bg-red-900/10 rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all"
        >
          Sleep
        </button>
        <p className="text-center mt-4 text-[10px] text-gray-600 font-mono">RESPAWN v1.2 // CONNECTED</p>
      </div>
    </div>
  );
}