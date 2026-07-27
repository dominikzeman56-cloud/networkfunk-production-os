# Mix Systems

Purpose: handle low end, stereo, dynamics, loudness, and mastering as production decisions.

## Mix Philosophy

Mix during production, but do not pretend the first balance is the final mix.

The goal is translation:

- club systems
- headphones
- small speakers
- mono checks
- reference comparison

## Low End Architecture

```text
Kick
  -> transient and punch

Sub
  -> mono weight

Mid bass
  -> character and movement

Sidechain / envelope
  -> relationship between kick and bass
```

Rules of thumb:

- Keep sub mono.
- Keep sub processing minimal.
- Put most distortion and stereo movement in mid bass, not sub.
- Check kick-sub phase and envelope before adding loudness.
- Do not use exact frequency rules as dogma; verify in the track.

## Stereo Management

Guidelines:

| Range | Approach |
|---|---|
| Sub lows | mono and stable |
| Low mids | cautious width, frequent mono checks |
| Midrange | controlled width and motion |
| High mids / highs | wider textures, air, FX, noise |

Watch correlation, but use ears and mono checks. A meter is a warning system, not a final judge.

## Dynamics And Loudness

Use confidence labels for metrics:

| Metric | Confidence | Notes |
|---|---|---|
| Peak | High | Directly measurable. |
| RMS / LUFS | High | Useful when measured over comparable sections. |
| Crest factor | High | Compare drop to drop, not full track to drop. |
| Stereo width | Medium to High | Depends on measurement method. |
| Transient quality | Medium | Measurable partly, judged by ear. |
| Punch | Medium | Needs listening context. |
| Key/chords from full mix | Low to Medium | Can be ambiguous in dense bass music. |

## Mastering

Mastering should reveal whether the mix is ready. It should not rescue a confused arrangement.

Pre-master checklist:

- [ ] Reference is level matched.
- [ ] Drop has enough contrast before limiting.
- [ ] Sub is stable.
- [ ] Kick and snare survive limiter preview.
- [ ] Stereo image does not collapse in mono.
- [ ] Harshness is solved before final loudness.

## Common Fix Order

```text
Arrangement problem
  -> fix arrangement

Sound choice problem
  -> replace or redesign sound

Frequency masking
  -> EQ, envelope, or octave decision

Dynamic conflict
  -> sidechain, clipping, compression, transient shaping

Only then
  -> bus processing or mastering
```

