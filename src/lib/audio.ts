const NOTES: Record<string, number> = {
  'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
  'G4': 392.00, 'A4': 440.00, 'AS4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25
};

export const TUNES = {
  happy_birthday: [
    ['C4', 0.5], ['C4', 0.5], ['D4', 1], ['C4', 1], ['F4', 1], ['E4', 2],
    ['C4', 0.5], ['C4', 0.5], ['D4', 1], ['C4', 1], ['G4', 1], ['F4', 2],
    ['C4', 0.5], ['C4', 0.5], ['C5', 1], ['A4', 1], ['F4', 1], ['E4', 1], ['D4', 2],
    ['AS4', 0.5], ['AS4', 0.5], ['A4', 1], ['F4', 1], ['G4', 1], ['F4', 2]
  ],
  cute_bounce: [
    ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['C5', 1],
    ['G4', 0.5], ['E4', 0.5], ['C4', 1.5]
  ],
  mellow: [
    ['C4', 1], ['E4', 1], ['G4', 1], ['B4', 2],
    ['A4', 1], ['G4', 1], ['E4', 2]
  ]
};

let audioCtx: AudioContext | null = null;
let isPlaying = false;

let playbackTimeout: number | undefined;
let customAudioEl: HTMLAudioElement | null = null;

export function stopTune() {
  if (playbackTimeout) {
    clearTimeout(playbackTimeout);
    playbackTimeout = undefined;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  isPlaying = false;
}

export function playTune(tuneName: keyof typeof TUNES | 'custom' | string = 'happy_birthday', customUrl?: string) {
  if (isPlaying) {
    stopTune();
  }
  
  if (tuneName === 'custom' && customUrl) {
    isPlaying = true;
    return;
  }

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const tune = TUNES[tuneName as keyof typeof TUNES];
  if (!tune) return;

  isPlaying = true;
  const tempo = 160; // Faster tempo
  const beatDuration = 60 / tempo;
  
  const playSeq = () => {
    let startTime = audioCtx!.currentTime + 0.1;

    tune.forEach(([noteName, durationRaw]) => {
      const duration = (durationRaw as number) * beatDuration;
      const freq = NOTES[noteName as string];
      if (freq) {
        playNote(freq, startTime, duration);
      }
      startTime += duration + 0.05; // slight gap for staccato feel
    });

    playbackTimeout = window.setTimeout(() => {
      if (isPlaying) {
        playSeq();
      }
    }, (startTime - audioCtx!.currentTime) * 1000);
  };

  playSeq();
}

let effectCtx: AudioContext | null = null;

export function playPageTurnSound() {
  if (!effectCtx) {
    effectCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (effectCtx.state === 'suspended') {
    effectCtx.resume();
  }

  const duration = 0.4;
  const bufferSize = effectCtx.sampleRate * duration;
  const buffer = effectCtx.createBuffer(1, bufferSize, effectCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = effectCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = effectCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, effectCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, effectCtx.currentTime + duration);

  const gain = effectCtx.createGain();
  gain.gain.setValueAtTime(0, effectCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, effectCtx.currentTime + duration * 0.2);
  gain.gain.linearRampToValueAtTime(0, effectCtx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(effectCtx.destination);

  noise.start();
}

export function playTypewriterSound() {
  if (!effectCtx) {
    effectCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (effectCtx.state === 'suspended') {
    effectCtx.resume();
  }

  const duration = 0.06;
  const bufferSize = effectCtx.sampleRate * duration;
  const buffer = effectCtx.createBuffer(1, bufferSize, effectCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = effectCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = effectCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(4000, effectCtx.currentTime);

  const gain = effectCtx.createGain();
  gain.gain.setValueAtTime(0, effectCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, effectCtx.currentTime + 0.01);
  gain.gain.linearRampToValueAtTime(0, effectCtx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(effectCtx.destination);

  noise.start();
}

function playNote(frequency: number, startTime: number, duration: number) {
  if (!audioCtx) return;
  
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Mix triangle and sine for a richer warmer music box sound
  osc1.type = 'triangle';
  osc1.frequency.value = frequency;

  osc2.type = 'sine';
  osc2.frequency.value = frequency * 1.005; // slight detune

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.15, startTime + duration * 0.1); // Attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay
  
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc1.start(startTime);
  osc1.stop(startTime + duration);
  osc2.start(startTime);
  osc2.stop(startTime + duration);
}
