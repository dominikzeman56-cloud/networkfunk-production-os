---
title: "Project Breakdown — Abis 'The Tune' (DNB Academy Masterclass Project)"
artist: Abis
platform: DNB Academy
date: 2026-08-01
source_file: "D:\\Ableton\\Projects\\The Tune Project\\The Tune.als"
daw: Ableton Live
tags:
  - project-breakdown
  - dnb
  - neurofunk
  - ableton
  - reese
  - serum
  - arrangement-reference
---

# Project Breakdown — Abis "The Tune"

> Local Ableton Live project (`The Tune.als`) confirmed as the actual project Abis builds/breaks down across the DNB Academy Bass masterclass videos. Track names and device chains line up directly with what's described in the [[Abis-DNB-Academy-Bass-01|Bass 01]] transcript (Serum reeses, Guitar Rig 5, iZotope Trash 2, Vocoder, Erosion, LFO Tool + Valhalla Vintage Verb on the low-pass intro reese).

**Source:** `D:\Ableton\Projects\The Tune Project\The Tune.als`
**Backups available:** `Backup\The Tune [2020-05-06 151840].als`, `Backup\The Tune [2020-05-06 153115].als`

---

## Track Structure (45 tracks)

### Intro (Group)
| Track | Type | Devices |
|---|---|---|
| 2-Drone - High Reece Low F | Audio | EQ8 |
| Piano | MIDI | 3× Plugin |
| 003 intro Reece | MIDI | Serum → EQ8 → **Guitar Rig 5** → **LFO Tool** → **Valhalla Vintage Verb** → Plugin → EQ8 |

This is the **low-pass reese intro chain** described in the Bass 01 workshop — Serum reese, distortion via Guitar Rig 5, LFO Tool automating the low-pass cutoff, Valhalla reverb for the moody intro texture.

### Vocals (Group — Chorus, Plugin, EQ8 on group)
| Track | Devices |
|---|---|
| 6-Masterclass Vocal | EQ8 |
| 7-Masterclass Vocal (Freeze tail) | EQ8 |
| 8-Masterclass Vocal (Freeze) | EQ8, Plugin |
| 9-Masterclass Vocal (Freeze) | EQ8 |
| 10-Masterclass Vocal (Freeze) | EQ8, Plugin |
| 11-Drone - High Reece F Shepard 16bar | EQ8 |
| Vocal Drop | EQ8 |

Multiple Freeze layers of the same vocal stem — consistent with the layered ad-lib/whisper approach seen in other Abis breakdowns.

### Drums
| Track | Devices |
|---|---|
| Kick SC TRIGGER (MIDI) | InstrumentGroupDevice |
| Snare SC TRIGGER (MIDI) | InstrumentGroupDevice |
| Drums (Group) | Plugin, StereoGain |
| Kick C | Plugin, Plugin, EQ8, Plugin |
| 01 Snare Plane | InstrumentGroupDevice, EQ8 ×2, MxDeviceAudioEffect |
| 20-Audio, 21-CLAP, 22-02 Finger 02 | EQ8 |
| hats (Group): 24-ChinaShort, 25-Funk Hats, 26-Hat Roller, 27-ClapBetter, 28-Collider Highs, 29-TOMS 172 | EQ8 each |

Separate MIDI "SC TRIGGER" tracks for kick/snare confirm a dedicated **sidechain-trigger routing** setup (trigger tracks driving compressors elsewhere, not audible themselves).

### Sidechain 01 (Group)
- Plugin, Plugin, EQ8 on the group — likely the sidechain compressor chain fed by the trigger tracks above.

### Melodic / Bass
| Track | Devices |
|---|---|
| ARP | InstrumentGroupDevice, AudioEffectGroupDevice, EQ8 |
| Intro Synth | Serum_x64 |
| basss (Group) | EQ8 |
| 001 bass | InstrumentGroupDevice, EQ8 |
| 002 | InstrumentGroupDevice, StereoGain |
| **36-Serum_x64** | Serum → EQ8 → AudioEffectGroupDevice → Plugin → **Vocoder** → EQ8 |
| 37-Instrument Rack | InstrumentGroupDevice, EQ8 |
| **38-Serum_x64** | Serum → Plugin → EQ8 → **Erosion** |
| 39-Audio | EQ8 |
| **40-Serum_x64** | Serum → AudioEffectGroupDevice → EQ8 ×2 |
| **41-Serum_x64** | Serum → EQ8 → **Vocoder** → **Guitar Rig 5** |
| Toms (MIDI) | Plugin ×2, EQ8 |
| **43-Serum_x64** | Serum → Plugin → EQ8 |

Five separate Serum bass tracks (36, 38, 40, 41, 43) — matches the masterclass workflow of building multiple parallel reese/neuro bass variations rather than committing to one. Vocoder shows up twice (36, 41) and Guitar Rig 5 twice (003 intro Reece, 41) — recurring go-to tools mentioned repeatedly in the transcript.

### FX / Texture
| Track | Devices |
|---|---|
| 44-Misfits reverse G#-F | EQ8 |
| 45-Reverse 01 4Bar | EQ8 |
| 46-Roll 3 | EQ8 |
| 47-weird Highs v2 | EQ8 |
| 48-Yamaha Custom Maple01 (F) | EQ8 |
| 49-FM8 Clack Percussion F 172 | EQ8 |

### Returns
| Track | Devices |
|---|---|
| A-Verb Big | Plugin |
| B-Delay | Delay |
| C-Return | — |
| D-Return | — |

---

## Cross-Reference with Bass 01 Transcript

| Transcript claim | Confirmed in project |
|---|---|
| Two saw-wave reese via Serum | 5× Serum tracks present |
| Guitar amp sims (Guitar Rig / AmpliTube) for distortion | Guitar Rig 5 on `003 intro Reece` and `41-Serum_x64` |
| iZotope Trash for milder distortion | iZotope Trash 2 present in project device pool |
| Vocoder for texture | Vocoder on `36-Serum_x64` and `41-Serum_x64` |
| Erosion for top-end crunch | Erosion on `38-Serum_x64` |
| LFO Tool + reverb on low-pass intro reese | LFO Tool + Valhalla Vintage Verb on `003 intro Reece` |
| Layered/frozen vocal ad-libs | 4 separate Freeze layers of Masterclass Vocal |

---

## Related Notes
- [[Abis-DNB-Academy-Bass-01]]
- [[Abis-DNB-Academy-Drop-01]] — the "Kick SC TRIGGER" / "Snare SC TRIGGER" / "Sidechain 01" tracks in this project are exactly the template described there
- [[Abis-DNB-Academy-Drop-02]] — bass re-engineering pass on the "36/38/40/41/43-Serum_x64" tracks
- [[Abis-DNB-Academy-Bass-02]]
- [[Abis-DNB-Academy-Intro-Vocal]] — matches the "Masterclass Vocal" Freeze layers
- [[Abis]]
- [[Bass-Engineering]]
- [[Sidechain-Groups-Template]] (suggested — compare against NPOS sidechain trigger approach)

## Tags
#project-breakdown #abis #dnb-academy #ableton #reese #serum #arrangement-reference
