/**
 * Bộ tạo âm thanh sột soạt lật giấy mỹ thuật chân thực (Realistic Paper Page Flip Sound)
 * Sử dụng Web Audio API Noise Buffer + Low-Pass Filter sweep
 * - Zero network latency
 * - Zero 404/CORS risk
 * - Tự động phát âm thanh sột soạt nhẹ như lật trang photobook thật
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playPageFlipSound(volume = 0.35) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 1. Tạo buffer tiếng sột soạt giấy (White noise với decay tự nhiên)
    const duration = 0.28; // 280ms
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Pink/Brownish noise simulation cho tiếng sột soạt giấy mềm mại
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI) * Math.exp(-progress * 2.5);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // 2. Low-Pass Filter sweep mô phỏng góc uốn cong của trang giấy khi lật
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.12);
    filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    // 3. Gain control (Volume fade-in / fade-out)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    // Kết nối đồ thị âm thanh
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
  } catch {
    // Không làm gián đoạn UI nếu trình duyệt chặn autoplay audio
  }
}
