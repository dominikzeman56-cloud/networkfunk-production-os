# Implementation Plan

[Overview]
Create a unified Streamlit-based production hub containing enhanced calculators and a visual Serum preset analyzer to assist in Neurofunk music production.

The implementation will integrate multiple complex engineering tools into a single, high-performance Streamlit local application. This includes:
1. An Enhanced Calculator Suite: Featuring a Reese Bass notch/phase cancellation calculator, BPM-sync delay/reverb pre-delay time calculator, harmonic overtone series generator, and physical sound wavelength calculator.
2. A Visual Serum Preset Analyzer: Able to mock-parse or read Serum preset configurations (.fxp files or structured schema) and visualize oscillator routing, filter curves, modulation maps, and macro assignments.
3. A Unified Navigation Hub: A sleek, sidebar-driven dashboard unifying all existing calculators, the video workshop processor, and the new preset analyzer under a cohesive professional interface.

[Types]
Type definitions and data structures to represent calculators and Serum preset state.

The system will use the following Python typing and dataclass definitions:

```python
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Union

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
```

[Files]
File modifications and creation for the unified hub.

New files to be created:
- `server/apps/hub.py`: The entrypoint for the unified Streamlit local dashboard.
- `server/apps/enhanced_calculators.py`: Library/view file implementing Reese notch, BPM sync, harmonics, and wavelength calculations.
- `server/apps/visual_analyzer.py`: Visualizer file for Serum presets, handling routing rendering and charts.

Existing files to be modified:
- `server/requirements.txt`: Adding packages like `matplotlib`, `pandas`, `numpy`, and `plotly` if needed for advanced visualizations.

Files to be deleted or moved:
- None. `server/apps/calculators.py` and `server/apps/preset_analyzer.py` will be retained as legacy endpoints or redirected to the new `hub.py`.

[Functions]
Function definitions for the calculators and preset parsing/visualization.

New functions:
- `calculate_delay_times(bpm: float) -> List[DelayTime]`: Located in `server/apps/enhanced_calculators.py`. Generates standard, dotted, and triplet delay times in ms and their equivalent frequency in Hz.
- `calculate_harmonics(fundamental_hz: float, num_harmonics: int = 16) -> List[Harmonic]`: Located in `server/apps/enhanced_calculators.py`. Generates the harmonic series, closest musical notes, and tuning deviations.
- `calculate_reese_notches(detune_hz: float) -> ReeseNotch`: Located in `server/apps/enhanced_calculators.py`. Calculates phase cancellation notches and destructive delay times for Reese bass detuning.
- `parse_serum_fxp(file_bytes: bytes) -> SerumPreset`: Located in `server/apps/visual_analyzer.py`. Parses basic bytes or falls back to a structural analyzer of Serum presets.
- `render_oscillator_routing(preset: SerumPreset)`: Located in `server/apps/visual_analyzer.py`. Renders interactive block/routing diagrams using streamlit/plotly.
- `render_filter_curve(filter_state: FilterState)`: Located in `server/apps/visual_analyzer.py`. Generates a visual filter response curve graph using matplotlib/numpy.

[Classes]
No new classes are required other than the typing dataclasses specified in Types.

No classes are removed or modified.

[Dependencies]
New Python dependencies for visualization and calculations.

We need to add:
- `numpy>=1.20.0` for mathematical curve plotting.
- `matplotlib>=3.5.0` for plotting filter response graphs.
- `plotly>=5.10.0` for interactive signal flow and routing diagrams.
- `pandas>=1.3.0` for structured data tables.

Update `server/requirements.txt`:
```text
streamlit>=1.30.0
watchdog>=3.0.0
pydub>=0.25.1
numpy>=1.20.0
matplotlib>=3.5.0
plotly>=5.10.0
pandas>=1.3.0
```

[Testing]
Testing strategy for math routines and preset data mapping.

A automated test script `server/test_hub.py` will be created:
- Test that `calculate_delay_times` returns exact mathematically expected ms values for standard tempos (e.g., 172 BPM).
- Test `calculate_harmonics` identifies note names and cents deviation accurately (e.g., A4 = 440Hz).
- Test that the Reese notch calculator correctly solves the destructive phase interference formulas.
- Test mock preset parsing yields correct typing structures.

[Implementation Order]
The logical order of execution to implement the unified hub.

1. Update dependencies: Install plotly, matplotlib, numpy, and pandas, and update `server/requirements.txt`.
2. Implement Math Logic: Create `server/apps/enhanced_calculators.py` with delay, reese, and harmonic formulas.
3. Build Calculator UI: Build the streamlit interface for calculators inside `server/apps/enhanced_calculators.py`.
4. Create Preset Analyzer Core: Implement `server/apps/visual_analyzer.py` with dataclasses and parsing/visualization methods.
5. Create Preset UI: Build preset upload/drag-drop interface, interactive routing diagram, and matplotlib filter curve drawing.
6. Build Unified Hub Navigation: Create `server/apps/hub.py` linking Video Workshop, Enhanced Calculators, and Visual Preset Analyzer into one sidebar navigation.
7. Implement automated tests: Build `server/test_hub.py` and run tests to verify math formulas.
