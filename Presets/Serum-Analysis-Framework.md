# Serum Preset Analysis Framework

## Preset Locations
- **Serum 2**: `D:\VST\Xfer\Serum 2 Presets\Presets`
- **Serum 1**: `D:\VST\Xfer\Serum Presets\Presets`

## Analysis Framework

### For Each Preset Extract:

```
1. Load preset in Serum
2. Document: Oscillators (waveform, warp, unison, detune)
3. Document: Filters (type, cutoff, resonance, drive)
4. Document: Modulation (LFOs, envelopes, matrix)
5. Document: FX chain (effects, order, settings)
6. Document: Macros (assignments, ranges)
7. Categorize: bass|lead|fx|pad|texture
8. Assess: neurofunk suitability
9. Extract: production principle
```

## Version Comparison

| Feature | Serum 1 | Serum 2 |
|---------|---------|---------|
| Oscillators | 6 warp modes | 14 new + 6 warp |
| wavetable | Standard | Enhanced morph |
| FX slots | 10 | Enhanced |
| Mod matrix | Standard | Expanded |

## Neurofunk Preset Categories

### Bass
- Reese foundation (detuned unison)
- Growl leads (filter LFO)
- Mid-bass texturers (FM)
- Sub layers (sine, pitch-locked)

### Lead
- Acid-style (envelope mod)
- Supersaw (stack, widen)
- Digital (wavetable)
- Formant (vocal-like)

### FX
- Risers (pitch env)
- Downlifers (reverse)
- Pads (reese atmospherics)
- Impacts (transient)

## Output Template

```markdown
# [Preset Name]

**Category:** Bass/Lead/FX/Pad/Texture
**Version:** Serum 1 / Serum 2
**Source:** [Preset folder path]

## Oscillator Strategy
- Waveforms: []
- Unison: [voices], [detune] cents
- Warp mode: [name]

## Filter Strategy
- Type: [type]
- Cutoff: [Hz]
- Resonance: [%]
- Drive: [type]

## Modulation
- LFOs: []
- Envelopes: []
- Key routes: []

## FX Chain
- []

## Production Principle
What this preset demonstrates about sound design.

## Neurofunk Application
How to use this in neurofunk context.
```

## Folder Structure

```
Presets/
├── Serum/
│   ├── v1/
│   │   ├── Bass/
│   │   ├── Lead/
│   │   ├── FX/
│   │   └── Pad/
│   └── v2/
│       ├── Bass/
│       ├── Lead/
│       ├── FX/
│       └── Pad/
```