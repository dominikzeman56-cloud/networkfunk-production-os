---
title: "DNB Academy — Abis — Bass Sound Design 01"
artist: Abis
platform: DNB Academy
date: 2026-08-01
language: English
duration: ~53min (est. from transcript length)
model: faster-whisper medium (int8 CPU)
tags:
  - workshop
  - bass-sound-design
  - dnb
  - neurofunk
  - serum
  - reese
  - sound-design
---

# DNB Academy — Abis — Bass Sound Design 01

> Abis walks through an unplanned, improvised bass sound design session in Serum — building a palette of reese/neuro-style basses from scratch to later use when writing a tune. Covers saw-wave reeses, phase/detuning theory, distortion chains, wavetable modulation, and workflow habits.

**Source:** `D:\ObsidianVault\Hudební produkce\workshop videos\Abis dnb academy bass 01.mp4`

**Transcript files:** See `Workshop-Transcripts/Abis DNB Academy - Bass 01.*` (TXT, SRT, JSON)

---

## Key Takeaways

### Workflow Philosophy
- Runs isolated sound-design sessions separate from writing tunes — e.g. spends days making ~100 bass presets before ever starting a track
- Deliberately works unplanned/improvised on camera to show the real process, not a pre-baked result
- Follows instinct/ear over formula — avoids everyone sounding the same by not copying a fixed recipe
- Renders a one-shot audio sample whenever a tone sounds interesting (destructive but fast — builds a big sample library over time)
- Uses macros set to zero as safe "undo anchors" so tweaking doesn't ruin a sound he already likes
- Takes short breaks (~5 min every hour or two) to reset ears and reassess ideas with fresh perspective
- Saves patches into numbered personal folders (e.g. "bass sounds master class 00") for later reuse in a tune

### Classic Reese (Saw-Wave Method)
- Two saw oscillators, random phase set to zero (consistent starting phase — same habit as kick/snare design)
- Static/single saw = no movement; detuning (fine-tune, not semitones) between the two oscillators creates the classic "moving/LFO-like" reese texture
- Explains the phase-cancellation theory behind it: identical audio + inverted phase = silence, because speaker cone receives contradictory push/pull information (tug-of-war effect)
- Mono + legato voicing for basslines
- Chain: distortion (guitar amp sims — Guitar Rig / AmpliTube "best amps" preset folder) → filtering (band-pass, low-pass) → stereo cabinet setting must be checked for stereo bass
- Erosion (Ableton) adds white-noise-driven top-end crunch/peakiness
- Band-pass filtering pre-distortion can produce cool "peaky" tones, though gets messy fast

### Wavetable / Neuro-Style Modulation
- Switches from saw waves to stock Serum wavetables (e.g. "MB triangle (metal)") for a second pass
- Automating wavetable position alone creates evolving, modulating texture — visible as shifting harmonics on the spectrum analyzer
- FM (oscillator A from B) adds character; combine with sub oscillator (one octave down) for low-end weight
- LFO on filter cutoff/level for movement; disable LFO retrigger to avoid re-triggering per note
- Unison + detune for width
- Distortion choice matters by genre: guitar cabinet sims can be too aggressive; Isotope Trash gives milder/tamer distortion for more control
- OTT-style compression can over-rebalance harmonic content and eat bass headroom — used sparingly
- Chorus widens stereo field but risks phasing the low end — mitigate by splitting into a duplicated/grouped "chorus" layer instead of applying directly
- Vocoder and FM-into-sine can produce alien/unusual textures worth keeping as options even if not immediately usable

### Low-Pass Reese (Intro Style)
- Low-passed reeses used for moody, melodic drum & bass intros
- Simple setup: reese patch + LFO tool on low-pass cutoff (24dB), automate rate/depth for movement
- Add vintage reverb sparingly (avoid overly gated styles), low-cut to keep it from muddying
- Whole moody intro texture achievable quickly (minutes) once the go-to reese patch chain exists

### Practical Studio Notes
- Prefers designing bass on studio monitors over headphones for accurate low-end judgment
- Time-boxes sound design: ~2 hours max per sound if it has real potential, otherwise save and move on
- Not worried about strict stereo-sub rules during the exploratory jamming phase — fixes translation issues later once the idea is solid

---

## Full Transcript

```
Okay, so let's talk about making bass sounds. So what I like to do a lot is I like to make
sessions for myself where I just make bass lines... [see full transcript]

So if we start changing this, let me actually play the serum.
Now let's record that back in again and see the difference... phase-cancellation demo with two
identical audio files, one phase-flipped, showing why the speaker produces no sound.

...that is the theory into detuning reeses. And this is why you start to get that kind of
really familiar kind of LFO sound.

So one of the things that I like in drum bass is very melodic intros and I love to have these
kind of low-pass reeses doing a lot of the kind of moody, very moody bassy work of the tune...

So I took a little break. Back at it again. Ready to go... I wanted to kind of make a reese
type of sound but with lots of modulation in it. Like lots of sounds you would hear in the
kind of neuro type of tunes...
```

**Full transcript:** [[Workshop-Transcripts/Abis DNB Academy - Bass 01]]

---

## Related Notes
- [[Abis]]
- [[Bass-Engineering]]
- [[Sound-Design]]
- [[The-Tune-Project-Structure]] — local .als project confirmed as the actual masterclass project
- [[Abis-DNB-Academy-Drop-01]] — these bass patches get reused when writing the drop
- [[Abis-DNB-Academy-Bass-02]] — direct continuation (wavetable/harmonic theory)
- [[Serum]] (suggested)
- [[Reese-Bass]] (suggested)

## Tags
#workshop #abis #dnb-academy #bass-sound-design #dnb #neurofunk #serum #reese
