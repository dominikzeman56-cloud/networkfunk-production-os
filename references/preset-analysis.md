# Preset Analysis

Purpose: extract reusable sound-design principles from preset files without reducing the value to copying presets.

## Core Rule

Preset analysis is not about using someone else's preset. It is about identifying repeatable synthesis, routing, modulation, and processing patterns.

## Supported Sources

- Xfer Serum `.fxp` / `.fxb`
- Phase Plant presets
- Vital presets
- Ableton racks and projects
- Plugin-specific preset files when parsable

If a format is binary or partially opaque, extract what can be verified and label unknowns clearly.

## Analysis Schema

```text
Preset:
Producer / pack:
Plugin:
Category:
File size:
Embedded wavetable/sample suspected:
Parser confidence:

Oscillators:
Filters:
Routing:
Modulation:
FX:
Macros:
Stereo strategy:
Low-end strategy:
Notable design choices:
Reusable principles:
Unknown / not parsable:
```

## Serum Focus

Look for:

- oscillator count
- wavetable names when readable
- unison / detune tendencies
- warp mode, FM, sync, bend, remap
- filter type and routing
- LFO count and shapes
- envelope use
- modulation matrix patterns
- FX order
- macro targets
- user wavetable or sample data indicators

## Phase Plant Focus

Look for:

- generator layout
- lane architecture
- snapins and order
- modulation sources
- multipass or multiband logic
- feedback, distortion, disperser, comb, filters
- macro design
- gain staging inside the patch

## Pattern Extraction

After several presets from the same producer or pack, summarize:

| Pattern | Count | Confidence | Notes |
|---|---:|---|---|
| FM before distortion |  |  |  |
| Band reject or comb filtering |  |  |  |
| Multiband compression |  |  |  |
| Macro mapped to cutoff |  |  |  |
| Separate sub layer |  |  |  |

## Aggressor Bunx Initial Notes

Initial test files from an Aggressor Bunx Serum pack were identified as real Serum `.fxp` presets. One file was much larger than the others, suggesting possible embedded custom wavetable or extra binary data.

Known preset names from the initial sample:

- `AB_VOL30_BASS_7`
- `AB_VOL30_BASS_5`
- `AB_VOL30_BASS_LEAD_1`
- `AB_VOL30_BASS_LEAD_9`

This is not enough to define an Aggressor Bunx sound-design genome yet. Treat it as the beginning of a preset database.

## Output Goal

Each preset should produce:

- one short technical summary
- one list of verified findings
- one list of hypotheses
- one or more reusable production principles
- one Ableton or synth recreation path

