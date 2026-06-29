/**
 * Procedural Cinematic Romantic Audio Synthesizer using the Web Audio API.
 * This ensures 100% offline reliability, zero bandwidth, and beautiful real-time procedural soundscapes.
 */

import { Scene } from '../types';

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.5;
  
  // Track scheduler and timer references
  private musicTimer: any = null;
  private ambientTimer: any = null;
  private currentSceneType: string | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  // Track position memory/indicators to allow smooth morphing
  private melodyIndex: number = 0;
  private chordIndex: number = 0;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.masterGain.connect(this.ctx.destination);
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);

    // Initial gains
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.15);
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  getVolume() {
    return this.volume;
  }

  getIsMuted() {
    return this.isMuted;
  }

  // Generate an audio buffer with white noise for atmospheric effects (rain, wind, vinyl, etc)
  private getNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("Audio Context not initialized");
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of loopable noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Cinematic Soundtrack Orchestrator: triggers seamless soundtrack crossfades
  playSceneMusic(scene: Scene, lightsOn: boolean, cakeStep?: string) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    let trackType = 'opening';

    if (scene === Scene.Opening) {
      trackType = lightsOn ? 'lightson' : 'opening';
    } else if (scene === Scene.Candles) {
      trackType = 'candles';
    } else if (scene === Scene.Cake) {
      if (cakeStep === 'cutting' || cakeStep === 'cut' || cakeStep === 'celebrating') {
        trackType = 'cakecutting';
      } else {
        trackType = 'cake';
      }
    } else if (scene === Scene.Celebration) {
      trackType = 'celebration';
    } else if (scene === Scene.Letter) {
      trackType = 'letter';
    } else if (scene === Scene.Timeline || scene === Scene.Gallery || scene === Scene.Counter) {
      trackType = 'timeline';
    } else if (scene === Scene.Kiss) {
      trackType = 'kiss';
    }

    if (this.currentSceneType === trackType) return;
    this.currentSceneType = trackType;

    // Smoothly fade out previous track's generators
    this.fadeAndStopTracks();

    // Start scheduling the new scene soundscape
    setTimeout(() => {
      this.startTrackSynthesizer(trackType);
    }, 150);
  }

  private fadeAndStopTracks() {
    clearTimeout(this.musicTimer);
    clearTimeout(this.ambientTimer);

    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      // Fade out the current music nodes smoothly
      this.activeOscillators.forEach(({ gain }) => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        } catch (e) {}
      });

      // Fade out background noise node
      if (this.noiseGain) {
        try {
          this.noiseGain.gain.cancelScheduledValues(now);
          this.noiseGain.gain.setValueAtTime(this.noiseGain.gain.value, now);
          this.noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        } catch (e) {}
      }

      // Cleanup elements shortly after fadeout finishes
      const oscToClean = this.activeOscillators;
      const noiseToClean = this.noiseNode;
      this.activeOscillators = [];
      this.noiseNode = null;

      setTimeout(() => {
        oscToClean.forEach(({ osc }) => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        try { if (noiseToClean) { noiseToClean.stop(); noiseToClean.disconnect(); } } catch (e) {}
      }, 1500);
    }
  }

  private startTrackSynthesizer(track: string) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    // Reset music gain for fresh fade-in
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.001, now);
    this.musicGain.gain.linearRampToValueAtTime(0.65, now + 1.5);

    switch (track) {
      case 'opening':
        this.setupAtmosphericNoise('rain-wind');
        this.scheduleOpeningPiano();
        break;
      case 'lightson':
        this.setupAtmosphericNoise('gentle-wind');
        this.scheduleLightsOnStrings();
        break;
      case 'candles':
        this.scheduleRomanticGuitar();
        break;
      case 'cake':
        this.scheduleJoyfulCake();
        break;
      case 'cakecutting':
        this.scheduleCuttingBuildUp();
        break;
      case 'celebration':
        this.setupAtmosphericNoise('celebration-cheer');
        this.scheduleCelebrationUplifting();
        break;
      case 'letter':
        this.scheduleLetterPianoViolin();
        break;
      case 'timeline':
        this.setupAtmosphericNoise('lofi-vinyl');
        this.scheduleLofiInstrumental();
        break;
      case 'kiss':
        this.scheduleKissClimax();
        break;
    }
  }

  private setupAtmosphericNoise(type: 'rain-wind' | 'gentle-wind' | 'lofi-vinyl' | 'celebration-cheer') {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    try {
      const buffer = this.getNoiseBuffer();
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      this.noiseGain = this.ctx.createGain();
      this.noiseFilter = this.ctx.createBiquadFilter();

      this.noiseNode.connect(this.noiseFilter);
      this.noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.musicGain);

      if (type === 'rain-wind') {
        // Highpass filter for rain sizzle + Lowpass sweep for wind whoosh
        this.noiseFilter.type = 'bandpass';
        this.noiseFilter.frequency.setValueAtTime(1200, now);
        this.noiseFilter.Q.setValueAtTime(0.8, now);
        this.noiseGain.gain.setValueAtTime(0.18, now);

        // Slow wind whooshing LFO simulator
        const windLfo = () => {
          if (this.currentSceneType !== 'opening' || !this.ctx || !this.noiseFilter) return;
          const t = this.ctx.currentTime;
          this.noiseFilter.frequency.linearRampToValueAtTime(600 + Math.random() * 800, t + 4);
          this.ambientTimer = setTimeout(windLfo, 4500);
        };
        windLfo();
      } else if (type === 'gentle-wind') {
        this.noiseFilter.type = 'lowpass';
        this.noiseFilter.frequency.setValueAtTime(450, now);
        this.noiseGain.gain.setValueAtTime(0.08, now);
      } else if (type === 'lofi-vinyl') {
        // Dusty vinyl filter with crackling pops scheduled periodically
        this.noiseFilter.type = 'bandpass';
        this.noiseFilter.frequency.setValueAtTime(1000, now);
        this.noiseFilter.Q.setValueAtTime(1.5, now);
        this.noiseGain.gain.setValueAtTime(0.04, now);

        const scheduleVinylCrackle = () => {
          if (this.currentSceneType !== 'timeline' || !this.ctx || !this.masterGain) return;
          const t = this.ctx.currentTime;
          
          // Generate a sudden short dusty tick
          const crackleOsc = this.ctx.createOscillator();
          const crackleG = this.ctx.createGain();
          crackleOsc.type = 'triangle';
          crackleOsc.frequency.setValueAtTime(120 + Math.random() * 200, t);
          crackleG.gain.setValueAtTime(0.015, t);
          crackleG.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

          crackleOsc.connect(crackleG);
          crackleG.connect(this.musicGain!);
          crackleOsc.start(t);
          crackleOsc.stop(t + 0.02);

          this.ambientTimer = setTimeout(scheduleVinylCrackle, 300 + Math.random() * 1500);
        };
        scheduleVinylCrackle();
      } else if (type === 'celebration-cheer') {
        // Uplifting crowd murmur/fireworks hiss
        this.noiseFilter.type = 'lowpass';
        this.noiseFilter.frequency.setValueAtTime(800, now);
        this.noiseGain.gain.setValueAtTime(0.03, now);
      }

      this.noiseNode.start(now);
    } catch (e) {
      console.warn("Noise buffer setup failed", e);
    }
  }

  // 1. OPENING SCENE: Soft ambient piano notes (Fmaj7 -> G -> Em7 -> Am7)
  private scheduleOpeningPiano() {
    const playChordNote = () => {
      if (this.currentSceneType !== 'opening' || !this.ctx) return;

      const chords = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
        [196.00, 246.94, 293.66, 392.00], // G6 (G3, B3, D4, G4)
        [164.81, 196.00, 246.94, 329.63], // Em7 (E3, G3, B3, E4)
        [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      ];

      const currentChord = chords[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % chords.length;

      // Play soft arpeggiated piano notes with slow attack
      currentChord.forEach((note, index) => {
        const delay = index * 0.45;
        setTimeout(() => {
          if (this.currentSceneType !== 'opening') return;
          this.playPianoNote(note, 4.0, 0.05);
        }, delay * 1000);
      });

      this.musicTimer = setTimeout(playChordNote, 7000);
    };

    playChordNote();
  }

  // 2. LIGHTS ON: Warm orchestral strings join the soft piano
  private scheduleLightsOnStrings() {
    const playStringsWithPiano = () => {
      if (this.currentSceneType !== 'lightson' || !this.ctx) return;

      const chords = [
        [174.61, 261.63, 329.63, 440.00], // Fmaj7 add 9
        [196.00, 293.66, 392.00, 493.88], // G Major
        [220.00, 329.63, 392.00, 523.25], // Am7
        [220.00, 293.66, 349.23, 440.00], // Dm7/A
      ];

      const currentChord = chords[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % chords.length;

      // Play rich string pads
      this.playStringsPad(currentChord, 6.0);

      // Play soft single piano notes on top
      currentChord.forEach((note, idx) => {
        setTimeout(() => {
          if (this.currentSceneType !== 'lightson') return;
          this.playPianoNote(note * 2, 3.5, 0.035);
        }, idx * 600);
      });

      this.musicTimer = setTimeout(playStringsWithPiano, 5500);
    };

    playStringsWithPiano();
  }

  // 3. CANDLE LIGHTING: Romantic Acoustic Guitar plucks & subtle piano pads
  private scheduleRomanticGuitar() {
    const playGuitarSequence = () => {
      if (this.currentSceneType !== 'candles' || !this.ctx) return;

      // Romantic chord progression in G Major / E minor
      const chords = [
        [196.00, 293.66, 392.00, 440.00], // G major
        [146.83, 220.00, 293.66, 369.99], // D major
        [164.81, 246.94, 329.63, 392.00], // E minor
        [130.81, 261.63, 329.63, 392.00], // C major
      ];

      const currentChord = chords[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % chords.length;

      // Gentle acoustic plucks
      currentChord.forEach((note, i) => {
        const delay = i * 0.35;
        setTimeout(() => {
          if (this.currentSceneType !== 'candles') return;
          this.playAcousticPluck(note, 2.5, 0.08);
          // Highlight high octaves for sweet glisten
          if (i === 3) this.playAcousticPluck(note * 2, 2.0, 0.04);
        }, delay * 1000);
      });

      // Play soft backdrop warm chord
      this.playPianoNote(currentChord[0] / 2, 6.0, 0.04);
      this.playPianoNote(currentChord[1], 6.0, 0.02);

      this.musicTimer = setTimeout(playGuitarSequence, 4800);
    };

    playGuitarSequence();
  }

  // 4. CAKE SCENE: Joyful romantic instrumental
  private scheduleJoyfulCake() {
    const playJoyfulVibe = () => {
      if (this.currentSceneType !== 'cake' || !this.ctx) return;

      const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale notes
      const progression = [
        [261.63, 329.63, 392.00, 523.25], // C major
        [349.23, 440.00, 523.25, 698.46], // F major
        [293.66, 349.23, 440.00, 587.33], // D minor
        [392.00, 493.88, 587.33, 783.99], // G major
      ];

      const currentChord = progression[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % progression.length;

      // Play light joyful synth bell arpeggio
      currentChord.forEach((note, idx) => {
        setTimeout(() => {
          if (this.currentSceneType !== 'cake') return;
          this.playBellNote(note, 1.2, 0.05);
        }, idx * 250);
      });

      // Warm backing bass
      this.playPianoNote(currentChord[0] / 4, 4.0, 0.06);
      this.playPianoNote(currentChord[2] / 2, 4.0, 0.04);

      this.musicTimer = setTimeout(playJoyfulVibe, 2800);
    };

    playJoyfulVibe();
  }

  // 5. CAKE CUTTING SEQUENCE: Emotional orchestral build-up
  private scheduleCuttingBuildUp() {
    let pitchMultiplier = 1.0;
    
    const playBuildUp = () => {
      if (this.currentSceneType !== 'cakecutting' || !this.ctx) return;

      const baseNote = 220.00; // A3
      const chord = [baseNote, baseNote * 1.2, baseNote * 1.5, baseNote * 1.8];

      // Gradually increase tension strings with volume crescendo
      this.playStringsPad(chord.map(n => n * pitchMultiplier), 1.8, 0.08 * pitchMultiplier);
      
      // Fast sweet piano arpeggio climbing up
      chord.forEach((n, idx) => {
        setTimeout(() => {
          if (this.currentSceneType !== 'cakecutting') return;
          this.playPianoNote(n * 2 * pitchMultiplier, 1.0, 0.04 * pitchMultiplier);
        }, idx * 150);
      });

      pitchMultiplier += 0.08;
      if (pitchMultiplier > 1.8) pitchMultiplier = 1.0; // clamp loop safely

      this.musicTimer = setTimeout(playBuildUp, 1500);
    };

    playBuildUp();
  }

  // 6. CELEBRATION SCREEN: Uplifting cinematic symphony + firework triggers
  private scheduleCelebrationUplifting() {
    const playSymphony = () => {
      if (this.currentSceneType !== 'celebration' || !this.ctx) return;

      const progression = [
        [261.63, 329.63, 392.00, 523.25], // C Major
        [349.23, 440.00, 523.25, 698.46], // F Major
        [392.00, 493.88, 587.33, 783.99], // G Major
        [329.63, 392.00, 493.88, 659.25], // E Minor
      ];

      const currentChord = progression[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % progression.length;

      // Hearts heartbeat sub-bass thump
      this.playSubBass(currentChord[0] / 4, 1.2);

      // Glorious strings brass-like fanfares
      this.playStringsPad(currentChord, 3.2, 0.12);

      // Sweet sparkle bells cascading down
      currentChord.reverse().forEach((note, idx) => {
        setTimeout(() => {
          if (this.currentSceneType !== 'celebration') return;
          this.playBellNote(note * 2, 1.8, 0.06);
        }, idx * 200);
      });

      // Periodically spark a custom procedural firework sound to match the mood!
      if (Math.random() > 0.4) {
        setTimeout(() => {
          this.playFireworkSound();
        }, 1200);
      }

      this.musicTimer = setTimeout(playSymphony, 3200);
    };

    playSymphony();
  }

  // 7. FLYING LETTER SCENE: Soft emotional piano & violin duet
  private scheduleLetterPianoViolin() {
    const playDuet = () => {
      if (this.currentSceneType !== 'letter' || !this.ctx) return;

      // Sad-sweet beautiful progression in A Minor / D Minor / C Major
      const progression = [
        { chords: [220.00, 261.63, 329.63, 440.00], lead: 440.00 }, // Am
        { chords: [146.83, 220.00, 261.63, 349.23], lead: 523.25 }, // Dm7
        { chords: [130.81, 196.00, 261.63, 329.63], lead: 493.88 }, // C
        { chords: [196.00, 246.94, 293.66, 392.00], lead: 392.00 }, // G
      ];

      const step = progression[this.melodyIndex];
      this.melodyIndex = (this.melodyIndex + 1) % progression.length;

      // Gentle piano accompaniment arpeggios
      step.chords.forEach((note, idx) => {
        setTimeout(() => {
          if (this.currentSceneType !== 'letter') return;
          this.playPianoNote(note, 3.5, 0.07);
        }, idx * 300);
      });

      // Warm sliding solo violin melody on top
      this.playViolinSolo(step.lead, 3.8);

      this.musicTimer = setTimeout(playDuet, 4000);
    };

    playDuet();
  }

  // 8. TIMELINE & GALLERY: Relaxing lo-fi romantic instrumental with dusty vinyl crackle
  private scheduleLofiInstrumental() {
    const playLofiVibe = () => {
      if (this.currentSceneType !== 'timeline' || !this.ctx) return;

      // Cozy jazz-infused neo-soul chords (Dm9 -> G13 -> Cmaj9 -> A7)
      const chords = [
        [146.83, 220.00, 261.63, 329.63, 440.00], // Dm9
        [196.00, 246.94, 293.66, 392.00, 440.00], // G13
        [130.81, 196.00, 261.63, 329.63, 493.88], // Cmaj9
        [220.00, 277.18, 329.63, 392.00, 493.88], // A7b13
      ];

      const currentChord = chords[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % chords.length;

      // Cozy warm Rhodes style soft e-piano chords (slow strike)
      currentChord.forEach((note, idx) => {
        setTimeout(() => {
          if (this.currentSceneType !== 'timeline') return;
          this.playRhodesPianoNote(note, 4.0, 0.06);
        }, idx * 80);
      });

      // Lazy cozy lofi baseline pulse
      this.playSubBass(currentChord[0] / 2, 2.5, 0.08);

      this.musicTimer = setTimeout(playLofiVibe, 4500);
    };

    playLofiVibe();
  }

  // 9. FINAL KISS CLIMAX: Beautiful dreamy love theme ending on sweet soft piano
  private scheduleKissClimax() {
    const playClimax = () => {
      if (this.currentSceneType !== 'kiss' || !this.ctx) return;

      // Emotional pure love chords
      const progression = [
        [261.63, 329.63, 392.00, 523.25, 659.25], // C major 9
        [349.23, 440.00, 523.25, 698.46, 880.00], // F major 9
        [293.66, 349.23, 440.00, 587.33, 880.00], // D minor 11
        [392.00, 493.88, 587.33, 783.99, 987.77], // G major 9
      ];

      const currentChord = progression[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % progression.length;

      // Glistening bells cascading down
      currentChord.forEach((note, idx) => {
        setTimeout(() => {
          if (this.currentSceneType !== 'kiss') return;
          this.playBellNote(note, 2.5, 0.05);
        }, idx * 150);
      });

      // Warm orchestral backdrop
      this.playStringsPad(currentChord, 4.2, 0.09);

      // Deep heartbeat bass
      this.playSubBass(currentChord[0] / 4, 1.8, 0.1);

      this.musicTimer = setTimeout(playClimax, 4000);
    };

    playClimax();
  }

  // Fade out music entirely at the end
  fadeAndStopMusicGradually() {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.exponentialRampToValueAtTime(0.0001, now + 5);
    setTimeout(() => {
      this.fadeAndStopTracks();
    }, 5100);
  }

  stopBackgroundMusic() {
    this.fadeAndStopMusicGradually();
  }

  startAmbientPad() {
    this.playSceneMusic(Scene.Opening, true);
  }

  // --- COMPONENT INSTRUMENTS SYNTHESIS ---

  // 1. Classical Warm Acoustic Piano
  private playPianoNote(freq: number, duration: number, customVolume = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq + 1.2, now); // slightly detuned for chorus

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(customVolume, now + 0.02); // sharp attack
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // long acoustic decay

    osc1.connect(oscGain);
    osc2.connect(oscGain);
    oscGain.connect(filter);
    filter.connect(this.musicGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);

    this.activeOscillators.push({ osc: osc1, gain: oscGain });
  }

  // 2. Sweet Rhodes Electric Piano
  private playRhodesPianoNote(freq: number, duration: number, customVolume = 0.06) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const tineOsc = this.ctx.createOscillator(); // metallic chime tone of rhodes
    const oscGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    tineOsc.type = 'sine';
    tineOsc.frequency.setValueAtTime(freq * 3.99, now); // chime tone overtone

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(customVolume, now + 0.05); // slightly softer attack
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const tineGain = this.ctx.createGain();
    tineGain.gain.setValueAtTime(0, now);
    tineGain.gain.linearRampToValueAtTime(customVolume * 0.4, now + 0.01);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35); // fast decay on chime

    osc.connect(oscGain);
    tineOsc.connect(tineGain);

    oscGain.connect(filter);
    tineGain.connect(filter);
    filter.connect(this.musicGain);

    osc.start(now);
    tineOsc.start(now);
    osc.stop(now + duration + 0.1);
    tineOsc.stop(now + duration + 0.1);

    this.activeOscillators.push({ osc, gain: oscGain });
  }

  // 3. Orchestral String Ensemble Pads (detuned saw-waves with rich lowpass filtering)
  private playStringsPad(notes: number[], duration: number, volume = 0.06) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    notes.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscDetune = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      oscDetune.type = 'sawtooth';
      oscDetune.frequency.setValueAtTime(freq - 1.5, now); // Detune for symphonic widening

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(1.2, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume / notes.length, now + 1.8); // Orchestral swelling rise
      gainNode.gain.setValueAtTime(volume / notes.length, now + duration - 2.0);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode);
      oscDetune.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(this.musicGain!);

      osc.start(now);
      oscDetune.start(now);
      osc.stop(now + duration + 0.1);
      oscDetune.stop(now + duration + 0.1);

      this.activeOscillators.push({ osc, gain: gainNode });
    });
  }

  // 4. Romantic Acoustic Guitar Plucks
  private playAcousticPluck(freq: number, duration: number, volume = 0.08) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1.0, now);

    // Dynamic guitar-like decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);

    this.activeOscillators.push({ osc, gain });
  }

  // 5. Dreamy Glistening Celebration Bells
  private playBellNote(freq: number, duration: number, volume = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const harmony = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    harmony.type = 'sine';
    harmony.frequency.setValueAtTime(freq * 2.0, now); // perfect higher octave resonance

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    harmony.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    harmony.start(now);
    osc.stop(now + duration + 0.1);
    harmony.stop(now + duration + 0.1);

    this.activeOscillators.push({ osc, gain });
  }

  // 6. Warm Heartbeat Sub-Bass
  private playSubBass(freq: number, duration: number, volume = 0.1) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);

    this.activeOscillators.push({ osc, gain });
  }

  // 7. Sweet Emotional Solo Violin (triangle wave with a vibrant LFO-based vibrato)
  private playViolinSolo(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Introduce slow LFO for warm human vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(6.2, now); // 6.2Hz vibrato speed
    lfoGain.gain.setValueAtTime(4.5, now); // pitch variance

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(2.0, now); // slight nasal cello resonance

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.6); // smooth string strike rise
    gainNode.gain.setValueAtTime(0.05, now + duration - 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(this.musicGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration + 0.1);
    osc.stop(now + duration + 0.1);

    this.activeOscillators.push({ osc, gain: gainNode });
  }

  // --- SOUND EFFECTS (SFX) ---

  playSwitchSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playCandleSettleSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playCandleBlowoutSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Breath puff using filtered white noise
    try {
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
    } catch (e) {}
  }

  playCakeSliceSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playBalloonPopSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Thumping pop (low frequency boom + high frequency snap)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);

    try {
      // High frequency snap
      const bufferSize = this.ctx.sampleRate * 0.03;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
    } catch (e) {}
  }

  playFireworkSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Deep Boom
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(90, now);
    boomOsc.frequency.exponentialRampToValueAtTime(20, now + 0.4);

    boomGain.gain.setValueAtTime(0.28, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boomOsc.start(now);
    boomOsc.stop(now + 0.41);

    // Crackling Sizzle
    const crackleCount = 6;
    for (let i = 0; i < crackleCount; i++) {
      const delay = 0.1 + Math.random() * 0.4;
      const pitch = 700 + Math.random() * 1000;
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const time = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(pitch, time);
        o.frequency.exponentialRampToValueAtTime(90, time + 0.1);

        g.gain.setValueAtTime(0.03, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        o.connect(g);
        g.connect(this.sfxGain!);
        o.start(time);
        o.stop(time + 0.11);
      }, delay * 1000);
    }
  }

  playEnvelopeSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    try {
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
    } catch (e) {}
  }

  playKissSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);

    setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(620, t);
      osc2.frequency.exponentialRampToValueAtTime(480, t + 0.05);

      gain2.gain.setValueAtTime(0.06, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc2.connect(gain2);
      gain2.connect(this.sfxGain!);
      osc2.start(t);
      osc2.stop(t + 0.06);
    }, 35);
  }

  playClickSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const audio = new RomanticAudioEngine();
