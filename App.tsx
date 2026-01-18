
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, GameState, PinSlot, Operator } from './types';
import { generateRound, checkGuess } from './utils';
import PinInput from './components/PinInput';
import Terminal from './components/Terminal';
import { getHackerHint } from './services/geminiService';

const PLAYLIST = [
  {
    name: "The Shining Title Track",
    url: "https://res.cloudinary.com/dudwzh2xy/video/upload/v1768750861/Main_Title_The_Shining_lajpkr.mp3"
  },
  {
    name: "Anonymous Theme",
    url: "https://res.cloudinary.com/dudwzh2xy/video/upload/v1768750862/Anonymous_Theme_song_original_ryy9oe.mp3"
  },
  {
    name: "Where Is Your God Now",
    url: "https://res.cloudinary.com/dudwzh2xy/video/upload/v1768752623/Epic_Dark_Battle_Music_Where_Is_Your_God_Now_by_RokNardin_rutarw.mp3"
  }
];

const FAIL_VIDEOS = [
  "https://res.cloudinary.com/dudwzh2xy/video/upload/v1768750043/2cfc6311adb89e16b790ccd05ac97002_nyzfcm.mp4",
  "https://res.cloudinary.com/dudwzh2xy/video/upload/v1768754150/dbc021de4925db24849a2b01685835d0_wavf3l.mp4",
  "https://res.cloudinary.com/dudwzh2xy/video/upload/v1768754151/cbef78c59492250af1f02c24b582d9c7_esnq79.mp4"
];

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    difficulty: Difficulty.EASY,
    target: 0,
    pins: [],
    operators: [],
    isLocked: false,
    attempts: 0,
    logs: ["SYSTEM INITIALIZED...", "WAITING FOR USER SELECTION..."],
    victory: false,
    gameStarted: false,
  });

  const [hintLoading, setHintLoading] = useState(false);
  // Randomize initial track index
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Math.floor(Math.random() * PLAYLIST.length));
  const [trackNotification, setTrackNotification] = useState<string | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastComputedResult, setLastComputedResult] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showFailure, setShowFailure] = useState(false);
  const [failVideo, setFailVideo] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const addLog = (msg: string) => {
    setState(prev => ({ ...prev, logs: [...prev.logs, msg] }));
  };

  // Background Music Logic
  useEffect(() => {
    if (audioStarted && audioRef.current && !showFailure) {
      const playTrack = () => {
        const track = PLAYLIST[currentTrackIndex];
        audioRef.current!.src = track.url;
        audioRef.current!.muted = isMuted;
        audioRef.current!.play().catch(e => console.error("Audio playback error:", e));
        setTrackNotification(track.name);
        addLog(`AUDIO_STREAM_STARTED: ${track.name.toUpperCase()}`);
        setTimeout(() => setTrackNotification(null), 5000);
      };
      playTrack();
    } else if (showFailure && audioRef.current) {
        audioRef.current.pause();
    }
  }, [currentTrackIndex, audioStarted, showFailure]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Timer Logic
  useEffect(() => {
    if (state.gameStarted && !state.victory && !showFailure) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFailure("CRITICAL: TEMPORAL BREACH DETECTED. SESSION EXPIRED.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.gameStarted, state.victory, showFailure]);

  const handleAudioEnded = () => {
    // Pick a random next track that is different from the current one
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentTrackIndex && PLAYLIST.length > 1);
    setCurrentTrackIndex(nextIndex);
  };

  const handleFailure = (reason: string) => {
    addLog(reason);
    setFailVideo(FAIL_VIDEOS[Math.floor(Math.random() * FAIL_VIDEOS.length)]);
    setShowFailure(true);
    setTimeout(() => {
      setShowFailure(false);
      setState(s => ({ ...s, gameStarted: false }));
    }, 8000);
  };

  const startNewGame = (diff: Difficulty) => {
    const { target, pins, operators } = generateRound(diff);
    
    let initialTime = 180;
    if (diff === Difficulty.MEDIUM) initialTime = 360;
    if (diff === Difficulty.HARD) initialTime = 480;

    if (!audioStarted) {
      setAudioStarted(true);
    }

    setState({
      difficulty: diff,
      target,
      pins,
      operators,
      isLocked: false,
      attempts: 0,
      logs: [
        `PROTOCOL_START: MODE_${Difficulty[diff]}`,
        `TARGET_VALUE_ENCRYPTED: ${target}`,
        `OPERATORS_HUSHED: [DEDUCTION_REQUIRED]`,
        `TEMPORAL_LOCK_INIT: ${initialTime}s`
      ],
      victory: false,
      gameStarted: true
    });
    setTimeLeft(initialTime);
    setLastComputedResult(null);
    setShowFailure(false);
  };

  const handlePinSelect = (pinIdx: number, value: number) => {
    if (state.isLocked || showFailure) return;
    
    setState(prev => {
      const newPins = [...prev.pins];
      newPins[pinIdx] = { ...newPins[pinIdx], selectedValue: value };
      return { ...prev, pins: newPins };
    });
  };

  const handleBypass = async () => {
    if (state.pins.some(p => p.selectedValue === null)) {
      addLog("CRITICAL: ALL PINS MUST BE SET BEFORE BYPASS.");
      return;
    }

    const result = checkGuess(state.pins, state.operators);
    setLastComputedResult(result);

    const isSuccess = result === state.target;

    if (isSuccess) {
      addLog(`SUCCESS: SEQUENCE MATCHED. RESULT ${result} == TARGET ${state.target}`);
      addLog(`ACCESS GRANTED. DATA RECOVERED.`);
      setState(prev => ({ ...prev, victory: true, isLocked: true }));
    } else {
      const currentAttempts = state.attempts + 1;
      addLog(`ERROR: SEQUENCE MISMATCH. ATTEMPT ${currentAttempts}/5 | RESULT ${result}`);
      setState(prev => ({ ...prev, attempts: currentAttempts }));
      
      if (currentAttempts >= 5) {
        handleFailure("CRITICAL: SECURITY LOCKOUT. ENTROPY THRESHOLD REACHED.");
      }
    }
  };

  const fetchHint = async () => {
    if (hintLoading || showFailure) return;
    setHintLoading(true);
    addLog("REQUSTING EXTERNAL DECRYPTION ASSISTANCE...");
    
    const hint = await getHackerHint(
      state.target, 
      state.pins,
      state.operators,
      state.logs
    );
    
    addLog(`INTERCEPTED_SIGNAL: ${hint}`);
    setHintLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center relative z-20">
      
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        className="hidden"
      />

      {showFailure && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <video 
                autoPlay 
                className="w-full h-full object-contain"
                src={failVideo}
            />
            <div className="absolute inset-0 bg-red-900/20 pointer-events-none" />
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
                <h2 className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter italic animate-pulse opacity-0 animate-[fade-in_1s_ease-in_forwards_2s]">
                    BYPASS_FAILED
                </h2>
                <p className="text-red-500 font-mono mt-4 uppercase tracking-[0.5em] text-sm animate-[fade-in_1s_ease-in_forwards_3s] opacity-0">
                    Connection Severed / Data Purged
                </p>
            </div>
        </div>
      )}

      {trackNotification && !showFailure && (
        <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-right fade-in duration-500">
          <div className="glass-panel px-6 py-3 rounded-lg border-emerald-500/50 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-500/60 uppercase font-mono">Streaming_Audio</span>
              <span className="text-sm font-bold text-white font-mono tracking-tight">{trackNotification}</span>
            </div>
          </div>
        </div>
      )}

      {!state.gameStarted ? (
        <>
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-60 mix-blend-screen"
            >
              <source src="https://res.cloudinary.com/dudwzh2xy/video/upload/v1768750044/dd8a30abc0dd734fbfbfc802b4663ddf_inwjnh.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[#020617]/40"></div>
          </div>

          <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500 relative z-10 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            <h1 className="text-4xl md:text-6xl font-black text-emerald-500 neon-glow tracking-tighter italic">
              RECOVERY<span className="text-white">PINS</span>
            </h1>
            <p className="text-emerald-400/70 font-mono text-sm uppercase tracking-widest">
              Select Encryption Intensity
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => startNewGame(Difficulty.EASY)}
                className="p-4 glass-panel border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all text-emerald-300 font-bold uppercase tracking-widest group"
              >
                <span className="group-hover:neon-glow">Easy (3m)</span>
              </button>
              <button 
                onClick={() => startNewGame(Difficulty.MEDIUM)}
                className="p-4 glass-panel border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all text-emerald-300 font-bold uppercase tracking-widest group"
              >
                <span className="group-hover:neon-glow">Medium (6m)</span>
              </button>
              <button 
                onClick={() => startNewGame(Difficulty.HARD)}
                className="p-4 glass-panel border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all text-emerald-300 font-bold uppercase tracking-widest group"
              >
                <span className="group-hover:neon-glow">Hard (8m)</span>
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="mt-4 p-2 text-xs text-emerald-500/60 uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
                Settings
              </button>
            </div>
            <div className="pt-4 border-t border-emerald-500/10">
              <p className="text-[10px] text-emerald-500/40 uppercase font-mono">
                [V_1.1.0] SECURITY_SYSTEM_ACTIVE
              </p>
            </div>
          </div>

          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="glass-panel max-sm w-full p-8 rounded-2xl border-emerald-500/50 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest mb-6 border-b border-emerald-500/20 pb-2">Terminal Settings</h2>
                
                <div className="mb-8 space-y-4">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="text-lg">🎯</span> Rules
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-sm font-mono text-emerald-300/80">
                      <span className="text-cyan-500">▶</span>
                      <span>Target value range: <b className="text-white">24 – 100</b></span>
                    </li>
                    <li className="flex gap-3 text-sm font-mono text-emerald-300/80">
                      <span className="text-cyan-500">▶</span>
                      <span>Operators are hidden — <b className="text-white">only deduction works</b></span>
                    </li>
                    <li className="flex gap-3 text-sm font-mono text-emerald-300/80">
                      <span className="text-cyan-500">▶</span>
                      <span>Limited attempts before <b className="text-white">security lockout</b></span>
                    </li>
                    <li className="flex gap-3 text-sm font-mono text-emerald-300/80">
                      <span className="text-cyan-500">▶</span>
                      <span>Time pressure based on <b className="text-white">difficulty</b></span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between mb-8 border-t border-emerald-500/20 pt-6">
                  <span className="text-emerald-300 font-mono text-sm uppercase">Music Output</span>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`px-4 py-2 rounded border transition-all font-bold text-xs uppercase ${isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-emerald-500/20 border-emerald-500 text-emerald-500'}`}
                  >
                    {isMuted ? 'Muted' : 'Active'}
                  </button>
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-emerald-500 text-slate-900 font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  Save & Return
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-6">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-emerald-500 neon-glow">RECOVERY_PINS</h1>
                    <p className="text-xs text-emerald-500/50 uppercase">Session: active | Mode: {Difficulty[state.difficulty]}</p>
                </div>
                <div className={`glass-panel px-4 py-1 rounded border-2 font-mono text-xl ${timeLeft < 30 ? 'border-red-500 text-red-500 animate-pulse' : 'border-emerald-500/40 text-emerald-400'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            
            <div className="flex flex-col items-center w-full max-w-md">
              <div className="glass-panel px-6 py-2 rounded-full border-cyan-500/40 relative">
                <span className="text-cyan-500 text-sm font-mono mr-2">TARGET_CIPHER:</span>
                <span className="text-3xl font-bold text-white tracking-widest">{state.target}</span>
              </div>
              
              {lastComputedResult !== null && (
                <div className="mt-6 w-full px-4">
                  <div className="flex justify-between text-[10px] font-mono text-emerald-500/50 uppercase mb-1">
                    <span>Computed: {lastComputedResult}</span>
                    <span>Target: {state.target}</span>
                  </div>
                  <div className="relative h-2 bg-slate-900/80 rounded-full border border-emerald-500/20 overflow-visible">
                    <div className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-red-500 z-10 shadow-[0_0_8px_red]" style={{ left: '75%' }}>
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-red-400 font-bold">TARGET</span>
                    </div> 
                    <div 
                      className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] 
                        ${lastComputedResult === state.target ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                      style={{ 
                        width: `${Math.min((lastComputedResult / (state.target || 1)) * 75, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setState(s => ({ ...s, gameStarted: false }))}
              className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-widest underline decoration-dashed"
            >
              Terminate Session
            </button>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <section className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-xl flex flex-wrap justify-center items-start gap-4 md:gap-8 min-h-[400px]">
                {state.pins.map((pin, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-[10px] font-mono text-emerald-500/50 uppercase">Node_0{i+1}</div>
                      <PinInput 
                        options={pin.options}
                        selectedValue={pin.selectedValue}
                        disabled={state.victory}
                        onSelect={(val) => handlePinSelect(i, val)}
                      />
                    </div>
                    {i < state.operators.length && (
                      <div className="flex flex-col items-center justify-center pt-16">
                        <div className="w-8 h-8 md:w-10 md:h-10 glass-panel flex items-center justify-center rounded-full border-red-500/30 font-bold text-xl text-red-400/60 animate-pulse">
                          ?
                        </div>
                        <div className="text-[8px] mt-1 text-red-500/30 uppercase font-mono">OP_HIDDEN</div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleBypass}
                  disabled={state.victory || state.pins.some(p => p.selectedValue === null)}
                  className={`flex-1 py-4 font-bold text-xl tracking-widest uppercase rounded-lg border-2 transition-all shadow-lg
                    ${state.victory 
                      ? 'bg-emerald-500 text-slate-900 border-emerald-400' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500 hover:text-slate-900'}
                    ${state.pins.some(p => p.selectedValue === null) ? 'opacity-30 grayscale cursor-not-allowed' : 'active:scale-95'}
                  `}
                >
                  {state.victory ? 'ACCESS_GRANTED' : 'EXECUTE_BYPASS'}
                </button>
                <button 
                  onClick={fetchHint}
                  disabled={state.victory || hintLoading}
                  className="px-6 py-4 glass-panel border-cyan-500/50 text-cyan-400 font-bold hover:bg-cyan-500/10 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  {hintLoading ? 'DECRYPTING...' : 'DECRYPT_HINT'}
                </button>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="glass-panel rounded-xl p-6 text-center">
                <div className="text-xs font-mono text-emerald-500/50 uppercase mb-2">Entropy_Level</div>
                <div className="text-4xl font-bold text-emerald-500 neon-glow">
                  {state.attempts}/5
                </div>
                <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden border border-emerald-500/20">
                  <div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-500" 
                    style={{ width: `${(state.attempts / 5) * 100}%` }}
                  />
                </div>
              </div>

              <Terminal logs={state.logs} />

              {state.victory && (
                <div className="glass-panel rounded-xl p-6 bg-emerald-500/10 border-emerald-500 text-center animate-bounce">
                  <h3 className="text-2xl font-black text-emerald-400 neon-glow">SYSTEM_BYPASSED</h3>
                  <button 
                    onClick={() => startNewGame(state.difficulty)}
                    className="mt-4 px-8 py-2 bg-emerald-500 text-slate-900 rounded-full font-bold uppercase text-xs tracking-tighter"
                  >
                    Next Assignment
                  </button>
                </div>
              )}
            </aside>
          </main>
        </div>
      )}

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-[100px]" />
      </div>

    </div>
  );
};

export default App;
