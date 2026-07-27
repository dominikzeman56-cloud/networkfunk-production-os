"""
NPOS Enhanced Calculators
BPM-sync delay/reverb times, harmonic series, Reese notch calculator.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Union
import numpy as np
import streamlit as st
import plotly.graph_objects as go
import pandas as pd

from . import DelayTime, Harmonic, ReeseNotch

# ── Math Rounds ──────────────────────────────────────────────────────────────

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

def _hz_to_note(freq: float) -> tuple:
    """Convert frequency to closest note name and cents deviation."""
    if freq <= 0:
        return ("---", 0.0)
    # A4 = 440Hz = note 69
    note_num = 12 * np.log2(freq / 440.0) + 69
    int_note = int(round(note_num))
    cents = (note_num - int_note) * 100
    octave = (int_note // 12) - 1
    note_idx = int_note % 12
    return (f"{NOTE_NAMES[note_idx]}{octave}", round(cents, 1))

# ── 1. Delay Time Calculator ─────────────────────────────────────────────────

def calculate_delay_times(bpm: float) -> List[DelayTime]:
    """
    Generate standard, dotted, and triplet delay times in ms
    and their equivalent frequency in Hz.
    """
    beat_ms = 60000.0 / bpm
    results: List[DelayTime] = []

    divisions = [
        ("1/1", 4.0),
        ("1/2", 2.0),
        ("1/2T", 2.0 / 3.0 * 2.0),
        ("1/4", 1.0),
        ("1/4T", 1.0 / 3.0 * 2.0),
        ("1/8", 0.5),
        ("1/8T", 0.5 / 3.0 * 2.0),
        ("1/8D", 0.5 * 1.5),
        ("1/16", 0.25),
        ("1/16T", 0.25 / 3.0 * 2.0),
        ("1/16D", 0.25 * 1.5),
        ("1/32", 0.125),
        ("1/32T", 0.125 / 3.0 * 2.0),
        ("1/32D", 0.125 * 1.5),
    ]

    for name, beats in divisions:
        ms = round(beat_ms * beats, 2)
        hz = 1000.0 / ms if ms > 0 else 0.0
        results.append(DelayTime(note_value=name, ms=ms, frequency_hz=round(hz, 3)))

    return results

# ── 2. Harmonic Series Calculator ────────────────────────────────────────────

def calculate_harmonics(fundamental_hz: float, num_harmonics: int = 16) -> List[Harmonic]:
    """
    Generate the harmonic series, closest musical notes, and tuning deviations.
    """
    harmonics: List[Harmonic] = []
    for n in range(1, num_harmonics + 1):
        freq = fundamental_hz * n
        note, cents = _hz_to_note(freq)
        harmonics.append(Harmonic(
            number=n,
            frequency_hz=round(freq, 3),
            closest_note=note,
            cents_dev=cents
        ))
    return harmonics

# ── 3. Reese Notch Calculator ────────────────────────────────────────────────

SOUND_SPEED_CM_MS = 34300.0  # speed of sound in cm/s at 20°C

def calculate_reese_notches(detune_hz: float) -> ReeseNotch:
    """
    Calculate phase cancellation notches and destructive delay times
    for Reese bass detuning.
    """
    # The notch frequency is the difference between two detuned oscillators.
    # First destructive notch appears at half the detune difference.
    # For two oscillators detuned by ±detune_hz/2:
    #   f1 = f0 + detune/2, f2 = f0 - detune/2
    #   The beat/notch frequency = detune_hz
    #   First destructive notch (deepest cancellation) = detune_hz / 2
    notch_freq = detune_hz / 2.0

    if notch_freq <= 0:
        return ReeseNotch(frequency_hz=0.0, wavelength_cm=0.0, destructive_delay_ms=0.0)

    # Wavelength = speed_of_sound / frequency (in cm)
    wavelength_cm = SOUND_SPEED_CM_MS / notch_freq if notch_freq > 0 else 0.0

    # Destructive delay = half-period = 1 / (2 * notch_freq) in seconds
    # Convert to ms
    destructive_delay_ms = 500.0 / notch_freq

    return ReeseNotch(
        frequency_hz=round(notch_freq, 3),
        wavelength_cm=round(wavelength_cm, 2),
        destructive_delay_ms=round(destructive_delay_ms, 3)
    )

# ── Streamlit UI ─────────────────────────────────────────────────────────────

def render_delay_calculator():
    """Render the BPM-sync delay calculator UI."""
    st.subheader("⏱ BPM Delay / Reverb Time Calculator")
    bpm = st.slider("Tempo (BPM)", 60, 240, 172, key="delay_bpm")

    results = calculate_delay_times(bpm)

    # Display as table
    data = {
        "Note": [d.note_value for d in results],
        "Time (ms)": [d.ms for d in results],
        "Frequency (Hz)": [d.frequency_hz for d in results],
    }
    st.dataframe(pd.DataFrame(data), use_container_width=True, hide_index=True)

    # Visual bar chart of delay times
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=[d.note_value for d in results],
        y=[d.ms for d in results],
        marker_color="#10b981",
        name="Delay Time (ms)",
    ))
    fig.update_layout(
        title=f"Delay Times @ {bpm} BPM",
        xaxis_title="Note Division",
        yaxis_title="Time (ms)",
        height=400,
        template="plotly_dark",
    )
    st.plotly_chart(fig, use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        st.metric("Quarter Note", f"{60000/bpm:.1f} ms")
    with col2:
        st.metric("Eighth Note", f"{30000/bpm:.1f} ms")


def render_harmonic_calculator():
    """Render the harmonic series calculator UI."""
    st.subheader("🎵 Harmonic Overtone Series Calculator")
    col1, col2 = st.columns(2)
    with col1:
        fundamental = st.number_input("Fundamental Frequency (Hz)", 20.0, 2000.0, 55.0, step=0.5, key="harm_fund")
    with col2:
        num_harmonics = st.number_input("Number of Harmonics", 1, 64, 16, key="harm_count")

    harmonics = calculate_harmonics(fundamental, num_harmonics)

    # Display as table
    data = {
        "#": [h.number for h in harmonics],
        "Frequency (Hz)": [h.frequency_hz for h in harmonics],
        "Closest Note": [h.closest_note for h in harmonics],
        "Deviation (cents)": [h.cents_dev for h in harmonics],
    }
    st.dataframe(pd.DataFrame(data), use_container_width=True, hide_index=True)

    # Frequency chart
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=[h.number for h in harmonics],
        y=[h.frequency_hz for h in harmonics],
        mode="lines+markers",
        marker_color="#10b981",
        name="Harmonic Series",
    ))
    fig.update_layout(
        title=f"Harmonic Series (Fundamental: {fundamental} Hz)",
        xaxis_title="Harmonic Number",
        yaxis_title="Frequency (Hz)",
        height=400,
        template="plotly_dark",
    )
    st.plotly_chart(fig, use_container_width=True)

    # Note distribution
    st.write("**Note Distribution:**")
    note_counts = {}
    for h in harmonics:
        note = h.closest_note.rstrip("0123456789")  # strip octave
        note_counts[note] = note_counts.get(note, 0) + 1
    st.write(" | ".join(f"**{k}** ({v}x)" for k, v in sorted(note_counts.items())))


def render_reese_calculator():
    """Render the Reese notch calculator UI."""
    st.subheader("🔊 Reese Bass Notch Calculator")
    st.markdown("""
    Calculates phase cancellation notches for detuned reese bass oscillators.
    Two oscillators detuned by ±Δ/2 create a beat frequency = Δ (detune difference).
    The first destructive notch appears at Δ/2.
    """)

    detune = st.slider("Detune Amount (±Hz)", 0.0, 20.0, 5.0, step=0.1, key="reese_detune",
                        format="±%.1f Hz")

    result = calculate_reese_notches(detune)

    if result.frequency_hz > 0:
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Notch Frequency", f"{result.frequency_hz:.3f} Hz")
        with col2:
            st.metric("Wavelength", f"{result.wavelength_cm:.2f} cm")
        with col3:
            st.metric("Destructive Delay", f"{result.destructive_delay_ms:.3f} ms")

        # Visualize the cancellation pattern
        f0 = 100  # assume 100Hz fundamental for visualization
        freqs = np.linspace(20, 500, 1000)
        # Two sinusoids detuned by ±detune/2
        # Their sum amplitude shows the cancellation pattern
        amp = np.abs(np.cos(np.pi * result.frequency_hz * freqs / (f0 ** 2)))
        amp = np.clip(amp, 0.01, 1.0)

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=freqs,
            y=20 * np.log10(amp),
            mode="lines",
            fill="tozeroy",
            line_color="#10b981",
            name="Comb Filter Response",
        ))
        fig.add_vline(x=result.frequency_hz, line_dash="dash", line_color="red",
                      annotation_text=f"1st Notch: {result.frequency_hz:.1f} Hz")
        fig.add_vline(x=result.frequency_hz * 2, line_dash="dash", line_color="orange",
                      annotation_text=f"2nd Notch: {result.frequency_hz*2:.1f} Hz")
        fig.update_layout(
            title=f"Phase Cancellation Pattern (Detune: ±{detune/2:.1f} Hz)",
            xaxis_title="Frequency (Hz)",
            yaxis_title="Amplitude (dB)",
            height=400,
            template="plotly_dark",
            yaxis_range=[-40, 5],
        )
        st.plotly_chart(fig, use_container_width=True)

        st.info(f"""
        **Practical Application:**
        - Fundamental frequency: ~{f0} Hz (for illustration)
        - Oscillator A: {f0 + detune/2:.2f} Hz
        - Oscillator B: {f0 - detune/2:.2f} Hz
        - Deepest cancellation at {result.frequency_hz:.1f} Hz
        """)
    else:
        st.warning("Detune must be greater than 0 to calculate notches.")


def main():
    """Main entry point for the Enhanced Calculators page."""
    st.title("📊 Enhanced Production Calculators")
    st.markdown("---")

    tab1, tab2, tab3 = st.tabs([
        "⏱ BPM Delay & Reverb Times",
        "🎵 Harmonic Series",
        "🔊 Reese Bass Notches",
    ])

    with tab1:
        render_delay_calculator()
    with tab2:
        render_harmonic_calculator()
    with tab3:
        render_reese_calculator()