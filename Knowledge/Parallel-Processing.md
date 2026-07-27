# Parallel Processing

---

## Core Principle
> Blend characteristics. Get the benefit without sacrificing the original.

---

## Why Parallel?

- Preserve original transients
- Add character without over-processing
- Blend control with dry signal
- Aggressive processing on subtle signal

---

## Common Parallel Setups

### Parallel Compression

**Kick**
- Dry: 50-70%
- Compressed: 30-50%
- Settings: 8:1, fast attack, 80ms release

**Snare**
- Dry: 40-60%
- Compressed: 40-60%
- Settings: 6:1, fast attack, 100ms release

**Bass**
- Dry: 60-80%
- Compressed: 20-40%
- Settings: 4:1, 10ms attack, 200ms release

### Parallel Distortion

**Bass**
- Dry: 60-70%
- Distorted: 30-40%
- Type: Overdrive, 10-20% drive

**Drums**
- Dry: 70-80%
- Distorted: 20-30%
- Type: Saturation, 5-10% drive

**Snare**
- Dry: 50-60%
- Distorted: 40-50%
- Type: Distortion, 15-25% drive

### Parallel Saturation

**Master Bus**
- Dry: 80-90%
- Saturated: 10-20%
- Type: Tape, 1-3% drive

**Drums Bus**
- Dry: 70-80%
- Saturated: 20-30%
- Type: Tape, 3-8% drive

---

## Implementation

### In Ableton
1. Route track to Audio Effect Rack
2. Chain 1: dry signal
3. Chain 2+: parallel processing
4. Crossfade between chains
5. Or: use return track with parallel send

### In Logic
1. Create parallelAux track
2. Route original to parallelAux
3. Process parallelAux heavily
4. Blend dry and parallelAux

### In FL Studio
1. Fruity Send track
2. Route original to send
3. Process send track
4. Control wet/dry on send

---

## Tips

1. Start with 50/50 blend, adjust from there
2. Heavy processing on parallel = subtle blend
3. Match levels when testing
4. Parallel works best on transients
5. Use for punch, character, glue
6. Sidechain parallel track if needed
7. Check mono compatibility