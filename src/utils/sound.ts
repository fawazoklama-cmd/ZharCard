// Procedural Web Audio API synthesizer for ZharCard.
// Audio stays strictly OFF until user enables it in Settings or Toolbar.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled = false;
  private musicEnabled = false;
  private musicInterval: number | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startAmbientLoop();
    } else {
      this.stopAmbientLoop();
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    if (!this.sfxEnabled) return;
    this.playTone(620, 0.07, 'triangle', 0.05);
  }

  public playPackShake() {
    if (!this.sfxEnabled) return;
    this.playTone(220, 0.14, 'triangle', 0.07, 0);
    this.playTone(280, 0.14, 'triangle', 0.07, 0.12);
    this.playTone(360, 0.18, 'sine', 0.09, 0.24);
  }

  public playCardFlip(isHighRarity = false) {
    if (!this.sfxEnabled) return;
    if (isHighRarity) {
      this.playTone(523.25, 0.16, 'sine', 0.09, 0);
      this.playTone(659.25, 0.18, 'sine', 0.09, 0.08);
      this.playTone(783.99, 0.24, 'triangle', 0.1, 0.16);
      this.playTone(1046.5, 0.35, 'sine', 0.1, 0.24);
    } else {
      this.playTone(440, 0.12, 'triangle', 0.06, 0);
      this.playTone(554, 0.14, 'sine', 0.06, 0.06);
    }
  }

  public playAttack() {
    if (!this.sfxEnabled) return;
    this.playTone(180, 0.12, 'sawtooth', 0.07, 0);
    this.playTone(110, 0.16, 'square', 0.06, 0.05);
  }

  public playDefense() {
    if (!this.sfxEnabled) return;
    this.playTone(392, 0.18, 'sine', 0.08, 0);
    this.playTone(523.25, 0.22, 'triangle', 0.07, 0.08);
  }

  public playSkill() {
    if (!this.sfxEnabled) return;
    this.playTone(440, 0.12, 'triangle', 0.08, 0);
    this.playTone(660, 0.16, 'sine', 0.09, 0.07);
    this.playTone(880, 0.24, 'sine', 0.09, 0.14);
  }

  public playVictory() {
    if (!this.sfxEnabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((n, idx) => {
      this.playTone(n, 0.26, 'triangle', 0.08, idx * 0.1);
    });
  }

  public playDefeat() {
    if (!this.sfxEnabled) return;
    [349.23, 311.13, 261.63].forEach((n, idx) => {
      this.playTone(n, 0.28, 'sine', 0.07, idx * 0.14);
    });
  }

  private startAmbientLoop() {
    if (typeof window === 'undefined' || this.musicInterval !== null) return;
    const notes = [392.0, 493.88, 587.33, 659.25, 783.99];
    let step = 0;
    this.playTone(notes[0], 0.9, 'sine', 0.025, 0);
    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const note = notes[step % notes.length];
      this.playTone(note, 1.1, 'sine', 0.025, 0);
      step++;
    }, 1600);
  }

  private stopAmbientLoop() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
