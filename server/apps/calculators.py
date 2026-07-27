# NPOS Streamlit Calculators

import streamlit as st

st.title("📊 NPOS Calculators")
st.markdown("Tools for neurofunk production.")

# Frequency Calculator
st.header("Frequencies Calculator")
st.subheader("Neurofunk Bass Ranges")
st.markdown("""
| Band | Frequency | Purpose |
|------|-----------|---------|
| Sub | 20-60 Hz | Felt, not heard |
| Bass | 60-250 Hz | Main body |
| Low-Mid | 250-500 Hz | Muddiness |
| Mid | 500-2000 Hz | Clarity |
| High-Mid | 2-6 kHz | Presence |
| High | 6-20 kHz | Air, sibilance |
""")

# BPM Calculator
st.header("BPM Calculator")
bpm = st.slider("Tempo (BPM)", 160, 190, 172)
beat_ms = 60000 / bpm
st.write(f"One beat = {beat_ms:.1f}ms")
st.write(f"1/16 note = {beat_ms/4:.1f}ms")

# LUFS Calculator
st.header("LUFS Targets")
st.markdown("""
| Platform | Target LUFS |
|----------|-------------|
| Spotify | -14 |
| Apple Music | -16 |
| YouTube | -14 |
| CD | -9 to -12 |
""")
