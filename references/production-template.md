# Production Template

Purpose: define an Ableton project structure that makes starting new neurofunk tracks fast, repeatable, and easy to review with NPOS.

## Template Principle

The template is not only a set of tracks. It is the physical version of the workflow:

1. reference
2. idea capture
3. drums
4. sub
5. bass design
6. musical layers
7. atmospheres
8. FX and transitions
9. automation
10. resampling
11. premaster and export

Each track or group must answer: "What job does this do?"

## Recommended Ableton Groups

| Group | Purpose |
|---|---|
| `00_REFERENCE` | Reference tracks, level matched, routed outside premaster processing. |
| `01_BUILD_SHEET` | Notes, session goals, arrangement markers, project status. |
| `02_IDEAS` | MIDI sketches, motifs, temporary clips, scratch resamples. |
| `03_DRUMS` | Kick, snare, hats, percussion, ghosts, fills, drum bus. |
| `04_SUB` | Mono sub layers and kick-sub relationship checks. |
| `05_BASS` | Main mid bass, counter bass, resampling tracks, printed variations. |
| `06_LEADS_SYNTHS` | Hooks, stabs, harmonic layers, call-and-response elements. |
| `07_ATMOS` | Pads, drones, noise beds, tonal space. |
| `08_FX` | Impacts, risers, downlifters, reverses, fills, transitions. |
| `09_VOCALS` | Vocal chops, phrases, shouts, treated hooks. |
| `10_AUTOMATION` | Printed automation passes, macro movement, filter rides. |
| `11_RESAMPLE` | Dedicated audio capture tracks for bass, drums, FX, and full drop prints. |
| `12_PREMASTER` | Mix bus, meters, export routing, safety limiter if needed. |

## Track Naming

Use numbered names to keep large projects readable:

- `DRM_Kick_Main`
- `DRM_Snare_Body`
- `DRM_Snare_Transient`
- `SUB_Main_Mono`
- `BASS_Growl_MIDI`
- `BASS_Growl_Print`
- `BASS_Reese_Texture`
- `FX_Impact_Drop`
- `AUTO_Filter_Ride`

## Default Routing

```text
Tracks
  -> group bus
  -> premaster
  -> master

References
  -> reference out or master bypass

Resample tracks
  -> muted by default
  -> armed only when printing
```

## Daily Session Dashboard

Every project should include a short dashboard in the build sheet:

```text
Today:
[ ] Build groove
[ ] Design main bass
[ ] Arrange Drop A
[ ] Add transition into drop
[ ] Print reference export

Do not touch today:
[ ] mastering
[ ] tiny mix details
[ ] new plugin rabbit holes
```

## Template Modes

### Idea Mode

Use when starting cold.

- Keep only drums, sub, one bass lane, one musical hook, one FX lane.
- Do not open the full mix chain.
- Export rough loops quickly.

### Design Mode

Use when creating basses, drums, or FX.

- MIDI source track.
- Processing track.
- Resample print track.
- Variation rack or clip lanes.

### Arrangement Mode

Use when the loop works.

- Create markers first.
- Duplicate energy, not complexity.
- Print temporary full-drop audio to judge structure quickly.

### Mix Mode

Use after the arrangement communicates the idea.

- Clean routing.
- Disable unused design tracks.
- Check sub mono, kick-sub relationship, drum transient, bass midrange, stereo width, and reference level.

## Ableton Template Checklist

- [ ] Reference routing bypasses premaster processing.
- [ ] Build sheet is visible and editable.
- [ ] Drum group has kick, snare, hats, percussion, ghosts, fills.
- [ ] Sub has mono utility and simple level control.
- [ ] Bass group has MIDI, processing, and print lanes.
- [ ] Resampling tracks are ready and muted.
- [ ] Premaster has meters before any limiter.
- [ ] Export markers exist.
- [ ] Default project opens without visual or routing clutter.

