"""
NPOS Visual Serum Preset Analyzer
Parse Serum .fxp presets, visualize oscillator routing, filter curves, modulation maps.
"""

import io
import struct
from typing import Dict, List, Optional, Tuple
import streamlit as st
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import numpy as np
import pandas as pd

from . import OscillatorState, FilterState, ModAssignment, SerumPreset

# ── Serum .fxp Binary Parser ─────────────────────────────────────────────────

SERUM_WAVE_SHAPES = {
    0: "Saw",
    1: "Sine",
    2: "Square",
    3: "Triangle",
    4: "Noise",
    5: "Saw+Square",
    6: "Saw+Triangle",
    7: "Sine+Triangle",
    8: "Dual Saw",
    9: "Dual Sine",
    10: "Dual Square",
    11: "Dual Triangle",
    12: "Hyper Saw",
    13: "Hyper Sine",
    14: "Hyper Square",
    15: "Hyper Triangle",
    16: "Wavetable",
}

SERUM_FILTER_TYPES = {
    0: "Low Pass 12dB",
    1: "Low Pass 24dB",
    2: "High Pass 12dB",
    3: "High Pass 24dB",
    4: "Band Pass 12dB",
    5: "Band Pass 24dB",
    6: "Notch 12dB",
    7: "Notch 24dB",
    8: "All Pass",
    9: "Comb +",
    10: "Comb -",
    11: "MG Low 12dB",
    12: "MG Low 24dB",
    13: "MG High 12dB",
    14: "MG High 24dB",
    15: "Phaser",
}

SERUM_FX_CHAIN = [
    "Distortion", "Compressor", "EQ", "Flanger", "Phaser",
    "Chorus", "Reverb", "Delay", "Dimension Expander", "Hyper/Dimension",
]


def parse_serum_fxp(file_bytes: bytes) -> SerumPreset:
    """
    Parse Serum .fxp preset binary format.
    Falls back to a mock structural analyzer if parsing fails.
    """
    try:
        return _parse_fxp_binary(file_bytes)
    except Exception as e:
        st.warning(f"Binary parsing failed ({e}), using structural analyzer.")
        return _analyze_serum_structure(file_bytes)


def _parse_fxp_binary(data: bytes) -> SerumPreset:
    """
    Attempt to parse the Serum .fxp binary format.
    Serum uses a proprietary binary format; this extracts what we can.
    """
    # .fxp files start with a 4-byte magic: 'CcnK'
    if len(data) < 4 or data[:4] != b'CcnK':
        raise ValueError("Not a valid .fxp file (missing CcnK magic)")

    # Parse the FXP chunk header
    # 4 bytes: magic 'CcnK'
    # 4 bytes: chunk size (big-endian)
    # 4 bytes: fx magic 'FxCk'
    # 4 bytes: version
    # 4 bytes: plugin ID (Xfer Serum = 'XfsS' or similar)
    # Rest is the actual preset data
    chunk_size = struct.unpack('>I', data[4:8])[0]
    fx_magic = data[8:12]
    version = struct.unpack('>I', data[12:16])[0]
    plugin_id = data[16:20]

    # The rest is the Serum-specific preset data
    preset_data = data[20:]

    # Try to extract preset name from the data
    name = _extract_serum_name(preset_data)

    # Parse oscillator states from binary
    osc_a = _parse_oscillator(preset_data, 0, "A")
    osc_b = _parse_oscillator(preset_data, 1, "B")

    # Parse filter state
    filter_state = _parse_filter(preset_data)

    # Parse modulations
    modulations = _parse_modulations(preset_data)

    # Parse FX chain
    fx_chain = _parse_fx_chain(preset_data)

    return SerumPreset(
        name=name,
        category="Imported",
        oscillators={"A": osc_a, "B": osc_b},
        filter=filter_state,
        modulations=modulations,
        fx_chain=fx_chain,
    )


