# Decision Trees

---

## Bass Layering Decision Tree

```
START: Need bass sound?
│
├─► NO: Skip to drums
│
└─► YES: What bass archetype?
       │
       ├─► Reese/Deep
       │   └─► Layer: Sub + Body (filtered saw)
       │
       ├─► Mid-bass/Hyper
       │   └─► Layer: Body + Noise + Movement
       │
       ├─► FM/Metallic
       │   └─► Layer: FM oscillator + Distortion + Texture
       │
       └─► Wobble/Growl
           └─► Layer: Movement (LFO filter) + Distortion
```

---

## EQ Decision Tree

```
START: Frequency problem?
│
├─► Mud (150-400 Hz)
│   ├─► Is it bass?
│   │   ├─► YES: Cut 200-400 Hz on bass
│   │   └─► NO: High-pass element, cut 200-400 Hz
│   │
│   └─► Is it kick?
│       └─► Cut 200-400 Hz on kick
│
├─► Harsh (2-5 kHz)
│   └─► Cut 3-5 kHz, narrow Q
│
├─► Weak presence
│   └─► Boost 3-5 kHz, wide Q
│
└─► Empty top
    └─► Boost 8-12 kHz, gentle
```

---

## Compression Decision Tree

```
START: What to achieve?
│
├─► Control peaks
│   └─► Ratio: 4:1+, Attack: fast, Release: fast
│
├─► Add punch
│   └─► Ratio: 4-6:1, Attack: 1-10ms, Release: 50-100ms
│
├─► Glue mix
│   └─► Ratio: 2:1, Attack: 10ms, Release: 100-200ms
│
└─► Add character
    └─► Parallel compression, ratio varies
```

---

## Arrangement Decision Tree

```
START: Arranging section
│
├─► What section?
│   ├─► Intro
│   │   └─► Strip down, build slowly, 8-16 bars
│   │
│   ├─► Build
│   │   └─► Add elements each 4 bars, filter sweep
│   │
│   ├─► Drop
│   │   └─► Full energy, established groove, 16-32 bars
│   │
│   ├─► Breakdown
│   │   └─► Strip to 1-2 elements, create space, 8-16 bars
│   │
│   └─► Outro
│       └─► Energy drop, fade or hit, 8-16 bars
│
└─► How long?
    ├─► Too long: Trim to 8 bars minimum
    └─► Too short: Extend if energy supports
```

---

## Sidechain Decision Tree

```
START: Sidechain needed?
│
├─► Kick masking bass?
│   └─► YES: Sidechain bass to kick (2-4 dB)
│
├─► Kick masking pads/synths?
│   └─► YES: Sidechain to kick (1-3 dB)
│
├─► Build energy for drop?
│   └─► YES: Filter sweep into drop, duck bass
│
└─► NO: Don't add unless solves problem
```

---

## Render Decision Tree

```
START: Render needed?
│
├─► Need to freeze/reset CPU?
│   └─► YES: Render to audio, replace track
│
├─► Need external processing?
│   └─► YES: Render with wet signal
│
├─► Need to share?
│   └─► Render full mix, WAV 44.1/24-bit
│
├─► Need stems?
│   └─► Render groups separately, same start point
│
└─► NO: Keep MIDI editable
    └─► Stay in MIDI, render only if necessary
```