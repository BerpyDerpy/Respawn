import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Zap, BookOpen, Smile, Plus, Check, Trash2, LogOut, Heart, Save } from 'lucide-react';


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
  level: 1, xp: 0, hp: 100, maxHp: 100,
  stats: { STR: 5, INT: 5, DEX: 5, CHA: 5 },
  habits: []
};

export default function App() {
  const [profileName, setProfileName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState(DEFAULT_GAME_DATA);
  const [inputHabit, setInputHabit] = useState('');
  const [selectedStat, setSelectedStat] = useState('STR');

  // --- DATABASE FUNCTIONS ---

  const loadProfile = async (name) => {
    if (!name) return;
    setIsLoading(true);
    
    // 1. Try to fetch user
    const { data, error } = await supabase
      .from('saves')
      .select('game_data')
      .eq('username', name)
      .single();

    if (data) {
      // User found, load data
      setGameData(data.game_data);
      setProfileName(name);
      setIsLoggedIn(true);
    } else {
      // User not found, create new
      const { error: createError } = await supabase
        .from('saves')
        .insert([{ username: name, game_data: DEFAULT_GAME_DATA }]);
        
      if (!createError) {
        setGameData(DEFAULT_GAME_DATA);
        setProfileName(name);
        setIsLoggedIn(true);
      } else {
        alert("Error creating profile: " + createError.message);
      }
    }
    setIsLoading(false);
  };

  const saveGame = async (currentData) => {
    // We pass data in rather than reading state to avoid stale closure issues
    if (!profileName) return;
    
    await supabase
      .from('saves')
      .update({ game_data: currentData })
      .eq('username', profileName);
  };

  // Helper to update state AND save to DB immediately
  const updateGame = (newData) => {
    setGameData(newData);
    saveGame(newData); 
  };

  // --- GAMEPLAY ACTIONS ---

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
        <div className="w-full max-w-sm bg-gray-900 border-2 border-green-500 p-8 rounded-xl text-center">
          <h1 className="text-2xl font-bold text-green-500 mb-6 font-mono">RESPAWN ONLINE</h1>
          <p className="text-gray-400 mb-4 text-sm">Enter Profile Name</p>
          <input 
            className="w-full bg-black border border-gray-700 text-white p-3 rounded mb-4 text-center uppercase tracking-widest focus:border-green-500 outline-none"
            placeholder="PLAYER 1"
            onKeyDown={(e) => e.key === 'Enter' && loadProfile(e.target.value)}
          />
          <button 
             className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded disabled:opacity-50"
             onClick={(e) => loadProfile(e.target.previousSibling.value)}
             disabled={isLoading}
          >
            {isLoading ? "LOADING..." : "START GAME"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-gray-900 p-6 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            {profileName}
          </h1>
          <button onClick={() => setIsLoggedIn(false)} className="text-xs text-red-500 flex items-center gap-1">
            <LogOut size={12}/> Logout
          </button>
        </div>

        {/* BARS */}
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-xs font-bold text-red-500">
             <Heart size={12} fill="currentColor"/> {gameData.hp}/{gameData.maxHp}
           </div>
           <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-red-600 transition-all" style={{width: `${(gameData.hp/gameData.maxHp)*100}%`}}></div>
           </div>
           
           <div className="flex justify-between text-xs font-bold text-green-500 mt-2">
             <span>Level {gameData.level}</span>
             <span>{gameData.xp} / {gameData.level * 100} XP</span>
           </div>
           <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 transition-all" style={{width: `${(gameData.xp/(gameData.level*100))*100}%`}}></div>
           </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {Object.entries(gameData.stats).map(([key, val]) => (
            <div key={key} className={`text-center p-2 rounded bg-gray-950 border ${STATS[key].border}`}>
              <div className={`flex justify-center mb-1 ${STATS[key].color}`}>{STATS[key].icon}</div>
              <div className="text-sm font-bold">{val}</div>
              <div className="text-[10px] text-gray-500">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUEST INPUT */}
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6">
          <input 
            className="w-full bg-black border border-gray-700 p-2 rounded text-white mb-2 focus:border-green-500 outline-none"
            placeholder="New Quest Name..."
            value={inputHabit}
            onChange={(e) => setInputHabit(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.keys(STATS).map(stat => (
               <button 
                 key={stat}
                 onClick={() => setSelectedStat(stat)}
                 className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${selectedStat === stat ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-700'}`}
               >
                 {stat}
               </button>
            ))}
          </div>
          <button onClick={addHabit} className="w-full mt-2 bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold text-sm">
            <Plus size={16} className="inline mr-1"/> ADD QUEST
          </button>
        </div>

        {/* HABIT LIST */}
        <div className="space-y-3">
          {gameData.habits.map(habit => (
            <div key={habit.id} className={`flex items-center justify-between p-4 rounded-lg border ${habit.completed ? 'bg-gray-900/50 border-gray-800 opacity-50' : 'bg-gray-800 border-gray-600'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-black ${STATS[habit.stat].color}`}>
                  {STATS[habit.stat].icon}
                </div>
                <div>
                  <p className={`font-bold text-sm ${habit.completed ? 'line-through text-gray-500' : 'text-white'}`}>{habit.text}</p>
                  <p className="text-[10px] text-gray-500">+{STATS[habit.stat].label}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => deleteHabit(habit.id)}
                   className="p-2 text-gray-600 hover:text-red-500"
                 >
                   <Trash2 size={16} />
                 </button>
                 <button 
                   onClick={() => completeHabit(habit.id)}
                   disabled={habit.completed}
                   className={`p-2 rounded border ${habit.completed ? 'bg-green-900 border-green-700 text-green-500' : 'bg-black border-gray-500 text-gray-400 hover:bg-green-600 hover:text-white'}`}
                 >
                   <Check size={18} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        {/* END DAY */}
        <button 
          onClick={endDay}
          className="w-full mt-8 py-4 border border-red-900 text-red-500 hover:bg-red-900/20 rounded-lg text-sm font-bold tracking-widest uppercase"
        >
          Sleep (End Day)
        </button>
      </div>
    </div>
  );
}