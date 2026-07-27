# Reference Analysis

Purpose: analyze reference tracks in a repeatable way and convert them into usable production decisions.

## Metadata

Every case study must start with:

```text
Track:
Artist:
Original artist:
Analyzed version:
Producer / remix producer:
Label:
Year:
Tempo:
Key:
Length:
Source:
Confidence:
```

For remixes, separate original authorship from the analyzed production. Example:

- Original track: Zombie Cats - Fade Out
- Analyzed version: Audio Remix
- Production decisions attributed primarily to: Audio

## Analysis Flow

```text
Reference track
  -> structure
  -> energy graph
  -> drums
  -> bass archetype
  -> low-end relationship
  -> stereo strategy
  -> dynamics
  -> transitions
  -> production decisions
  -> lessons for the user's track
```

## Structure

Mark:

- intro
- build
- drop A
- variation
- breakdown
- second build
- drop B
- outro

Do not force every track into the same arrangement. Use the actual timeline.

## Energy Graph

Describe energy through:

- density
- loudness
- drum activity
- bass motion
- automation
- contrast
- silence or negative space

Use measured values only when audio analysis has been performed. Otherwise label the graph as estimated.

## Bass Classification

```text
Is movement mostly synced, phrase-shaped, and filter/FM driven?
  -> Growl or tech growl

Is movement mostly detune, beating, phasing, and sustained width?
  -> Reese

Is it a reese body with growl articulation?
  -> Hybrid

Is the line simple, repetitive, and club-forward?
  -> Roller / neurobounce
```

## Confidence Rules

| Claim Type | Confidence |
|---|---|
| File duration, peak, RMS, LUFS, rough tempo | High when measured. |
| Drop section metrics | High only when section boundaries are known. |
| Stereo width and spectral balance | Medium to High depending on tools. |
| Bass synthesis method from audio only | Medium at best. |
| Exact plugin chain from audio only | Low unless source material confirms it. |
| Artist intention | Low unless quoted from a reliable source. |

## Output Template

```text
Summary:

Measured:

Estimated:

Hypotheses:

Production decisions:

What to borrow:

What not to copy blindly:

Ableton actions:
```

