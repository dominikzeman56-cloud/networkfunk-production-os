---
type: synthesis
title: "Failed Serum Preset Creation - Skullstep Rave Lead (Tool Connectivity Issues)"
created: 2026-07-28
updated: 2026-07-28
tags:
  - neuroman
  - serum
  - preset
  - troubleshooting
  - omniroute
  - producer-pal
status: developing
related:
  - "[[NeuroMan project]]"
  - "[[Serum 2 preset format]]"
  - "[[Skullstep Rave Lead build sheet]]"
sources:
  - "[[.raw/session-4664d407-ec6f-471f-8177-66f5a30a5e85.md]]"
---

NeuroMan fails to create a Serum preset for Skullstep Rave Lead due to connectivity issues between its orchestrator layer and supporting tools.

The session begins with NeuroMan attempting to configure Oscillator A for a Skullstep Rave Lead preset. It specifies:
- Waveform: FM From B
- Wavetable: Digital > FM_Square (updated from Square_Saw for sharper FM response)
- WT Pos: 40% (reduced from 50% to minimize aliasing)
- FM Depth: 45% (increased from 35% for aggressive bite)
- FM Ratio: 1.50 (changed from 2.00 to create non-integer metallic harmonics)
- Phase: 0%
- Random Phase: 5% (added for subtle instability)
- Pan: -10% (narrowed from 0% for focus)
- Level: -2.0 dB (rebalanced from -3.0 dB)
- Pitch: -12 semitones (octave down)
- Unison: 3 voices (unchanged)
- Detune: 18% (increased from 12% for wider spread at -1 octave)

Similar detailed configurations are attempted for Oscillator B and Oscillator C (Sub/Fundament), including:
- Oscillator B: Saw waveform, -1 octave, 3 voices unison, -2 octave for fundamental role
- Oscillator C: Basic OPL waveform, -2 octave, role as harmonic foundation for distortion
- Envelopes: Instant attack (0ms) amp envelope, filtered decay envelope for filter cutoff modulation
- LFO 1: Square wave at 1/8 rate (525ms at 172 BPM) assigned to OSC C Wavetable Position with 90° phase
- Matrix Modulation: LFO 1 → Global Main Tuning at +13% for pitch jump effect
- Filter 1: LBH-12 type, 40Hz cutoff, 4% resonance, +5-10% drive
- FX Chain: Chorus (HPF mode, 0.30Hz rate, 12% depth), Dimension section, Overdrive distortion (3x stack), EQ (low-mid cut, high boost), Splitter (800Hz-1kHz split with delayed/reverbed highs)

Every parameter adjustment attempt fails with identical error patterns:
1. **OmniRoute HTTP 503/Timeout**: The OmniRoute service returns 503 Service Unavailable or times out when NeuroMan tries to route commands
2. **Producer Pal/Ableton Errors**: 
   - Tool `ppal-update-device-param` not found or disabled
   - HTTP 504 Gateway Timeout when communicating with Ableton Live
   - Repeated timeouts on `ppal-read-live-set` calls
3. **Circuit Breaker Open**: After multiple failures, the Ableton circuit breaker opens ("Obvod 'ableton' je otevreny (prilis mnoho chyb)"), preventing further attempts to protect the failing service

The root cause is a breakdown in the NeuroMan orchestrator stack:
- **NeuroMan** (orchestrator layer) → **OmniRoute** (communication router) → **Producer Pal** (Ableton bridge) → **Ableton Live** → **Serum plugin**

At any point in this chain, failure prevents preset creation. The HTTP 503 errors suggest OmniRoute is either down or overloaded, while HTTP 504 errors indicate Producer Pal cannot successfully communicate with Ableton Live (possibly due to Ableton not running, Producer Pal not connected, or network/firewall issues).

To resolve this, users should:
1. Verify OmniRoute service is running and accessible
2. Confirm Producer Pal is properly installed and connected to Ableton Live
3. Check that Ableton Live is running with the correct project loaded
4. Ensure Serum plugin is inserted and active in the Ableton track
5. Restart services in order: Ableton Live → Producer Pal → OmniRoute → NeuroMan