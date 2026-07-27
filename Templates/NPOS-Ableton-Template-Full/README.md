# NPOS Ableton Template

## Quick Setup

1. Open Ableton Live 10 or 11+
2. File → Open Folder
3. Select `NPOS-Ableton-Template-Full` folder
4. Double-click `Session.als` to open

## Template Settings

| Parameter | Value |
|-----------|-------|
| Tempo | 174 BPM |
| Time Signature | 4/4 |
| Key | Dm (default) |
| Sample Rate | 44100 Hz |
| Buffer Size | 256 samples |

## Track Layout

### Audio Tracks
| Track | Color | Purpose |
|-------|-------|---------|
| Kick | Red (#FF4444) | Foundation, impact |
| Snare | Orange (#FF6644) | Accents, groove |
| Hi-Hats | Yellow (#FFAA44) | Rhythmic detail |
| Percussion | Green (#44AA44) | Texture, accents |

### MIDI Tracks
| Track | Color | Purpose |
|-------|-------|---------|
| Bass Sub | Blue (#4444FF) | Fundamental, locked to kick |
| Bass Body | Blue (#4466FF) | Harmonics, FM synthesis |
| Bass Modulation | Blue (#4488FF) | Filter movement, LFO |
| Bass Texture | Blue (#44AAFF) | Noise, distortion |
| Atmosphere | Green (#44CC44) | Pads, ambient |
| FX | Purple (#CC44CC) | Risers, impacts |

### Return Tracks
| Return | Color | Purpose |
|--------|-------|---------|
| Reverb Short | Gray (#666666) | Tight space, drums |
| Reverb Long | Gray (#777777) | Deep space, atmosphere |
| Delay | Gray (#888888) | Rhythmic echoes |
| Saturation Bus | Gray (#555555) | Parallel glue |

## Effect Chains

### Kick
1. EQ8 - High-pass 25Hz, boost 60Hz (+3dB), presence at 3kHz (+2dB)
2. Saturation - 5% drive
3. Compressor - 4:1, -12dB threshold, fast attack, 80ms release
4. Limiter - -1dB ceiling

### Snare
1. EQ8 - High-pass 80Hz, cut 200Hz (-3dB), crack at 3kHz (+4dB)
2. Saturation - 10% drive
3. Compressor - 6:1, -18dB threshold, fast attack, 100ms release
4. Reverb - Short room, 25% wet

### Bass Sub
1. EQ8 - High-pass 25Hz
2. Limiter - -1dB ceiling

### Bass Body
1. EQ8 - High-pass 40Hz, cut 250Hz (-3dB), presence at 2kHz (+2dB)
2. Saturation - 8% drive
3. Compressor - 2.5:1, -15dB threshold, 10ms attack, 200ms release

### Returns
- **Reverb Short**: Size 0.25, Decay 0.8s
- **Reverb Long**: Size 0.7, Decay 3.0s
- **Delay**: 1/8 notes, 35% feedback
- **Saturation Bus**: 12% drive

## File Structure

```
NPOS-Ableton-Template-Full/
├── Project8_3/
│   ├── Session.als         # Ableton Live Set
│   └── Project8_3.cfg      # Project config
├── Template-Settings.json  # Template parameters
├── create_template.py      # Generator script
└── README.md               # This file
```

## Customization

Edit `Template-Settings.json` to modify tracks, effects, routing. Run `python create_template.py` to regenerate.