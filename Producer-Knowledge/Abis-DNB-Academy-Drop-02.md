---
title: "DNB Academy — Abis — Drop 02 (Snare Design, Bass Engineering, Arrangement Detail)"
artist: Abis
platform: DNB Academy
date: 2026-08-01
language: English
duration: ~30min (est. from transcript length)
model: faster-whisper medium (int8 CPU)
tags:
  - workshop
  - drum-programming
  - bass-engineering
  - mixing
  - dnb
  - neurofunk
  - convolution-reverb
  - sidechain
---

# DNB Academy — Abis — Drop 02

> Direct continuation of [[Abis-DNB-Academy-Drop-01|Drop 01]]. Goes deep on a custom "ringing" snare design technique using convolution reverb impulses, then spends most of the session critically re-engineering the drop's bass sounds — distortion ordering, sub-layering, stereo imaging — before finishing arrangement details with granular texture and reverse FX.

**Source:** `D:\ObsidianVault\Hudební produkce\workshop videos\Abis drop 02.mp4`

**Transcript files:** See `Workshop-Transcripts/Abis DNB Academy - Drop 02.*` (TXT, SRT, JSON)

---

## Key Takeaways

### Custom "Ringing" Snare via Convolution Reverb
- Signature technique for the ringing/resonant tone on his snares: builds his **own convolution reverb impulses** — a sine wave plus white noise, rendered as an impulse for every note of the scale (mentions a Facebook tutorial covering this in more depth)
- Loads the tuned impulse matching the track's key/section into a convolution reverb, sets it ~100% wet, and resamples/records that print in — rather than leaving convolution reverb live (says the wet/dry and envelope control on convolution reverb is otherwise hard to manage, especially the tail length)
- Result gets layered under the snare's existing transient/fundamental/white-noise layers for the ringing character
- Also experimented with (and rejected) simpler alternatives first: duplicating the sine and manually tuning a ring (calculated by counting scale degrees from the snare's fundamental), and frequency shifting — convolution gave the best result

### Bass Re-Engineering (the bulk of the session)
- Revisits the bass sounds dropped into the arrangement in Drop 01 and diagnoses why the section "sounds terrible": traces the problem to the bass, not the hi-hats, before touching anything else — explicit lesson in isolating the actual problem first
- **EQ-before-distortion vs. after:** boosting the fundamental *before* distortion changes how the distortion reacts to the whole harmonic content (since the boosted fundamental now dominates the signal fed into the distortion stage), which can unexpectedly tame or lose the sub — fixed by EQing **after** distortion instead
- **Detuned saw layers vs. sub:** adding a plain, non-detuned sine sub under an already phase-detuned reese collapses the LFO-like movement (the two saws' phasing that created the motion in Bass 01) — sub layering has to account for this
- Switched from Guitar Rig to a **different, cleaner distortion** on one bass to preserve more of that movement while still getting output level
- Sub-layering as a repeatable fix: group a bass with a plain sub sine underneath, same octave-down approach used repeatedly for weak-sounding bass patches through the session
- **Stereo imaging check:** uses Utility's Mid-Side mode to solo the mono (sub) content and confirm nothing conflicting is happening between the wide stereo top end and the mono low end
- Identifies a specific problem — two different bass patches in the same section "sound like two separate basslines" with no cohesion — and works to glue them (via matching processing, matching stereo width, layering) rather than picking one
- Recurring, unresolved annoyance flagged multiple times: **clicks from the sidechain/LFO Tool** — partial fix found by smoothing the LFO Tool's function curve, which reduces but doesn't fully eliminate clicking

### Arrangement Polish
- Fixes an arp that starts in tune and drifts out — reverses the modulation direction so it starts detuned and resolves *into* tune over the phrase (more musically satisfying arrival)
- Iterates with several LFO slots (LFO 2 through LFO 5) hunting for the right modulation source/target combination — shown as trial-and-error, not a fixed recipe
- Adds reverse-FX swells and small risers from his personal sample library to build anticipation into the drop
- Introduces **Granulator II** (Max for Live) for the first time on camera — deliberately learns it live ("we can do it together") and grain-processes a bass layer for extra texture
- Session ends mid-flow after an accidental Ableton edit/deletion — recovers the section and signs off for a break before continuing arrangement

---

## Full Transcript

```
Let's see what this sounds like, nope that didn't sound good... let's try and improve this
snare now... I'm going to duplicate the sine wave... let's try some convolution reverb...
convolution reverb is a very cool tool because it allows you to actually load in your
impulses, so what I do is I make a sine wave and add white noise to it...

I think this bass could be improved loads as well... my thought process was wow that sounds
terrible, why does it sound terrible, first thought was okay maybe something to do with those
hi-hats but I think a lot more productive approach is to fix this bass first...

so because the EQ is before the distortion, the distortion is changing its reaction to the
harmonics being fed into it...

there is a cool plugin and I've never used this plugin so we can do it together, it's a
granular synth or granular tool from max for life... granulator two...

something's glitching out there, thanks Ableton, just ruined the moment... I think I just
accidentally deleted a section... take a little break, get some fresh air.
```

**Full transcript:** [[Workshop-Transcripts/Abis DNB Academy - Drop 02]]

---

## Related Notes
- [[Abis-DNB-Academy-Drop-01]]
- [[Abis-DNB-Academy-Bass-01]]
- [[The-Tune-Project-Structure]]
- [[Bass-Engineering]]
- [[Convolution-Reverb]] (suggested)

## Tags
#workshop #abis #dnb-academy #drop #bass-engineering #snare-design #convolution-reverb #sidechain #dnb #neurofunk
