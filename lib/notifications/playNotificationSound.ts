let audioContext: AudioContext | null = null;

/**
 * Short two-tone chime for board notifications. Browsers may block audio until
 * the user has interacted with the page (joining the event counts).
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;

  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    const now = audioContext.currentTime;
    const tones = [
      { freq: 880, start: 0, duration: 0.12 },
      { freq: 1174.66, start: 0.14, duration: 0.16 },
    ];

    for (const tone of tones) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(tone.freq, now + tone.start);
      gain.gain.setValueAtTime(0.0001, now + tone.start);
      gain.gain.exponentialRampToValueAtTime(0.08, now + tone.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + tone.start + tone.duration,
      );
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.duration + 0.02);
    }
  } catch {
    // Autoplay or AudioContext unsupported — toast still shows.
  }
}
