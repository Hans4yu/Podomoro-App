import { useCallback } from 'react'
import type { Settings } from '../types'

/**
 * Web Audio API tone generator — no external audio files needed.
 */
function createTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
    osc.onended = () => ctx.close()
  } catch {
    // Audio not supported
  }
}

export function useSound(settings: Settings) {
  const playFocusComplete = useCallback(() => {
    if (!settings.soundEnabled) return
    // Three ascending tones
    setTimeout(() => createTone(523, 0.2), 0)
    setTimeout(() => createTone(659, 0.2), 200)
    setTimeout(() => createTone(784, 0.4), 400)
  }, [settings.soundEnabled])

  const playBreakComplete = useCallback(() => {
    if (!settings.soundEnabled) return
    // Two gentle tones
    setTimeout(() => createTone(784, 0.2), 0)
    setTimeout(() => createTone(659, 0.4), 200)
  }, [settings.soundEnabled])

  const playTick = useCallback(() => {
    if (!settings.soundEnabled) return
    createTone(800, 0.05, 'square', 0.05)
  }, [settings.soundEnabled])

  return { playFocusComplete, playBreakComplete, playTick }
}
