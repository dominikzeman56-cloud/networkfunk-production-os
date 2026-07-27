# Ableton Production Template

---

## Template Overview

### BPM: 174
### Time Signature: 4/4
### Key: Dm (default)

---

## Track Structure

### Audio Tracks
1. Kick (audio track)
2. Snare (audio track)
3. Hi-Hats (audio track)
4. Percussion (audio track)
5. Bass Sub (audio/midi)
6. Bass Body (midi)
7. Bass Modulation (midi)
8. Bass Texture (midi)
9. Atmosphere (midi)
10. FX (audio/midi)

### Return Tracks
1. Reverb (short)
2. Reverb (long)
3. Delay
4. Saturation Bus
5. Master Bus

---

## Drum Rack Setup

### Kick
- Sample slot 1
- Transients: fast attack, short decay
- Processing: EQ > Sat > Comp > Lim

### Snare
- Sample slot 1-3 (layered)
- Processing: EQ > Sat > Comp > Reverb

### Hi-Hats
- 4-6 variations
- Pattern-based variation
- Processing: EQ > Sat > Pan

### Percussion
- Shaker, ride, click
- Processing: EQ > Comp

---

## Bass Chain Architecture

### Sub (MIDI track → Analog Obsidian)
- Oscillator: Sine
- Pitch: Root + octave
- Filter: None
- Processing: EQ > Lim

### Body (MIDI track → Serum)
- Oscillators: 2-3 detuned saws
- FM: Modulator A > Carrier
- Filter: Low-pass, resonance 30%
- Processing: EQ > Sat > Comp

### Modulation (MIDI track → Phase Plant)
- LFO modulation on filter cutoff
- Envelope on resonance
- Processing: Sat > EQ

### Texture (MIDI track → Phase Plant)
- Noise oscillator
- Bitcrush processing
- Processing: EQ > Dist

---

## Signal Chain Standards

### EQ Pattern (per channel)
1. High-pass at 30 Hz (except kick, bass sub)
2. Cut 200-400 Hz if muddy
3. Boost presence at 3-5 kHz
4. Air boost at 10-16 kHz

### Compression Pattern
1. Kick: 4:1, fast attack, 100ms release
2. Bass: 2:1, 10ms attack, 200ms release
3. Snare: 6:1, fast attack, 150ms release
4. Bus: 2:1, 10ms attack, 300ms release

### Saturation Pattern
- Low percentage (2-10%)
- Clean tape emulation
- Parallel processing

---

## Routing

### Sends
- Reverb Short: 10-20% wet
- Reverb Long: 5-10% wet
- Delay: 5-15% wet
- Saturation: Parallel blend

### Grouping
- Drums → Drum Bus
- Bass Layers → Bass Bus
- FX → FX Bus

---

## Automation Setup

### Pre-mapped Automation
- Master volume
- Drum bus compression
- Bass bus compression

### Automation Ready Tracks
- Filter parameters
- Effect parameters
- Volume rides

---

## Shortcuts

| Action | Shortcut |
|--------|----------|
| New Audio Track | Cmd+Shift+T |
| New MIDI Track | Cmd+Shift+M |
| Duplicate | Cmd+D |
| Quantize | Cmd+1 |
| Double Loop | Cmd+L |
| Half Loop | Cmd+Shift+L |
| Freeze | Cmd+Shift+F |
| Consolidate | Cmd+Shift+E |