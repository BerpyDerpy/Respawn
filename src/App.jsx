import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import {
  Shield, Zap, BookOpen, Smile, Plus, Check, Trash2,
  LogOut, Heart, Settings, RotateCcw, X, User, Crown,
  Sparkles, Flame
} from 'lucide-react';

// --- 1. SUPABASE CONFIG ---
const SUPABASE_URL = 'https://qfnlgqgxrznvjpghqgvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmxncWd4cnpudmpwZ2hxZ3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTQ2NzQsImV4cCI6MjA4MzE5MDY3NH0.l1-5XzPJmR9oMDMiey7Ig30tg4DiEGsPZrL-RfPF3qo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFIGURATION ---
const STATS = {
  STR: {
    label: 'Strength',
    icon: <Shield size={18} />,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20'
  },
  INT: {
    label: 'Intellect',
    icon: <BookOpen size={18} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  VIT: {
    label: 'Vitality',
    icon: <Heart size={18} />,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  CRE: {
    label: 'Creativity',
    icon: <Zap size={18} />,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  },
};

const SOUNDS = {
  coin: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  hit: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  levelup: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  delete: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'
};

const DEFAULT_GAME_DATA = {
  name: 'Player',
  level: 1,
  xp: 0,
  hp: 100,
  maxHp: 100,
  stats: { STR: 5, INT: 5, VIT: 5, CRE: 5 },
  habits: []
};

// --- COMPONENTS ---

const StatCard = ({ statKey, value }) => {
  const stat = STATS[statKey];
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={`relative overflow-hidden p-3 rounded-xl border border-white/5 bg-stone-900/40 flex flex-col items-center justify-center gap-1 group`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/5 to-transparent`} />
      <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} mb-1 shadow-lg shadow-black/20`}>
        {stat.icon}
      </div>
      <span className="text-xl font-black tracking-tight text-stone-200">{value}</span>
      <span className="text-[9px] uppercase font-bold text-stone-500 tracking-widest">{stat.label}</span>
    </motion.div>
  );
};

const SettingsModal = ({ isOpen, onClose, gameData, updateGame }) => {
  const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 w-full max-w-sm rounded-3xl border border-white/10 p-6 relative shadow-2xl overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-10 -mt-10" />

          <button
            onClick={() => { playClick(); onClose(); }}
            className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Settings size={20} className="text-indigo-400" /> Settings
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase text-gray-500 font-bold mb-2 ml-1">Hero Name</label>
              <input
                type="text"
                value={gameData.name || ''}
                onChange={(e) => updateGame({ ...gameData, name: e.target.value })}
                className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500 outline-none font-bold transition-all"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
                <div>
                  <p className="font-bold text-rose-400 text-sm">Reset Attributes</p>
                  <p className="text-[10px] text-gray-500">Reborn with base stats</p>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    if (confirm("Reset stats?")) updateGame({ ...gameData, stats: { STR: 5, INT: 5, VIT: 5, CRE: 5 } });
                  }}
                  className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/10 bg-amber-500/5">
                <div>
                  <p className="font-bold text-amber-400 text-sm">New Game</p>
                  <p className="text-[10px] text-gray-500">Level 1 Fresh Start</p>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    if (confirm("Reset Level?")) updateGame({ ...gameData, level: 1, xp: 0, hp: 100, maxHp: 100 });
                  }}
                  className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- MAIN APP ---