def _extract_serum_name(data: bytes) -> str:
    """Try to extract the preset name from binary data."""
    # Look for null-terminated strings that look like names
    try:
        # Try to find a readable string at the beginning
        text = data.decode('utf-8', errors='ignore')
        # Find first alphanumeric sequence that looks like a name
        import re
        matches = re.findall(r'[A-Za-z0-9 _\-]{3,40}', text)
        if matches:
            return matches[0].strip()
    except:
        pass
    return "Unknown Preset"


def _parse_oscillator(data: bytes, idx: int, name: str) -> OscillatorState:
    """Parse oscillator state from binary data at given index offset."""
    # Serum stores oscillator params at specific offsets
    # These are approximate offsets based on common Serum binary structure
    base = idx * 256  # each oscillator block is ~256 bytes

    def _read_float(offset: int, default: float = 0.0) -> float:
        pos = base + offset
        if pos + 4 <= len(data):
            try:
                return struct.unpack('<f', data[pos:pos+4])[0]
            except:
                pass
        return default

    def _read_int(offset: int, default: int = 0) -> int:
        pos = base + offset
        if pos + 4 <= len(data):
            try:
                return struct.unpack('<I', data[pos:pos+4])[0]
            except:
                pass
        return default

    wave_idx = _read_int(0x00)
    wave_shape = SERUM_WAVE_SHAPES.get(wave_idx, f"Custom ({wave_idx})")
    enabled = _read_float(0x10, 1.0) > 0.5
    unison = int(_read_float(0x20, 1.0))
    detune = _read_float(0x30, 0.0)
    octave = int(_read_float(0x40, 0.0))
    semi = int(_read_float(0x50, 0.0))
    fine = int(_read_float(0x60, 0.0))
    pan = _read_float(0x70, 0.0)
    level = _read_float(0x80, 0.8)

    return OscillatorState(
        name=name,
        enabled=enabled,
        wave_shape=wave_shape,
        unison=max(1, min(16, unison)),
        detune=round(detune, 2),
        octave=max(-3, min(3, octave)),
        semi=max(-12, min(12, semi)),
        fine=max(-100, min(100, fine)),
        pan=round(pan, 2),
        level=round(level, 2),
    )


def _parse_filter(data: bytes) -> FilterState:
    """Parse filter state from binary data."""
    def _read_float(offset: int, default: float = 0.0) -> float:
        if offset + 4 <= len(data):
            try:
                return struct.unpack('<f', data[offset:offset+4])[0]
            except:
                pass
        return default

    def _read_int(offset: int, default: int = 0) -> int:
        if offset + 4 <= len(data):
            try:
                return struct.unpack('<I', data[offset:offset+4])[0]
            except:
                pass
        return default

    # Filter block typically starts after oscillator blocks
    filter_offset = 512
    filter_type_idx = _read_int(filter_offset + 0x00)
    filter_type = SERUM_FILTER_TYPES.get(filter_type_idx, f"Unknown ({filter_type_idx})")
    enabled = _read_float(filter_offset + 0x10, 1.0) > 0.5
    cutoff = _read_float(filter_offset + 0x20, 100.0)
    resonance = _read_float(filter_offset + 0x30, 0.0)
    drive = _read_float(filter_offset + 0x40, 0.0)
    mix = _read_float(filter_offset + 0x50, 1.0)

    return FilterState(
        enabled=enabled,
        filter_type=filter_type,
        cutoff=round(cutoff, 1),
        resonance=round(resonance, 1),
        drive=round(drive, 1),
        mix=round(mix, 1),
    )


