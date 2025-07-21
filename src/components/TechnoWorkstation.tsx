// src/components/TechnoWorkstation.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ClaudeService } from '../services/claudeService';
import { AudioGenerationParams } from '../services/types';
import { audioEngine } from '../services/audioEngine';
import './TechnoWorkstation.css';

interface DrumPattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  openhat: boolean[];
}

interface Loop {
  id: string;
  name: string;
  pattern: DrumPattern;
  bpm: number;
  isRecording: boolean;
  isPlaying: boolean;
  isEmpty: boolean;
}

const TechnoWorkstation: React.FC = () => {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [selectedChord, setSelectedChord] = useState<string>('');
  const [bpm, setBpm] = useState(128);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const sequencerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Loop Station State
  const [loops, setLoops] = useState<Loop[]>([
    { id: '1', name: 'Loop 1', pattern: { kick: new Array(16).fill(false), snare: new Array(16).fill(false), hihat: new Array(16).fill(false), openhat: new Array(16).fill(false) }, bpm: 128, isRecording: false, isPlaying: false, isEmpty: true },
    { id: '2', name: 'Loop 2', pattern: { kick: new Array(16).fill(false), snare: new Array(16).fill(false), hihat: new Array(16).fill(false), openhat: new Array(16).fill(false) }, bpm: 128, isRecording: false, isPlaying: false, isEmpty: true },
    { id: '3', name: 'Loop 3', pattern: { kick: new Array(16).fill(false), snare: new Array(16).fill(false), hihat: new Array(16).fill(false), openhat: new Array(16).fill(false) }, bpm: 128, isRecording: false, isPlaying: false, isEmpty: true }
  ]);
  const [activeLoopId, setActiveLoopId] = useState<string | null>(null);
  
  // AI Prompt State
  const [promptText, setPromptText] = useState('');
  const [generationParams, setGenerationParams] = useState<AudioGenerationParams | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromptPanel, setShowPromptPanel] = useState(false);

  // Synthesizer State
  const [synthParams, setSynthParams] = useState({
    preset: 'Acid Bass',
    cutoff: 50,
    resonance: 30,
    distortion: 20,
    masterVol: 70
  });

  // Drum Machine State
  const [activeDrums, setActiveDrums] = useState<string[]>([]);

  // Drum Pattern State
  const [drumPattern, setDrumPattern] = useState<DrumPattern>({
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true]
  });

  // Keyboard State
  const [octave, setOctave] = useState(4);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  
  // Keyboard mapping
  const keyboardMap: { [key: string]: number } = {
    'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6,
    'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12
  };
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Calculate frequency for a note
  const getNoteFrequency = (noteIndex: number, octave: number) => {
    const a4 = 440;
    const noteNumber = (octave - 4) * 12 + noteIndex;
    return a4 * Math.pow(2, noteNumber / 12);
  };
  
  // Play piano note
  const playPianoNote = (noteIndex: number) => {
    if (!isAudioInitialized) return;
    const frequency = getNoteFrequency(noteIndex, octave);
    audioEngine.playNote(frequency, 0.5);
  };

  // Synthesizer Presets (Simple)
  const synthPresets = [
    { name: 'Acid Bass', category: 'Bass' },
    { name: 'Lead Pluck', category: 'Lead' },
    { name: 'Warm Pad', category: 'Pad' },
    { name: 'Analog Brass', category: 'Brass' },
    { name: 'Digital Bell', category: 'Bell' },
    { name: 'Sub Bass', category: 'Bass' }
  ];

  // Initialize Audio Context
  const initializeAudio = async () => {
    try {
      await audioEngine.initialize();
      setIsAudioInitialized(true);
      console.log('Audio system initialized!');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      alert('Failed to initialize audio. Please try again.');
    }
  };

  // Handle AI Prompt Processing
  const handlePromptSubmit = async () => {
    if (!promptText.trim()) return;
    
    setIsProcessing(true);
    try {
      const params = await ClaudeService.parsePrompt(promptText);
      setGenerationParams(params);
      
      // Apply parameters to the workstation
      if (params.bpm) {
        setBpm(params.bpm);
      }
      
      // Apply preset if genre matches
      if (params.genre?.includes('techno') || params.genre?.includes('acid')) {
        setSynthParams(prev => ({ ...prev, preset: 'Acid Bass' }));
      } else if (params.genre?.includes('ambient')) {
        setSynthParams(prev => ({ ...prev, preset: 'Warm Pad' }));
      }
      
      console.log('Generated params:', params);
      
    } catch (error) {
      console.error('Error processing prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick AI Prompts
  const quickPrompts = [
    "Dark techno bassline 128 BPM",
    "Chill ambient pad with reverb",
    "Aggressive acid bass pattern",
    "Dreamy lead melody",
    "Punchy drum loop for house"
  ];

  // Chord Bank
  const chords = [
    { name: 'C MIN', notes: ['C', 'Eb', 'G'] },
    { name: 'F MIN', notes: ['F', 'Ab', 'C'] },
    { name: 'G MIN', notes: ['G', 'Bb', 'D'] },
    { name: 'A MIN', notes: ['A', 'C', 'E'] },
    { name: 'D MIN', notes: ['D', 'F', 'A'] },
    { name: 'E MIN', notes: ['E', 'G', 'B'] },
    { name: 'C MIN7', notes: ['C', 'Eb', 'G', 'Bb'] },
    { name: 'F MIN7', notes: ['F', 'Ab', 'C', 'Eb'] },
    { name: 'B DIM', notes: ['B', 'D', 'F'] }
  ];

  const playChord = (chordName: string) => {
    if (!isAudioInitialized) {
      alert('Please initialize audio first!');
      return;
    }
    
    setSelectedChord(chordName);
    const chord = chords.find(c => c.name === chordName);
    if (chord) {
      audioEngine.playChord(chord.notes);
    }
  };

  // Loop Station Functions
  const recordLoop = (loopId: string) => {
    setLoops(prev => prev.map(loop => {
      if (loop.id === loopId) {
        if (loop.isRecording) {
          // Stop recording and save current pattern
          return { 
            ...loop, 
            isRecording: false, 
            pattern: { ...drumPattern },
            bpm: bpm,
            isEmpty: false 
          };
        } else {
          // Start recording
          setActiveLoopId(loopId);
          return { ...loop, isRecording: true };
        }
      }
      // Stop other recordings
      return { ...loop, isRecording: false };
    }));
  };

  const playLoop = (loopId: string) => {
    const loop = loops.find(l => l.id === loopId);
    if (!loop || loop.isEmpty) return;
    
    setLoops(prev => prev.map(l => ({
      ...l,
      isPlaying: l.id === loopId ? !l.isPlaying : false
    })));
    
    // If playing, load the loop pattern
    if (!loop.isPlaying) {
      setDrumPattern(loop.pattern);
      setBpm(loop.bpm);
      if (!isPlaying) {
        toggleSequencer();
      }
    } else {
      if (isPlaying) {
        toggleSequencer();
      }
    }
  };

  const clearLoop = (loopId: string) => {
    setLoops(prev => prev.map(loop => 
      loop.id === loopId 
        ? { 
            ...loop, 
            pattern: { 
              kick: new Array(16).fill(false), 
              snare: new Array(16).fill(false), 
              hihat: new Array(16).fill(false), 
              openhat: new Array(16).fill(false) 
            },
            isEmpty: true,
            isPlaying: false,
            isRecording: false
          }
        : loop
    ));
  };

  // Drum triggers
  const drumSounds = ['KICK', 'SNARE', 'HI-HAT', 'OPEN HAT', 'CRASH', 'CLAP', 'RIDE', 'PERC'];
  
  const triggerDrum = (drumName: string) => {
    if (!isAudioInitialized) {
      alert('Please initialize audio first!');
      return;
    }
    
    setActiveDrums(prev => [...prev, drumName]);
    audioEngine.playDrum(drumName);
    
    setTimeout(() => {
      setActiveDrums(prev => prev.filter(d => d !== drumName));
    }, 100);
  };

  // Toggle drum pattern step
  const toggleDrumStep = (drum: keyof DrumPattern, step: number) => {
    setDrumPattern(prev => ({
      ...prev,
      [drum]: prev[drum].map((active, i) => i === step ? !active : active)
    }));
  };

  // Play/Stop Sequencer
  const toggleSequencer = () => {
    if (!isAudioInitialized) {
      alert('Please initialize audio first!');
      return;
    }

    if (isPlaying) {
      if (sequencerRef.current) {
        clearInterval(sequencerRef.current);
      }
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      setIsPlaying(true);
      const stepTime = 60000 / (bpm * 4); // 16th notes

      sequencerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % 16;
          
          // Play drum sounds
          if (drumPattern.kick[nextStep]) audioEngine.playDrum('KICK');
          if (drumPattern.snare[nextStep]) audioEngine.playDrum('SNARE');
          if (drumPattern.hihat[nextStep]) audioEngine.playDrum('HI-HAT');
          if (drumPattern.openhat[nextStep]) audioEngine.playDrum('OPEN HAT');
          
          return nextStep;
        });
      }, stepTime);
    }
  };

  // Update master volume
  useEffect(() => {
    if (isAudioInitialized) {
      audioEngine.setMasterVolume(synthParams.masterVol / 100);
    }
  }, [synthParams.masterVol, isAudioInitialized]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sequencerRef.current) {
        clearInterval(sequencerRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAudioInitialized) return;
      
      // Spacebar - play/stop
      if (e.code === 'Space') {
        e.preventDefault();
        toggleSequencer();
      }
      
      // Number keys for drums
      const drumMap: { [key: string]: string } = {
        '1': 'KICK', '2': 'SNARE', '3': 'HI-HAT', '4': 'OPEN HAT',
        '5': 'CRASH', '6': 'CLAP', '7': 'RIDE', '8': 'PERC'
      };
      
      if (drumMap[e.key]) {
        triggerDrum(drumMap[e.key]);
      }
      
      // Piano keyboard
      if (keyboardMap[e.key.toLowerCase()] !== undefined) {
        const noteIndex = keyboardMap[e.key.toLowerCase()];
        playPianoNote(noteIndex);
        setActiveKeys(prev => [...prev, e.key.toLowerCase()]);
      }
      
      // Octave controls
      if (e.key === '-' || e.key === '_') {
        setOctave(prev => Math.max(1, prev - 1));
      }
      if (e.key === '=' || e.key === '+') {
        setOctave(prev => Math.min(7, prev + 1));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (keyboardMap[e.key.toLowerCase()] !== undefined) {
        setActiveKeys(prev => prev.filter(key => key !== e.key.toLowerCase()));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAudioInitialized, isPlaying]);

  return (
    <div className="techno-workstation">
      <div className="header">
        <button className="back-button" onClick={() => window.history.back()}>
          ← BACK TO INNOVERSE&LABS
        </button>
        <h1 className="title">⚡ TECHNO WORKSTATION ⚡</h1>
        <div className="transport">
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={toggleSequencer}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="bpm-display">
            <label>BPM</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
              min="60"
              max="200"
            />
          </div>
        </div>
      </div>

      {/* AI Prompt Panel - Simplified */}
      <div className="ai-section">
        <div className="ai-header" onClick={() => setShowPromptPanel(!showPromptPanel)}>
          <h3>🤖 AI Music Generator {showPromptPanel ? '▼' : '▶'}</h3>
          <span className="ai-status">{generationParams ? '✓ Ready' : 'Click to expand'}</span>
        </div>
        
        {showPromptPanel && (
          <div className="ai-content">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe your sound... e.g., 'Dark techno bassline 128 BPM with acid elements'"
              className="prompt-input"
            />
            <div className="prompt-actions">
              <button 
                onClick={handlePromptSubmit}
                disabled={isProcessing || !promptText.trim()}
                className="generate-btn"
              >
                {isProcessing ? 'Processing...' : '🎲 Generate'}
              </button>
              <div className="quick-prompts">
                {quickPrompts.map((prompt, i) => (
                  <button 
                    key={i}
                    className="quick-prompt"
                    onClick={() => setPromptText(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            {generationParams && (
              <div className="ai-result">
                <div className="result-tags">
                  {generationParams.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="result-info">
                  <span>BPM: {generationParams.bpm || 'Auto'}</span>
                  <span>Energy: {generationParams.energy}</span>
                  <span>Mood: {generationParams.mood}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="main-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Chord Bank */}
          <div className="panel chord-bank">
            <h3>CHORD BANK</h3>
            <div className="chord-grid">
              {chords.map((chord) => (
                <button
                  key={chord.name}
                  className={`chord-btn ${selectedChord === chord.name ? 'active' : ''}`}
                  onClick={() => playChord(chord.name)}
                >
                  {chord.name}
                </button>
              ))}
            </div>
            <div className="selected-display">
              {selectedChord || 'SELECT CHORD'}
            </div>
          </div>

          {/* Synthesizer Presets */}
          <div className="panel synth-presets">
            <h3>SYNTHESIZER PRESETS</h3>
            <div className="preset-grid">
              {synthPresets.map((preset) => (
                <button
                  key={preset.name}
                  className={`preset-btn ${synthParams.preset === preset.name ? 'active' : ''}`}
                  onClick={() => setSynthParams({ ...synthParams, preset: preset.name })}
                >
                  <span className="preset-name">{preset.name}</span>
                  <span className="preset-category">{preset.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="center-column">
          {/* Loop Station */}
          <div className="panel loop-station">
            <h3>LOOP STATION</h3>
            <div className="loops-container">
              {loops.map(loop => (
                <div key={loop.id} className="loop-control">
                  <span className="loop-name">{loop.name}</span>
                  <div className="loop-buttons">
                    <button 
                      className={`loop-btn record ${loop.isRecording ? 'active' : ''}`}
                      onClick={() => recordLoop(loop.id)}
                      title="Record"
                    >
                      ●
                    </button>
                    <button 
                      className={`loop-btn play ${loop.isPlaying ? 'active' : ''}`}
                      onClick={() => playLoop(loop.id)}
                      disabled={loop.isEmpty}
                      title="Play"
                    >
                      ▶
                    </button>
                    <button 
                      className="loop-btn stop"
                      onClick={() => clearLoop(loop.id)}
                      disabled={loop.isEmpty}
                      title="Clear"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={`loop-status ${loop.isEmpty ? 'empty' : 'filled'}`}>
                    {loop.isRecording ? 'REC' : loop.isPlaying ? 'PLAY' : loop.isEmpty ? 'EMPTY' : 'READY'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Synthesizer Controls */}
          <div className="panel synthesizer">
            <h3>SYNTHESIZER</h3>
            <div className="synth-controls">
              <div className="control">
                <label>Cutoff</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={synthParams.cutoff}
                  onChange={(e) => setSynthParams({...synthParams, cutoff: parseInt(e.target.value)})}
                />
                <span className="value">{synthParams.cutoff}%</span>
              </div>
              <div className="control">
                <label>Resonance</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={synthParams.resonance}
                  onChange={(e) => setSynthParams({...synthParams, resonance: parseInt(e.target.value)})}
                />
                <span className="value">{synthParams.resonance}%</span>
              </div>
              <div className="control">
                <label>Distortion</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={synthParams.distortion}
                  onChange={(e) => setSynthParams({...synthParams, distortion: parseInt(e.target.value)})}
                />
                <span className="value">{synthParams.distortion}%</span>
              </div>
              <div className="control">
                <label>Master Vol</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={synthParams.masterVol}
                  onChange={(e) => setSynthParams({...synthParams, masterVol: parseInt(e.target.value)})}
                />
                <span className="value">{synthParams.masterVol}%</span>
              </div>
            </div>
          </div>

          {/* Pattern Sequencer */}
          <div className="panel pattern-sequencer">
            <h3>PATTERN SEQUENCER</h3>
            <div className="sequencer-grid">
              {(['kick', 'snare', 'hihat', 'openhat'] as const).map(drum => (
                <div key={drum} className="sequencer-row">
                  <span className="drum-label">{drum.toUpperCase()}</span>
                  <div className="steps">
                    {drumPattern[drum].map((active, i) => (
                      <button
                        key={i}
                        className={`step ${active ? 'active' : ''} ${currentStep === i && isPlaying ? 'current' : ''}`}
                        onClick={() => toggleDrumStep(drum, i)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sequencer-controls">
              <button onClick={() => setDrumPattern({
                kick: new Array(16).fill(false),
                snare: new Array(16).fill(false),
                hihat: new Array(16).fill(false),
                openhat: new Array(16).fill(false)
              })}>CLEAR</button>
              <button onClick={() => {
                // Random pattern
                setDrumPattern({
                  kick: Array(16).fill(0).map((_, i) => i % 4 === 0 || Math.random() > 0.7),
                  snare: Array(16).fill(0).map((_, i) => i % 8 === 4),
                  hihat: Array(16).fill(0).map(() => Math.random() > 0.5),
                  openhat: Array(16).fill(0).map(() => Math.random() > 0.9)
                });
              }}>RANDOM</button>
              <button onClick={() => {
                // Save to active recording loop
                const recordingLoop = loops.find(l => l.isRecording);
                if (recordingLoop) {
                  recordLoop(recordingLoop.id);
                }
              }}>SAVE TO LOOP</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Drum Machine */}
          <div className="panel drum-machine">
            <h3>DRUM MACHINE</h3>
            <div className="drum-pads">
              {drumSounds.map((drum, i) => (
                <button
                  key={drum}
                  className={`drum-pad ${activeDrums.includes(drum) ? 'active' : ''}`}
                  onClick={() => triggerDrum(drum)}
                >
                  <span className="drum-name">{drum}</span>
                  <span className="drum-key">{i + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Feedback */}
          <div className="panel visualizer">
            <h3>VISUALIZER</h3>
            <div className="viz-display">
              <div className="beat-indicator">
                {Array(16).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`beat ${currentStep === i && isPlaying ? 'active' : ''}`}
                  />
                ))}
              </div>
              <div className="status-info">
                <div>Status: {isAudioInitialized ? '✓ Ready' : '⚠ Not initialized'}</div>
                <div>Step: {currentStep + 1}/16</div>
                <div>Preset: {synthParams.preset}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Keyboard */}
      <div className="panel virtual-keyboard">
        <h3>VIRTUAL KEYBOARD</h3>
        <div className="keyboard-controls">
          <button onClick={() => setOctave(Math.max(1, octave - 1))}>-</button>
          <span>Octave: {octave}</span>
          <button onClick={() => setOctave(Math.min(7, octave + 1))}>+</button>
        </div>
        <div className="piano-container">
          <div className="piano-keys">
            {noteNames.map((note, index) => {
              const isBlackKey = note.includes('#');
              const keyBinding = Object.entries(keyboardMap).find(([_, v]) => v === index)?.[0];
              return (
                <button
                  key={index}
                  className={`piano-key ${isBlackKey ? 'black' : 'white'} ${
                    activeKeys.includes(keyBinding || '') ? 'active' : ''
                  }`}
                  onMouseDown={() => playPianoNote(index)}
                  data-note={note}
                >
                  <span className="note-name">{!isBlackKey && note}</span>
                  {keyBinding && <span className="key-binding">{keyBinding.toUpperCase()}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="keyboard-info">
          <span>White keys: A S D F G H J K</span>
          <span>Black keys: W E T Y U</span>
          <span>Octave: - / +</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        {!isAudioInitialized && (
          <button onClick={initializeAudio} className="init-audio-btn">
            🎵 Click to Initialize Audio System
          </button>
        )}
        {isAudioInitialized && (
          <div className="shortcuts-info">
            <span>⌨️ Shortcuts:</span>
            <span>Space = Play/Stop</span>
            <span>1-8 = Drum Pads</span>
            <span>A-K = Piano Keys</span>
            <span>-/+ = Octave</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnoWorkstation;