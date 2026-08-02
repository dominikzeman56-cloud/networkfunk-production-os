---
title: "DNB Academy — Abis — Drop 01 (Drum Programming + Bassline Writing)"
artist: Abis
platform: DNB Academy
date: 2026-08-01
language: English
duration: ~35min (est. from transcript length)
model: faster-whisper medium (int8 CPU)
tags:
  - workshop
  - drum-programming
  - arrangement
  - dnb
  - neurofunk
  - sidechain
  - bassline-writing
---

# DNB Academy — Abis — Drop 01

> Abis moves from isolated sound design into actual tune-writing: shows his default Ableton template (sidechain trigger groups, headroom gain-staging), builds a drum bed from scratch, then pulls in the reese/bass patches from the [[Abis-DNB-Academy-Bass-01|Bass 01]] session to write a scale-locked drop.

**Source:** `D:\ObsidianVault\Hudební produkce\workshop videos\Abis drop 01.mp4`

**Transcript files:** See `Workshop-Transcripts/Abis DNB Academy - Drop 01.*` (TXT, SRT, JSON)

---

## Key Takeaways

### Default Project Template
- Every new project starts with 4 pre-built groups/channels: **Kick SC Trigger**, **Snare SC Trigger**, a Kick group, a Snare group
- "SC" = Sidechain — dedicated silent MIDI trigger tracks that fire an **LFO Tool** ducking the sidechain group, instead of a standard sidechain compressor
  - Reason given: more control than attack/release on a compressor — steeper, more flexible ducking curve
  - Where you place these MIDI trigger clips determines what gets ducked — order/positioning matters
- Bass sounds get loaded into a dedicated **sidechain group** so they're automatically ducked by whatever triggers the LFO Tool
- Master chain: **Maximizer** on the output (no special settings) + a **Utility** before the master pulling gain down ~5dB for headroom, so nothing slams the limiter while writing
- Philosophy: keep engineering minimal at this stage — "free palette," detailed engineering happens later in the process

### Building the Drum Bed
- Starts at bar 49, mutes vocals, works fast and loose
- Kick and snare tuned to the track's key (F) — but notes this isn't a hard rule; sometimes picks a different in-scale note (e.g. C) deliberately
- Hi-hats/shakers pulled from a personal sample folder of hats made during earlier drum sessions — reused across projects for a cohesive sonic signature
- Unusual sound-design trick: recorded himself scrubbing tracks back and forth in Rekordbox while setting cue points, then ran it through a 1/16 filter to create "crazy," randomized percussive one-shots
- Keeps kick/snare hit zones clear — cuts, fades in/out, and repositions other percussion around them rather than layering on top
- Debugged a sidechain-not-working issue live: the MIDI trigger clips simply weren't enabled/present — a reminder to check the obvious first
- Groups hi-hats into "hats," sidechain trigger tracks into their own group, everything into a "Drums" group

### Bassline Writing (reusing Bass 01 patches)
- Loads saved presets from the sound-design session into the drop, auditions several against the drum bed
- Tunes/pitches presets to fit the song's scale — treats bass tuning like kick tuning (uses an LFO on master tune for punch, same trick as kick/snare)
- One patch had an FM peak causing an out-of-scale resonant tone — traced and fixed via a macro rather than resynthesizing
- Improvises a brand-new Serum bass mid-session when he hears a melodic idea in his head ("do do do do") rather than deferring it — described as a short attention span turned into a workflow habit: capture ideas immediately when they occur
- Uses a workaround (Utility gain drop at a specific point) to tame an annoying release tail on one bass patch instead of re-designing it
- Fine-tune detuning amount also controls LFO-like phasing speed on reese-style patches — same physics as the phase/detuning theory from Bass 01

### Arrangement & Mixing Passes
- After sketching intro + drop, takes a ~10 minute break, then returns to critically deconstruct what isn't working
- Splits kick into two separate channels by pitch/tuning (F vs C) for variation, mimicking a real drummer's inconsistency
- Adds a wave shaper across the whole drum bus for extra push/energy (saturation), then manually re-balances so the kick doesn't get buried
- Deliberately keeps hi-hats slightly off-grid ("funk") rather than quantized — cites this as a recurring technique from the drum-making sessions
- Iterative mixing-while-writing loop: mute/solo sections repeatedly, remove anything not earning its place, re-audition constantly

---

## Full Transcript

```
Cool. So now we're going to go about building the drop. But first, I wanted to show you what
my project template looks like... Kick SC Trigger, Snare SC Trigger... I like to use LFO tool.
The way I've set up is it works whenever a MIDI file from these channels are triggered, it will
initiate the LFO tool to duck down...

So in my user library, I have all the bass sounds which we made in the previous videos...
Schoolboy error. My actual side chain triggers weren't turned on...

I heard something in my head. And when I heard that, instead of leaving it to later, I was
going to do it there and then...

I took a little break... What needs improvement? ... I think the kick could be better...
I'm going to try and change the tuning of this... I like that much better, actually.
```

**Full transcript:** [[Workshop-Transcripts/Abis DNB Academy - Drop 01]]

---

## Related Notes
- [[Abis-DNB-Academy-Bass-01]]
- [[Abis-DNB-Academy-Bass-02]]
- [[Abis-DNB-Academy-Intro-Vocal]] — the tension-building section directly precedes this drop build
- [[Abis-DNB-Academy-Drop-02]] — direct continuation (snare design + bass re-engineering)
- [[The-Tune-Project-Structure]] — matches the "Kick SC TRIGGER" / "Snare SC TRIGGER" / "Sidechain 01" group structure seen here
- [[Abis]]
- [[Arrangement]]
- [[Sidechain-Groups-Template]] (suggested — compare against NPOS's own sidechain trigger approach)

## Tags
#workshop #abis #dnb-academy #drop #drum-programming #sidechain #arrangement #dnb #neurofunk