def _parse_modulations(data: bytes) -> List[ModAssignment]:
    """Parse modulation assignments from binary data."""
    modulations = []
    mod_sources = ["LFO 1", "LFO 2", "Env 1", "Env 2", "Macro 1", "Macro 2", "Macro 3", "Macro 4"]
    mod_destinations = [
        "Osc A Detune", "Osc B Detune", "Osc A Level", "Osc B Level",
        "Filter Cutoff", "Filter Resonance", "Filter Drive", "Filter Mix",
        "FX Mix", "Volume", "Pan", "Pitch",
    ]

    # Modulation block typically starts after filter block
    mod_offset = 768
    for i in range(12):  # Serum has up to 12 modulation slots
        slot_offset = mod_offset + i * 32
        if slot_offset + 12 > len(data):
            break
        try:
            source_idx = struct.unpack('<I', data[slot_offset:slot_offset+4])[0] % len(mod_sources)
            dest_idx = struct.unpack('<I', data[slot_offset+4:slot_offset+8])[0] % len(mod_destinations)
            amount = struct.unpack('<f', data[slot_offset+8:slot_offset+12])[0]
            bipolar = amount > 0.5 or amount < -0.5

            if abs(amount) > 0.01:  # Only include active modulations
                modulations.append(ModAssignment(
                    source=mod_sources[source_idx],
                    destination=mod_destinations[dest_idx],
                    amount=round(amount * 100, 1),
                    bipolar=bipolar,
                ))
        except:
            break

    return modulations


def _parse_fx_chain(data: bytes) -> List[str]:
    """Parse FX chain from binary data."""
    fx_chain = []
    fx_offset = 1152  # FX block typically after modulation block

    for i, fx_name in enumerate(SERUM_FX_CHAIN):
        slot_offset = fx_offset + i * 16
        if slot_offset + 4 > len(data):
            break
        try:
            enabled = struct.unpack('<f', data[slot_offset:slot_offset+4])[0] > 0.5
            if enabled:
                fx_chain.append(fx_name)
        except:
            break

    return fx_chain


def _analyze_serum_structure(data: bytes) -> SerumPreset:
    """
    Fallback structural analyzer when binary parsing fails.
    Extracts what information it can from the raw bytes.
    """
    # Try to find readable strings that might be parameter names
    try:
        text = data.decode('latin-1', errors='ignore')
    except:
        text = ""

    # Count occurrences of common Serum parameter patterns
    osc_a = OscillatorState(
        name="A",
        enabled=True,
        wave_shape="Wavetable" if b'wavetable' in data.lower() else "Saw",
        unison=2 if b'unison' in data.lower() else 1,
        detune=5.0 if b'detune' in data.lower() else 0.0,
        octave=0,
        semi=0,
        fine=0,
        pan=0.0,
        level=0.8,
    )

    osc_b = OscillatorState(
        name="B",
        enabled=True,
        wave_shape="Wavetable" if b'wavetable' in data.lower() else "Sine",
        unison=1,
        detune=0.0,
        octave=0,
        semi=0,
        fine=0,
        pan=0.0,
        level=0.8,
    )

    filter_state = FilterState(
        enabled=True,
        filter_type="Low Pass 24dB",
        cutoff=100.0,
        resonance=0.0,
        drive=0.0,
        mix=1.0,
    )

    return SerumPreset(
        name="Analyzed Preset",
        category="Analyzed",
        oscillators={"A": osc_a, "B": osc_b},
        filter=filter_state,
        modulations=[],
        fx_chain=[],
    )


# ── Visualization Functions ──────────────────────────────────────────────────

