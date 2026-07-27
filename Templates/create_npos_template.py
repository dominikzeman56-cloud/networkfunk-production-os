# NPOS Ableton Template Generator
# Run this script to create an Ableton Live project template

import os
import json
from pathlib import Path

# Template Configuration
TEMPLATE_CONFIG = {
    "tempo": 174,
    "time_signature": "4/4",
    "key": "Dm",
    "tracks": {
        "audio": [
            {"name": "Kick", "color": "#FF4444", "output": "Audio"},
            {"name": "Snare", "color": "#FF8844", "output": "Audio"},
            {"name": "Hi-Hats", "color": "#FFCC44", "output": "Audio"},
            {"name": "Percussion", "color": "#44FF44", "output": "Audio"},
        ],
        "midi": [
            {"name": "Bass Sub", "color": "#4444FF", "output": "Ext. Out 1"},
            {"name": "Bass Body", "color": "#4444CC", "output": "Ext. Out 1"},
            {"name": "Bass Modulation", "color": "#444488", "output": "Ext. Out 1"},
            {"name": "Bass Texture", "color": "#444466", "output": "Ext. Out 1"},
            {"name": "Atmosphere", "color": "#44CC44", "output": "Ext. Out 2"},
            {"name": "FX", "color": "#CC44CC", "output": "Ext. Out 2"},
            {"name": "Lead", "color": "#CC8844", "output": "Ext. Out 2"},
            {"name": "Pads", "color": "#44CCCC", "output": "Ext. Out 3"},
        ]
    },
    "returns": [
        {"name": "Reverb Short", "color": "#666666"},
        {"name": "Reverb Long", "color": "#777777"},
        {"name": "Delay", "color": "#888888"},
        {"name": "Saturation Bus", "color": "#555555"},
    ],
    "master": {"name": "Master", "color": "#FFFFFF"}
}

# Standard Effect Chains
EFFECT_CHAINS = {
    "kick": [
        {"type": "Eq8", "params": {"Band 1": {"f": 30, "g": 0, "q": 1}}},
        {"type": "Saturation", "params": {"Drive": 5}},
        {"type": "Compressor", "params": {"Ratio": 4, "Threshold": -12, "Attack": 0.1, "Release": 100}},
        {"type": "Limiter", "params": {"Threshold": -1}},
    ],
    "snare": [
        {"type": "Eq8", "params": {"Band 1": {"f": 200, "g": -3, "q": 1}}},
        {"type": "Eq8", "params": {"Band 2": {"f": 3000, "g": 3, "q": 1}}},
        {"type": "Saturation", "params": {"Drive": 10}},
        {"type": "Compressor", "params": {"Ratio": 6, "Threshold": -18, "Attack": 0.1, "Release": 80}},
    ],
    "bass_sub": [
        {"type": "Eq8", "params": {"Band 1": {"f": 20, "g": 0, "q": 1}}},
        {"type": "Limiter", "params": {"Threshold": -1}},
    ],
    "bass_body": [
        {"type": "Eq8", "params": {"Band 1": {"f": 80, "g": 0, "q": 1}}},
        {"type": "Eq8", "params": {"Band 2": {"f": 200, "g": -3, "q": 2}}},
        {"type": "Saturation", "params": {"Drive": 8}},
        {"type": "Compressor", "params": {"Ratio": 2.5, "Threshold": -15, "Attack": 10, "Release": 200}},
    ],
    "reverb_short": [
        {"type": "Reverb", "params": {"Size": 0.3, "Decay Time": 1.0, "Diffusion": 0.5, "Mix": 0.3}},
    ],
    "reverb_long": [
        {"type": "Reverb", "params": {"Size": 0.7, "Decay Time": 3.0, "Diffusion": 0.7, "Mix": 0.4}},
    ],
    "delay": [
        {"type": "PingPongDelay", "params": {"Time": "1/8", "Feedback": 0.4, "Mix": 0.3}},
    ],
    "saturation_bus": [
        {"type": "Saturation", "params": {"Drive": 5}},
        {"type": "Eq8", "params": {"Band 1": {"f": 100, "g": -2, "q": 1}}},
    ]
}

