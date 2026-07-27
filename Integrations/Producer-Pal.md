# Producer Pal Integration

## Overview
Producer Pal connects Ableton sessions to NPOS for automatic knowledge extraction.

## Data Flow
```
Ableton Live (Producer Pal running)
      ↓ export JSON
Claude Code
      ↓ analyze + transform
NPOS Knowledge Base
      ↓ update documents
Linked knowledge objects
```

## Producer Pal Output Format

```json
{
  "session": {
    "name": "track-name",
    "bpm": 172,
    "key": "F minor",
    "date": "2026-07-26"
  },
  "tracks": [
    {
      "name": "Bass",
      "type": "audio|midi",
      "groups": ["Reese", "Sub", "Growl"],
      "plugins": ["Serum", "Pro-Q3", "KClip"],
      "routing": "serial|parallel",
      "automation": ["filter cutoff", "distortion drive"]
    }
  ],
  "mix": {
    "frequency_map": {"sub": 30, "bass": 60, "mid": 200},
    "stereo_image": {"bass_mono": true, "highs_wide": true},
    "dynamics": {"crest_factor": 5.2, "compression_ratio": "4:1"}
  },
  "decisions": [
    {"what": "removed layer", "why": "muddiness", "result": "clarity improved"}
  ]
}
```

## Claude Analysis Prompts

### Track Analysis
```
Analyze this Producer Pal output against NPOS frameworks:
1. Compare mix to Reference Analysis Framework
2. Extract engineering decisions
3. Identify troubleshooting opportunities
4. Link to relevant Producer Knowledge
5. Generate action items
```

### Session Summary
```
Create session summary:
1. What was the goal?
2. What worked?
3. What failed?
4. What was learned?
5. Links to related knowledge
```

## Integration Points

| Producer Pal Data | NPOS Location |
|-------------------|---------------|
| Mix frequency map | [[Knowledge/Low-End-System]] |
| Stereo decisions | [[Knowledge/Stereo]] |
| Dynamics settings | [[Knowledge/Dynamics]] |
| Automation patterns | [[Knowledge/Automation]] |
| Bass decisions | [[Knowledge/Bass-Engineering]] |
| Drum patterns | [[Knowledge/Drum-Engineering]] |

## Session End Workflow

1. Export session data from Producer Pal (JSON)
2. Paste to Claude
3. Run analysis prompt
4. Generate NPOS updates
5. Write to session notes
6. Link to existing knowledge