def render_oscillator_routing(preset: SerumPreset):
    """Render interactive block/routing diagrams using streamlit/plotly."""
    st.subheader("🔀 Oscillator Routing")

    # Create a flow diagram using plotly
    fig = go.Figure()

    # Oscillator A
    osc_a = preset.oscillators.get("A", None)
    osc_b = preset.oscillators.get("B", None)

    # Draw oscillator blocks
    y_positions = []
    labels = []

    if osc_a and osc_a.enabled:
        y_positions.append(0.3)
        labels.append(
            f"Osc A: {osc_a.wave_shape}<br>"
            f"Unison: {osc_a.unison} | Detune: {osc_a.detune} Hz<br>"
            f"Oct: {osc_a.octave} | Semi: {osc_a.semi} | Fine: {osc_a.fine}¢<br>"
            f"Pan: {osc_a.pan:.0%} | Level: {osc_a.level:.0%}"
        )

    if osc_b and osc_b.enabled:
        y_positions.append(-0.3)
        labels.append(
            f"Osc B: {osc_b.wave_shape}<br>"
            f"Unison: {osc_b.unison} | Detune: {osc_b.detune} Hz<br>"
            f"Oct: {osc_b.octave} | Semi: {osc_b.semi} | Fine: {osc_b.fine}¢<br>"
            f"Pan: {osc_b.pan:.0%} | Level: {osc_b.level:.0%}"
        )

    # Add oscillator nodes
    for i, (y, label) in enumerate(zip(y_positions, labels)):
        fig.add_trace(go.Scatter(
            x=[0],
            y=[y],
            mode="markers+text",
            marker=dict(size=60, color="#10b981", symbol="square"),
            text=label,
            textposition="middle center",
            textfont=dict(size=9, color="white"),
            name=f"Oscillator {['A', 'B'][i] if i < 2 else ''}",
            hoverinfo="text",
        ))

    # Add filter node
    filter_y = 0.0
    filter_label = (
        f"Filter: {preset.filter.filter_type}<br>"
        f"Cutoff: {preset.filter.cutoff:.0f} Hz | Res: {preset.filter.resonance:.0%}<br>"
        f"Drive: {preset.filter.drive:.0%} | Mix: {preset.filter.mix:.0%}"
    )
    fig.add_trace(go.Scatter(
        x=[1],
        y=[filter_y],
        mode="markers+text",
        marker=dict(size=50, color="#f59e0b", symbol="diamond"),
        text=filter_label,
        textposition="middle center",
        textfont=dict(size=9, color="white"),
        name="Filter",
        hoverinfo="text",
    ))

    # Add output node
    fig.add_trace(go.Scatter(
        x=[2],
        y=[0],
        mode="markers+text",
        marker=dict(size=40, color="#ef4444", symbol="circle"),
        text="Output",
        textposition="middle center",
        textfont=dict(size=10, color="white", weight="bold"),
        name="Output",
    ))

    # Draw connection arrows
    for y in y_positions:
        fig.add_annotation(
            x=0.5, y=y,
            xref="x", yref="y",
            ax=0.15, ay=y,
            axref="x", ayref="y",
            showarrow=True,
            arrowhead=2,
            arrowsize=1.5,
            arrowwidth=2,
            arrowcolor="#6b7280",
        )

    fig.add_annotation(
        x=1.5, y=filter_y,
        xref="x", yref="y",
        ax=1.15, ay=filter_y,
        axref="x", ayref="y",
        showarrow=True,
        arrowhead=2,
        arrowsize=1.5,
        arrowwidth=2,
        arrowcolor="#6b7280",
    )

    fig.update_layout(
        title="Signal Flow Diagram",
        showlegend=False,
        height=400,
        template="plotly_dark",
        xaxis=dict(showgrid=False, zeroline=False, visible=False, range=[-0.5, 2.5]),
        yaxis=dict(showgrid=False, zeroline=False, visible=False, range=[-0.8, 0.8]),
        margin=dict(l=20, r=20, t=40, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)

    # Oscillator detail cards
    col1, col2 = st.columns(2)
    for col, osc_name in zip([col1, col2], ["A", "B"]):
        osc = preset.oscillators.get(osc_name)
        if osc and osc.enabled:
            with col:
                st.markdown(f"""
                **Oscillator {osc_name}** — `{osc.wave_shape}`
                - Unison: **{osc.unison}** | Detune: **{osc.detune} Hz**
                - Octave: **{osc.octave}** | Semi: **{osc.semi}** | Fine: **{osc.fine}¢**
                - Pan: **{osc.pan:.0%}** | Level: **{osc.level:.0%}**
                """)


def render_filter_curve(filter_state: FilterState):
    """Generate a visual filter response curve graph using matplotlib/numpy."""
    st.subheader("📈 Filter Response Curve")

    if not filter_state.enabled:
        st.info("Filter is disabled.")
        return

    # Generate frequency range (20 Hz - 20 kHz)
    freqs = np.logspace(np.log10(20), np.log10(20000), 1000)
    cutoff = max(20, min(20000, filter_state.cutoff))
    resonance = max(0, min(1, filter_state.resonance))

    # Calculate filter response based on type
    if "Low Pass" in filter_state.filter_type:
        # Simple 1-pole low pass approximation
        response = 1.0 / np.sqrt(1 + (freqs / cutoff) ** 2)
        slope_db = -12 if "12dB" in filter_state.filter_type else -24
    elif "High Pass" in filter_state.filter_type:
        response = 1.0 / np.sqrt(1 + (cutoff / freqs) ** 2)
        slope_db = -12 if "12dB" in filter_state.filter_type else -24
    elif "Band Pass" in filter_state.filter_type:
        response = (freqs / cutoff) / np.sqrt(1 + (freqs / cutoff) ** 2) ** 2
        slope_db = -12
    elif "Notch" in filter_state.filter_type:
        response = np.abs(1 - (freqs / cutoff) ** 2) / np.sqrt(1 + (freqs / cutoff) ** 2)
        slope_db = -12
    else:
        response = np.ones_like(freqs)
        slope_db = 0

    # Apply resonance peak
    if resonance > 0:
        peak_gain = 1 + resonance * 10
        resonance_q = 1 / (1 - resonance * 0.9 + 0.1)
        resonance_peak = peak_gain / (1 + ((freqs / cutoff) - (cutoff / freqs)) ** 2 * resonance_q)
        response = response * resonance_peak

    # Convert to dB
    response_db = 20 * np.log10(np.clip(response, 1e-6, 1.0))

    # Create plot
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.semilogx(freqs, response_db, color="#10b981", linewidth=2)
    ax.axvline(x=cutoff, color="#f59e0b", linestyle="--", alpha=0.7, label=f"Cutoff: {cutoff:.0f} Hz")
    ax.axhline(y=-3, color="#ef4444", linestyle=":", alpha=0.5, label="-3 dB point")

    ax.set_xlabel("Frequency (Hz)", color="white")
    ax.set_ylabel("Gain (dB)", color="white")
    ax.set_title(f"Filter Response: {filter_state.filter_type}", color="white", fontsize=14)
    ax.set_xlim(20, 20000)
    ax.set_ylim(-60, 5)
    ax.grid(True, alpha=0.3)
    ax.legend(loc="lower left", facecolor="#1f2937", edgecolor="none", labelcolor="white")
    ax.set_facecolor("#0f172a")
    fig.patch.set_facecolor("#0f172a")
    ax.tick_params(colors="white")

    st.pyplot(fig)

    # Filter specs
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Type", filter_state.filter_type)
    with col2:
        st.metric("Cutoff", f"{filter_state.cutoff:.0f} Hz")
    with col3:
        st.metric("Resonance", f"{filter_state.resonance:.0%}")
    with col4:
        st.metric("Drive", f"{filter_state.drive:.0%}")


def render_macro_assignments(preset: SerumPreset):
    """Render macro assignments using streamlit."""
    st.subheader("🎛 Macro Assignments")

    macros = [m for m in preset.modulations if m.source.startswith("Macro")]
    if not macros:
        st.info("No macro assignments found.")
        return

    data = {
        "Macro": [m.source for m in macros],
        "Destination": [m.destination for m in macros],
        "Amount": [f"{m.amount:+.1f}%" for m in macros],
        "Bipolar": ["✓" if m.bipolar else "—" for m in macros],
    }
    st.dataframe(pd.DataFrame(data), use_container_width=True, hide_index=True)


def render_modulation_map(preset: SerumPreset):
    """Render modulation map using streamlit."""
    st.subheader("🔗 Modulation Matrix")

    if not preset.modulations:
        st.info("No modulation assignments found.")
        return

    # Group by source
    sources = {}
    for mod in preset.modulations:
        if mod.source not in sources:
            sources[mod.source] = []
        sources[mod.source].append(mod)

    for source, mods in sources.items():
        with st.expander(f"**{source}** ({len(mods)} assignments)", expanded=True):
            data = {
                "Destination": [m.destination for m in mods],
                "Amount": [f"{m.amount:+.1f}%" for m in mods],
                "Bipolar": ["✓" if m.bipolar else "—" for m in mods],
            }
            st.dataframe(pd.DataFrame(data), use_container_width=True, hide_index=True)


# ── Main UI ──────────────────────────────────────────────────────────────────

def main():
    """Main entry point for the Visual Serum Preset Analyzer."""
    st.title("🎛 Visual Serum Preset Analyzer")
    st.markdown("---")

    # File upload
    uploaded_file = st.file_uploader(
        "Upload Serum Preset (.fxp)",
        type=["fxp"],
        help="Drag and drop a Serum .fxp preset file to analyze",
    )

    if uploaded_file is not None:
        file_bytes = uploaded_file.read()
        preset = parse_serum_fxp(file_bytes)

        # Preset info header
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Preset Name", preset.name)
        with col2:
            st.metric("Category", preset.category)
        with col3:
            active_mods = len(preset.modulations)
            st.metric("Modulations", active_mods)

        # FX Chain
        if preset.fx_chain:
            st.write("**FX Chain:** " + " → ".join(f"`{fx}`" for fx in preset.fx_chain))
        else:
            st.write("**FX Chain:** (none detected)")

        st.markdown("---")

        # Tabs for different views
        tab1, tab2, tab3, tab4 = st.tabs([
            "🔀 Oscillator Routing",
            "📈 Filter Curve",
            "🎛 Macros",
            "🔗 Modulation Matrix",
        ])

        with tab1:
            render_oscillator_routing(preset)
        with tab2:
            render_filter_curve(preset.filter)
        with tab3:
            render_macro_assignments(preset)
        with tab4:
            render_modulation_map(preset)

    else:
        # Show demo with mock preset
        st.info("Upload a Serum .fxp file to analyze, or view a demo below.")

        if st.button("Show Demo Preset", type="primary"):
            demo_preset = SerumPreset(
                name="Neurofunk Reese Demo",
                category="Bass",
                oscillators={
                    "A": OscillatorState(
                        name="A", enabled=True, wave_shape="Saw",
                        unison=4, detune=8.0, octave=-1, semi=0, fine=0,
                        pan=0.0, level=0.8,
                    ),
                    "B": OscillatorState(
                        name="B", enabled=True, wave_shape="Saw",
                        unison=4, detune=-8.0, octave=-1, semi=0, fine=0,
                        pan=0.0, level=0.8,
                    ),
                },
                filter=FilterState(
                    enabled=True, filter_type="Low Pass 24dB",
                    cutoff=2500.0, resonance=0.6, drive=0.3, mix=1.0,
                ),
                modulations=[
                    ModAssignment(source="LFO 1", destination="Filter Cutoff", amount=60.0, bipolar=False),
                    ModAssignment(source="Env 1", destination="Osc A Detune", amount=40.0, bipolar=True),
                    ModAssignment(source="Macro 1", destination="Filter Resonance", amount=50.0, bipolar=False),
                    ModAssignment(source="LFO 2", destination="Volume", amount=30.0, bipolar=True),
                ],
                fx_chain=["Distortion", "Compressor", "Reverb"],
            )

            tab1, tab2, tab3, tab4 = st.tabs([
                "🔀 Oscillator Routing",
                "📈 Filter Curve",
                "🎛 Macros",
                "🔗 Modulation Matrix",
            ])

            with tab1:
                render_oscillator_routing(demo_preset)
            with tab2:
                render_filter_curve(demo_preset.filter)
            with tab3:
                render_macro_assignments(demo_preset)
            with tab4:
                render_modulation_map(demo_preset)