def generate_als_structure():
    """Generate Ableton Live Set structure (ALS format)"""
    # Ableton Live Set (.als) is XML-based
    # This creates a minimal valid structure

    als_template = '''<?xml version="1.0" encoding="UTF-8"?>
<AbletonProject Type="Set" Creator="Ableton",MajorVersion="6",MinorVersion="0">
    <Name>NPOS Template</Name>
    <Tempo>{tempo}</Tempo>
    <TimeSignature Numerator="4" Denominator="4"/>
    <MasterTrack>
        <TrackColor>{master_color}</TrackColor>
        <Name>{master_name}</Name>
        <DeviceChain>
            <AutoFilter>
                <Chain>
                </Chain>
            </AutoFilter>
        </DeviceChain>
    </MasterTrack>
    {tracks}
    {returns}
</AbletonProject>'''

    # Generate track structure
    audio_tracks = ""
    midi_tracks = ""
    returns = ""

    for i, track in enumerate(TEMPLATE_CONFIG["tracks"]["audio"]):
        audio_tracks += f'''
    <AudioTrack>
        <TrackColor>{track["color"]}</TrackColor>
        <Name>{track["name"]}</Name>
        <DeviceChain>
            <AudioEffect>
                <OriginalParamValues>
                </OriginalParamValues>
            </AudioEffect>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.795824"/>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </AudioTrack>'''

    for i, track in enumerate(TEMPLATE_CONFIG["tracks"]["midi"]):
        midi_tracks += f'''
    <MidiTrack>
        <TrackColor>{track["color"]}</TrackColor>
        <Name>{track["name"]}</Name>
        <DeviceChain>
            <MidiEffect>
            </MidiEffect>
            <Instrument>
            </Instrument>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.795824"/>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </MidiTrack>'''

    for i, ret in enumerate(TEMPLATE_CONFIG["returns"]):
        returns += f'''
    <ReturnTrack>
        <TrackColor>{ret["color"]}</TrackColor>
        <Name>{ret["name"]}</Name>
        <DeviceChain>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.630957"/>
            <Mute Value="0"/>
        </Mixer>
    </ReturnTrack>'''

    return als_template.format(
        tempo=TEMPLATE_CONFIG["tempo"],
        master_color=TEMPLATE_CONFIG["master"]["color"],
        master_name=TEMPLATE_CONFIG["master"]["name"],
        tracks=audio_tracks + midi_tracks,
        returns=returns
    )

def create_template_files():
    """Create template files for NPOS"""

    base_path = Path(r"D:\ObsidianVault\neurofunk-production-os\Templates\NPOS-Ableton-Template")

    # Create directory structure
    (base_path / "Project8_3").mkdir(parents=True, exist_ok=True)

    # Create Project8_3.cfg
    config_content = f"""[Project]
Version = 6.0.0
Name = NPOS Template
Tempo = {TEMPLATE_CONFIG["tempo"]}
TimeSignature = 4 4
"""

    (base_path / "Project8_3" / "Project8_3.cfg").write_text(config_content)

    # Create template manifest
    manifest_content = json.dumps({
        "schema_version": "6.0.0",
        "tempo": TEMPLATE_CONFIG["tempo"],
        "time_signature": {"numerator": 4, "denominator": 4},
        "tracks": TEMPLATE_CONFIG["tracks"],
        "returns": TEMPLATE_CONFIG["returns"],
        "effects": EFFECT_CHAINS
    }, indent=2)

    (base_path / "manifest.json").write_text(manifest_content)

    # Generate ALS structure
    als_content = generate_als_structure()
    (base_path / "Project8_3" / "Session.als").write_text(als_content)

    # Create README with setup instructions
    readme_content = f"""# NPOS Ableton Template

## Quick Setup

1. Open Ableton Live 10+
2. File > Open Folder > Select "NPOS-Ableton-Template" folder
3. Use "Session.als"

## Template Settings

- **Tempo:** {TEMPLATE_CONFIG["tempo"]} BPM
- **Time Signature:** 4/4
- **Key:** {TEMPLATE_CONFIG["key"]}

## Track Layout

### Audio Tracks
"""
    for i, track in enumerate(TEMPLATE_CONFIG["tracks"]["audio"]):
        readme_content += f"- Track {i+1}: {track['name']}\n"

    readme_content += """
### MIDI Tracks
"""
    for i, track in enumerate(TEMPLATE_CONFIG["tracks"]["midi"]):
        readme_content += f"- Track {i+1}: {track['name']}\n"

    readme_content += """
### Returns
"""
    for i, ret in enumerate(TEMPLATE_CONFIG["returns"]):
        readme_content += f"- Return {i+1}: {ret['name']}\n"

    readme_content += """
## Standard Effect Chains

### Kick
1. EQ8 - Cut mud, boost presence
2. Saturation - 5% drive
3. Compressor - 4:1, fast attack, 100ms release
4. Limiter - -1dB ceiling

### Snare
1. EQ8 - Cut boxiness, boost crack
2. Saturation - 10% drive
3. Compressor - 6:1, fast attack, 80ms release

### Bass Sub
1. EQ8 - High-pass below 30Hz
2. Limiter - -1dB ceiling

### Bass Body
1. EQ8 - Cut 200Hz, boost presence
2. Saturation - 8% drive
3. Compressor - 2.5:1, 10ms attack, 200ms release

### Reverb Short
- Size: 0.3, Decay: 1s, Mix: 30%

### Reverb Long
- Size: 0.7, Decay: 3s, Mix: 40%

### Delay
- Time: 1/8, Feedback: 40%, Mix: 30%
"""

    (base_path / "README.md").write_text(readme_content)

    print(f"Template created at: {base_path}")
    print("\nFiles created:")
    print(f"  - {base_path / 'manifest.json'}")
    print(f"  - {base_path / 'Project8_3' / 'Session.als'}")
    print(f"  - {base_path / 'Project8_3' / 'Project8_3.cfg'}")
    print(f"  - {base_path / 'README.md'}")

if __name__ == "__main__":
    create_template_files()