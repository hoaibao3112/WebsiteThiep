/**
 * Audio synthesizer & player cho hiệu ứng mở thiệp cưới cao cấp.
 * Sử dụng Web Audio API để phát âm thanh chuông ngân hoàng gia + xào xạc giấy lụa mở phong bì
 * Không phụ thuộc mạng Internet, 0ms latency, không lỗi CORS trên iOS/Android.
 */

export function playEnvelopeOpeningSound(customUrl?: string) {
  // 1. Thử phát file âm thanh ngoài nếu có truyền vào
  if (customUrl) {
    try {
      const audio = new Audio(customUrl);
      audio.volume = 0.7;
      audio.play().catch(() => playSynthesizedOpeningSound());
      return;
    } catch {
      // Fallback xuống synthesizer
    }
  }

  playSynthesizedOpeningSound();
}

/**
 * Tạo âm thanh chuông phong bì trang trọng (Chime & Satin Paper Flutter)
 * bằng Web Audio API
 */
export function playSynthesizedOpeningSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // ─────────────────────────────────────────────────────────────
    // 1. ÂM THANH XÀO XẠC MỞ PHONG BÌ GIẤY LỤA (Paper Flutter/Whoosh)
    // ─────────────────────────────────────────────────────────────
    const bufferSize = ctx.sampleRate * 0.45; // 450ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // White noise với fade out tự nhiên
      const progress = i / bufferSize;
      const decay = Math.pow(1 - progress, 2.5);
      data[i] = (Math.random() * 2 - 1) * decay * 0.25;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bộ lọc Bandpass để tái tạo âm thanh sột soạt của giấy mỹ thuật
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.4);
    filter.Q.value = 1.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // ─────────────────────────────────────────────────────────────
    // 2. CHUÔNG NGÂN HOÀNG GIA DU DƯƠNG (Celestial Wedding Chime)
    // Hợp âm E6 - G#6 - B6 (Mi - Sol thăng - Si) lấp lánh hạnh phúc
    // ─────────────────────────────────────────────────────────────
    const chimeFrequencies = [1318.51, 1661.22, 1975.53, 2637.02];

    chimeFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const startTime = now + idx * 0.08;
      const duration = 1.6;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

  } catch (err) {
    console.debug("[OpeningSound] Web Audio unavailable:", err);
  }
}
