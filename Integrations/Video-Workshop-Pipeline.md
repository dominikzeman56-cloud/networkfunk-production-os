# Video Workshop Summarization Pipeline

## Video Location
`D:\ObsidianVault\Hudební produkce\workshop videos`

## Workflow

### Step 1: Audio Extraction
```
ffmpeg -i video.mp4 -vn -acodec pcm_s16le audio.wav
```

### Step 2: Transcribe (Local Whisper)
```
whisper audio.wav --model base --language English --output_format txt
```

### Step 3: LLM Summarization

**Prompt:**
```
Extract from this transcript:
1. Key sound design techniques
2. Parameter philosophies
3. Mixing decisions
4. Arrangement insights
5. Producer philosophy
6. Reference track mentions

Format as NPOS knowledge object with links.
```

### Step 4: NPOS Document Creation

## Output Template

```markdown
# [Workshop Title]

**Instructor:** [Name]
**Platform:** [Where from]
**Duration:** [Time]
**Date Processed:** 2026-07-26

## Key Techniques
1. [Technique with context]

## Sound Design Insights
- [Insight]

## Mixing Decisions
- [Decision with parameters]

## Arrangement Principles
- [Principle]

## Reference Tracks
- [Track names]

## Related Knowledge
- [[Knowledge/Bass-Engineering]]
- [[Presets/Serum/...]]
- [[Producer-Knowledge/...]]

## Action Items
- [ ] Apply technique
- [ ] Create preset
- [ ] Add to workflow
```

## Quick Command

```powershell
# Extract audio and transcribe
ffmpeg -i "path\to\video.mp4" -vn -acodec pcm_s16le -ar 16000 "audio.wav"
whisper audio.wav --model base --output_format srt
```

## Organization

Store summaries in:
- `D:\ObsidianVault\networkfunk-production-os\Workshops\[Instructor]\[Title].md`