# NPOS Streamlit Applications

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Union

# ── Data Types ───────────────────────────────────────────────────────────────

@dataclass
class DelayTime:
    note_value: str
    ms: float
    frequency_hz: float

@dataclass
class Harmonic:
    number: int
    frequency_hz: float
    closest_note: str
    cents_dev: float

@dataclass
class ReeseNotch:
    frequency_hz: float
    wavelength_cm: float
    destructive_delay_ms: float

@dataclass
class OscillatorState:
    name: str  # 'A' or 'B'
    enabled: bool
    wave_shape: str
    unison: int
    detune: float
    octave: int
    semi: int
    fine: int
    pan: float
    level: float

@dataclass
class FilterState:
    enabled: bool
    filter_type: str
    cutoff: float
    resonance: float
    drive: float
    mix: float

@dataclass
class ModAssignment:
    source: str       # e.g., 'LFO 1', 'Env 2', 'Macro 1'
    destination: str  # e.g., 'Osc A Detune', 'Filter Cutoff'
    amount: float     # -100 to 100
    bipolar: bool

@dataclass
class SerumPreset:
    name: str
    category: str
    oscillators: Dict[str, OscillatorState]
    filter: FilterState
    modulations: List[ModAssignment]
    fx_chain: List[str]