---
title: "DNB Academy — Abis — Bass Sound Design 02 (Wavetables & Harmonics)"
artist: Abis
platform: DNB Academy
date: 2026-08-01
language: English
duration: ~22min (est. from transcript length)
model: faster-whisper medium (int8 CPU)
tags:
  - workshop
  - bass-sound-design
  - dnb
  - neurofunk
  - serum
  - wavetables
  - sound-design
  - theory
---

# DNB Academy — Abis — Bass Sound Design 02

> Follow-up to [[Abis-DNB-Academy-Bass-01|Bass 01]] — Abis goes deep into the theory of how Serum's wavetable/harmonic (bin) system actually works, why it behaves differently from octave/semitone thinking, then applies it to build basslines from scratch harmonics and from imported samples.

**Source:** `D:\ObsidianVault\Hudební produkce\workshop videos\Abis dnb academy bass 02.mp4`

**Transcript files:** See `Workshop-Transcripts/Abis DNB Academy - Bass 02.*` (TXT, SRT, JSON)

---

## Key Takeaways

### How Serum's Wavetable Bins Actually Work
- Contrasts Serum's oscillator model with FM8: Serum's octave/semitone tuning is intuitive, but the **wavetable table editor's "bins"** work differently — they're **integer multiples of the fundamental frequency**, not semitone steps
- Demonstrated live: fundamental at D# (~77.78 Hz). Bin 1 = fundamental. Bin 2 = 2× frequency (155.56 Hz, still D#, one octave up). Bin 3 = 3× frequency (233 Hz) → lands on A#, **not** another D# — because it's a harmonic multiple, not a musical interval
- Bin 5 = 5× fundamental → lands near G. Even-numbered bins (2, 4, 8...) always land back on the same note name as the fundamental (octaves); odd multiples land on other notes in the harmonic series
- Keeps a personal reference spreadsheet mapping note → frequency → bin/harmonic number, to avoid mental math while designing
- Practical use: reverse-engineer a reference bassline's tone by identifying which harmonic (bin) dominates on the spectrum analyzer, then rebuilding it in Serum with two oscillators — one fundamental, one set to just that harmonic bin

### Rebuilding a Reference Tone
- Once the dominant harmonic is isolated, most of the remaining "richness" comes from **distortion**, not the oscillator itself
- Reused "mega distortion" chain: amplitude stage → wave shaper → **Guitar Rig** → **iZotope Trash** at the end
- Automating the fundamental's volume while heavily distorted changes the harmonic balance dynamically — pushing it harder makes the distortion "compensate," producing an evolving texture; adding an LFO to this makes it musical/rhythmic
- Cycling through different bins (5, 6, 7, 8) on the same fundamental gives a fast way to explore related but distinct tones without re-patching
- Stacking multiple bins together, then adding unison/detune, reproduces the same phase-based "LFO" movement described in the Bass 01 reese/detuning theory

### Wavetable Automation
- Manually drawing/selecting harmonic content across wavetable frames, then **automating wavetable position**, creates evolving timbre — demoed on a second oscillator layered with FM
- A static single-frame tone can still work in a tune; automating position turns it into a second, more dynamic option from the same starting point

### Sample-to-Wavetable Technique
- Serum can import **any audio sample into an oscillator** and will calculate/derive its harmonic content automatically — a fast way to get unusual, organic textures
- Workflow: drag a sample in → import as "Pitch Track" or similar → use **Remove Multi-Section** (not single index removal) to strip empty/silent frames left over from import
- Once cleaned, scrubbing/automating wavetable position steps through the sample frame-by-frame; an LFO on position (e.g. 2-bar rate) flicks through it for evolving texture
- Layer the result with a plain sine sub an octave down to "complete" the sound, since chopped-sample wavetables often lack low-end weight
- Iterated with a "jet sound" foley sample as a live example — some imported samples work instantly as usable bass, others need heavy shaping or don't work at all; described as worth dedicating a spare hour to explore purely for ear-training on how Serum handles harmonics
- Filtering can target a single oscillator only (A or B) — useful for cleaning low end out of just the sample-derived layer while leaving the sub/fundamental oscillator untouched

### Workflow Note
- States his overall writing philosophy going into the next session: starts tunes from **melody first** — even in heavily distorted/pushed tracks, the musical element matters — leading into scales/melody theory applied to intro-writing.

---

## Full Transcript

```
Okay so now I want to talk about how you go about making your own wavetables in Serum and
firstly I wanted to talk about understanding how Serum works and the actual harmonics
involved... Serum oscillators have obviously what we talked about the octave and the
semitones... With frequency modulation it works a little bit different. Instead of having
octaves and semitones it has frequencies based on the fundamental frequency...

So bin 1 and bin 2 bin 3 bin 4 bin 5 etc are timesing from your fundamental frequency...

Another really cool option with Serum... it enables you to actually load any sample you want
into any oscillator and what it will do is will calculate those harmonics for you...

What I want to cover next is my approach to actually physically writing a tune... I really
love melody in my tunes... so let's write music.
```

**Full transcript:** [[Workshop-Transcripts/Abis DNB Academy - Bass 02]]

---

## Related Notes
- [[Abis-DNB-Academy-Bass-01]]
- [[The-Tune-Project-Structure]]
- [[Abis-DNB-Academy-Drop-01]]
- [[Serum]] (suggested)
- [[Wavetable-Synthesis]] (suggested)

## Tags
#workshop #abis #dnb-academy #bass-sound-design #wavetables #harmonics #serum #dnb #neurofunk