export default function App() {
  const [profileId, setProfileId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState(DEFAULT_GAME_DATA);
  const [inputHabit, setInputHabit] = useState('');
  const [selectedStat, setSelectedStat] = useState('STR');
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [showSettings, setShowSettings] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  // Sounds
  const [playCoin] = useSound(SOUNDS.coin, { volume: 0.5 });
  const [playHit] = useSound(SOUNDS.hit, { volume: 0.4 });
  const [playLevelUp] = useSound(SOUNDS.levelup, { volume: 0.6 });
  const [playClick] = useSound(SOUNDS.click, { volume: 0.3 });
  const [playDelete] = useSound(SOUNDS.delete, { volume: 0.4 });

  // --- DATABASE LOGIC ---
  const loadProfile = async (inputName) => {
    if (!inputName) return;
    playClick();
    setIsLoading(true);

    const dbId = inputName.trim().toLowerCase();
    const { data } = await supabase
      .from('saves')
      .select('game_data')
      .eq('username', dbId)
      .single();

    if (data) {
      // Sanitize stats: only keep keys that exist in our current STATS config
      const dbStats = data.game_data.stats || {};
      const sanitizedStats = {};
      Object.keys(STATS).forEach(key => {
        sanitizedStats[key] = dbStats[key] || DEFAULT_GAME_DATA.stats[key];
      });

      const safeData = {
        ...DEFAULT_GAME_DATA,
        ...data.game_data,
        stats: sanitizedStats,
        habits: Array.isArray(data.game_data.habits) ? data.game_data.habits : []
      };
      setGameData(safeData);
    } else {
      const newGameData = { ...DEFAULT_GAME_DATA, name: inputName };
      await supabase
        .from('saves')
        .insert([{ username: dbId, game_data: newGameData }]);
      setGameData(newGameData);
    }

    setProfileId(dbId);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 800); // Artificial delay for smooth animation
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
    playClick();
    updateGame({
      ...gameData,
      habits: [...gameData.habits, {
        id: Date.now(),
        text: inputHabit,
        stat: selectedStat,
        difficulty,
        completed: false
      }]
    });
    setInputHabit('');
  };

  const deleteHabit = (id) => {
    // No confirm, just action for smoother feel, maybe add undo later
    playDelete();
    updateGame({ ...gameData, habits: gameData.habits.filter(h => h.id !== id) });
  };

  const completeHabit = (id) => {
    const habit = gameData.habits.find(h => h.id === id);
    if (habit.completed) return;

    playCoin();

    let nextData = { ...gameData };
    nextData.habits = nextData.habits.map(h => h.id === id ? { ...h, completed: true } : h);

    // Stats & XP
    const xpBase = { easy: 10, medium: 20, hard: 35 };
    const xpGain = xpBase[habit.difficulty] || 20;

    nextData.xp += xpGain;
    nextData.hp = Math.min(nextData.hp + 5, nextData.maxHp);

    // Chance for extra stat point on Hard difficulty? keeping simple for now
    nextData.stats[habit.stat] += 1;

    // Level Up Check
    const xpNeeded = nextData.level * 100;
    if (nextData.xp >= xpNeeded) {
      nextData.xp -= xpNeeded;
      nextData.level += 1;
      setTimeout(() => playLevelUp(), 500);
      // Could show a modal here instead of alert
    }

    updateGame(nextData);
  };

  const endDay = () => {
    const damage = gameData.habits.filter(h => !h.completed).length * 10;

    if (damage > 0) {
      playHit();
    } else {
      playLevelUp(); // Victory sound for perfect day
    }

    let nextData = { ...gameData };
    nextData.hp -= damage;

    if (nextData.hp <= 0) {
      playHit();
      nextData.hp = 100;
      nextData.level = Math.max(1, nextData.level - 1);
      nextData.xp = 0;
    } else if (damage === 0) {
      nextData.hp = 100;
    }

    nextData.habits = nextData.habits.map(h => ({ ...h, completed: false }));
    updateGame(nextData);
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-full max-w-sm glass-panel p-10 rounded-3xl relative z-10 border-orange-500/20 shadow-[0_0_60px_-15px_rgba(234,88,12,0.3)] bg-stone-900/80"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/20"
            >
              <Sparkles size={40} className="text-indigo-400" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-black text-center text-stone-200 mb-2 font-retro tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">RESPAWN</h1>
          <p className="text-center text-stone-500 text-sm mb-8 font-medium">Kindle the fire within.</p>

          <div className="space-y-4">
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                autoFocus
                className="w-full bg-stone-950/50 border border-stone-800 text-stone-200 pl-12 pr-4 py-4 rounded-xl text-lg font-bold placeholder-stone-700 focus:border-orange-500 focus:bg-stone-900 outline-none transition-all"
                placeholder="Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProfile(usernameInput)}
              />
            </div>
            <button
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed border border-orange-400/20"
              onClick={() => loadProfile(usernameInput)}
              disabled={isLoading}
            >
              {isLoading ? <span className="animate-pulse">Loading World...</span> : "Enter World"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- GAME UI ---
  return (
    <div className="min-h-screen text-stone-200 font-sans pb-32 bg-stone-950 selection:bg-orange-500/30">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        gameData={gameData}
        updateGame={updateGame}
      />

      {/* HEADER / HERO */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pt-8 pb-6 px-6 sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-lg rotate-3 flex items-center justify-center font-retro text-xs shadow-lg shadow-orange-500/20 text-white border border-orange-400/30">
                {gameData.level}
              </div>
              <div>
                <h1 className="text-xl font-black text-stone-100 leading-tight">{gameData.name}</h1>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Level {gameData.level} Ashen One</p>
              </div>
            </div>
            <button
              onClick={() => { playClick(); setShowSettings(true); }}
              className="glass-button p-2.5 rounded-xl text-stone-400 hover:text-white"
            >
              <Settings size={20} />
            </button>
          </div>

          <div className="flex gap-4 items-center">
            {/* HP BAR */}
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                <span>Health</span>
                <span>{gameData.hp}/{gameData.maxHp}</span>
              </div>
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(gameData.hp / gameData.maxHp) * 100}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
                />
              </div>
            </div>

            {/* XP CIRCLE/BAR COMPACT */}
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                <span>Experience</span>
                <span className="text-indigo-400">{(gameData.xp / (gameData.level * 100)) * 100}%</span>
              </div>
              <div className="h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800 relative">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(gameData.xp / (gameData.level * 100)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto p-6 space-y-8">

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(gameData.stats).map(([k, v]) => (
            <StatCard key={k} statKey={k} value={v} />
          ))}
        </div>

        {/* INPUT AREA */}
        <div className="glass-panel p-2 rounded-2xl relative bg-stone-900/30 border-stone-800">
          <input
            className="w-full bg-transparent p-4 text-stone-200 placeholder-stone-600 font-bold outline-none"
            placeholder="Kindle a new habit..."
            value={inputHabit}
            onChange={(e) => setInputHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          />
          <div className="space-y-3 px-3 pb-3">
            {/* Stats Selection */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {Object.keys(STATS).map(stat => (
                <button
                  key={stat}
                  onClick={() => { playClick(); setSelectedStat(stat); }}
                  className={`
                     px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold border transition-all whitespace-nowrap
                     ${selectedStat === stat
                      ? 'bg-stone-200 text-stone-950 border-stone-200 shadow-lg'
                      : 'bg-transparent text-stone-600 border-stone-800 hover:border-stone-600'}
                   `}
                >
                  {stat}
                </button>
              ))}
            </div>

            {/* Difficulty Selection & Add Button */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex bg-stone-950/50 rounded-lg p-1 border border-white/5">
                {['easy', 'medium', 'hard'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${difficulty === d ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-600 hover:text-stone-400'
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                onClick={addHabit}
                className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-orange-900/20"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* QUEST LIST */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-stone-600 uppercase tracking-widest pl-2 mb-4">Active Bonfires</h3>
          <AnimatePresence mode='popLayout'>
            {gameData.habits.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-10"
              >
                <div className="inline-block p-4 rounded-full bg-stone-900 text-stone-700 mb-3"><BookOpen size={24} /></div>
                <p className="text-stone-600 text-sm">No active flames.</p>
              </motion.div>
            )}

            {gameData.habits.map(habit => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all
                  ${habit.completed
                    ? 'bg-slate-900/30 border-slate-800 opacity-60 grayscale'
                    : 'glass-panel border-white/5 hover:border-white/10 hover:bg-white/[0.07]'}
                `}
              >
                <div className="flex items-center gap-4 z-10">
                  <div className={`p-2.5 rounded-xl ${STATS[habit.stat].bg} ${STATS[habit.stat].color}`}>
                    {STATS[habit.stat].icon}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${habit.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {habit.text}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STATS[habit.stat].bg} ${STATS[habit.stat].color} uppercase tracking-wider`}>
                        {STATS[habit.stat].label}
                      </span>
                      <span className="text-[9px] text-stone-500 font-bold border border-stone-800 rounded px-1.5 py-0.5 uppercase">
                        {habit.difficulty || 'medium'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 z-10">
                  {!habit.completed && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => completeHabit(habit.id)}
                    disabled={habit.completed}
                    className={`
                       h-10 w-10 flex items-center justify-center rounded-xl border transition-all
                       ${habit.completed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'}
                     `}
                  >
                    <Check size={18} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION */}
        <div className="pt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={endDay}
            className="w-full py-5 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-900/40 text-red-500 hover:text-red-400 hover:border-red-500/40 rounded-2xl text-xs font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3"
          >
            <Flame size={18} /> Complete Day
          </motion.button>
          <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest">
            Uncompleted quests deal 10 DMG
          </p>
        </div>

      </div>
    </div>
  );
}