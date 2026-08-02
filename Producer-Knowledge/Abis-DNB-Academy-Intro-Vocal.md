---
title: "DNB Academy — Abis — Intro Vocal Recording & Processing"
artist: Abis
platform: DNB Academy
date: 2026-08-01
language: English
duration: ~13min (est. from transcript length)
model: faster-whisper medium (int8 CPU)
tags:
  - workshop
  - vocal-processing
  - dnb
  - neurofunk
  - melodyne
  - arrangement
---

# DNB Academy — Abis — Intro Vocal

> Abis records a rough, wordless "dying animal" style vocal himself (not a trained singer) and shows how tuning, layering, and processing turn a throwaway take into a usable, scale-locked intro texture. Ends by starting to sketch the transition into the drop using tension-building placeholder sounds.

**Source:** `D:\ObsidianVault\Hudební produkce\workshop videos\abis intro vocal.mp4`

**Transcript files:** See `Workshop-Transcripts/Abis DNB Academy - Intro Vocal.*` (TXT, SRT, JSON)

---

## Key Takeaways

### Recording Philosophy
- Explicitly not a trained singer — records wordless, textural vocal takes ("sounds like a dying animal") specifically to prove you don't need singing ability to get something usable
- Also records a simple breath/exhale sound during the same take, used as a standalone intro element/impact
- Core argument: recording your own voice guarantees a unique sample nobody else has, even without lyrics or technical skill

### Tuning with Melodyne
- Loads a take into Melodyne, transfers audio in (had to retry the transfer a couple of times — not seamless)
- Because the track is already locked to **F harmonic minor**, correcting the vocal's pitch centers to notes in that scale is straightforward
- After correcting pitch, freezes the track to lock in the tuned result and continues layering from there
- Notes some takes respond better to Melodyne correction than others — accepts "good enough" rather than chasing perfection, especially since there's no intelligible lyric content to distract from pitch

### Processing Chain
- Reverb: **Valhalla Shimmer**, pushed close to 100% wet for one texture pass
- Distortion: mild **iZotope Trash** (clip control-style setting) — pulled back after finding the first pass too aggressive
- Mentions iZotope Nectar as a good all-in-one option (saturation + reverb + delay) for vocal processing if available
- Goal for one layer: turn the vocal into a pad-like texture while still being audibly a vocal, not fully abstracted
- Duplicates and pitches a layer down 12 semitones (an octave) for a harmony/depth layer
- Groups multiple processed vocal takes into a single **Vocals** group, then moves reverb from individual channels onto the group return to save CPU and simplify the chain
- Adds **chorus** to the group for stereo width — later has second thoughts and removes it on rebalance
- Uses the recorded breath sample deliberately to mask an audibly artificial/"auto-tuney" moment in one of the vocal takes rather than trying to fix the take itself

### Building the Pre-Drop Tension Section
- Starts sketching the transition point where the track needs to shift from vocal/intro mood into "evil," dark, energetic tension ahead of the drop
- Notes an option to reuse the drop's actual bassline early here as a preview/foreshadowing element — decided to prototype ideas first before committing
- Runs through a personal sample library for tension elements: horror pads, detuned drones, rise/riser sounds — auditions several, rejects most, keeps a "horror pad" and a rise sound that fit the scale (D#)
- Deliberate arrangement principle stated directly: reuse elements that will reappear in the drop so the transition **foreshadows** what's coming rather than surprising the listener with unrelated new sounds — a stated alternative approach (introduce it cold) is acknowledged but not chosen here
- Groups the tension/riser elements into an "Intro" group, then moves on to explaining the project's drum/sidechain template (continued in [[Abis-DNB-Academy-Drop-01]])

---

## Full Transcript

```
Okay, so I've just gone and recorded a vocal. It's very rubbish. I am by no means a singer.
But I wanted to give you a perspective in that even if you can't sing that well, you can still
open the mic, record something and make it fit in and create something unique...

So if you haven't used Melodyne, Melodyne is basically a tool which helps you correctly tune
vocals... because we already know our scale, F harmonic minor, it makes our life a lot easier...

I want some energy, I want it to be dark, I want some kind of tension in that... we want to
suggest what's coming next... because this is also a cool way of doing things, but I think in
this instance we want to suggest what's coming next.
```

**Full transcript:** [[Workshop-Transcripts/Abis DNB Academy - Intro Vocal]]

---

## Related Notes
- [[Abis-DNB-Academy-Drop-01]] — continues directly into the drum/sidechain template walkthrough
- [[The-Tune-Project-Structure]] — "Masterclass Vocal" tracks with multiple Freeze layers match this session
- [[Vocal-Processing]] (suggested)
- [[Melodyne]] (suggested)

## Tags
#workshop #abis #dnb-academy #vocal-processing #melodyne #arrangement #dnb #neurofunk
