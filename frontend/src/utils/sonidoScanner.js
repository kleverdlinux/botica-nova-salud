/**
 * Generador de sonido PIP (Beep) para escaneo de códigos de barra
 * Emplea Web Audio API sin dependencias de archivos externos
 */
export function reproducirPipScanner() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Tono alto y nítido de 1850 Hz (frecuencia clásica de pistola óptica de supermercado / botica)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  } catch (e) {
    console.warn('No se pudo reproducir sonido de escáner:', e);
  }
}

