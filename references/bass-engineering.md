# Bass Engineering

Purpose: guide neurofunk bass design by archetype, function, and mix context.

## Core Philosophy

Bass design is arrangement, synthesis, and mix at the same time.

Design basses against drums and sub from the beginning. A bass that wins solo but loses with kick and snare is not finished.

## Archetypes

| Archetype | Best For | Main Mechanism |
|---|---|---|
| Growl | speech-like aggression, rhythmic answers | synced LFO, FM, filter movement, wavetable motion |
| Reese | sustained pressure, width, rolling weight | detune, beating, phasing, distortion, filtering |
| Hybrid | modern neuro movement with weight | reese body plus growl articulation |
| Neurobounce | club rhythm and accessibility | simple motif, strong envelope, clear groove |
| Tech bass | precise, metallic, aggressive phrases | FM, comb, band reject, tight automation |

## Growl Decision Tree

```text
Does it need clearer speech?
  -> Increase formant/filter movement or FM contrast.

Does it need more bite?
  -> Add controlled distortion before or after filtering and compare.

Does it lose weight?
  -> Separate sub from mid bass and simplify the low-mid layer.

Does it feel random?
  -> Lock LFO rate, phrase length, and MIDI rhythm to the groove.
```

## Reese Decision Tree

```text
Does it need wider motion?
  -> Use detune, phase movement, chorus/phaser, or stereo-only upper layers.

Does it collapse in mono?
  -> Keep sub mono, narrow low mids, move width upward.

Does it mask the kick?
  -> Rework envelope, sidechain, or carve the kick fundamental area.

Does it sound static?
  -> Automate filter, distortion amount, wavetable position, or resampled edits.
```

## Layer Architecture

Use one function per layer:

- Sub: mono, stable, minimal processing.
- Body: main low-mid weight.
- Movement: LFO/filter/FM motion.
- Texture: noise, grit, mechanical detail.
- Air: high-frequency edge.
- Stereo: width above the risky low range.
- Transition: tail, reverse, pitch, fill, or printed edit.

## Resampling Workflow

1. Create MIDI phrase.
2. Make the sound work with drums and sub.
3. Print audio.
4. Chop, reverse, pitch, fade, stretch, or reorder.
5. Keep the best printed gestures.
6. Replace clutter with one strong phrase.

## Bass Checks

- [ ] Sub works without mid bass.
- [ ] Mid bass works without sub.
- [ ] Kick and sub do not fight.
- [ ] Bass has a rhythmic job.
- [ ] Bass answers or supports the drums.
- [ ] Stereo is mainly above the low range.
- [ ] Movement repeats intentionally.
- [ ] The best part survives after exporting a rough mix.

