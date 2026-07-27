"""Quick validation of core calculator functions."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

results = []

def check(name, condition, details=""):
    if condition:
        results.append(f"  ✅ PASS: {name}")
    else:
        results.append(f"  ❌ FAIL: {name} - {details}")

# 1. Delay calculator
from server.apps.enhanced_calculators import calculate_delay_times
r = calculate_delay_times(172)
quarter = [d for d in r if d.note_value == '1/4'][0]
check("Quarter note at 172 BPM", abs(quarter.ms - 348.84) < 1, f"got {quarter.ms}")

eighth = [d for d in r if d.note_value == '1/8'][0]
check("Eighth note at 172 BPM", abs(eighth.ms - 174.42) < 1, f"got {eighth.ms}")

sixteenth = [d for d in r if d.note_value == '1/16'][0]
check("Sixteenth note at 172 BPM", abs(sixteenth.ms - 87.21) < 1, f"got {sixteenth.ms}")

dotted = [d for d in r if d.note_value == '1/8D'][0]
check("Dotted eighth = 1.5x eighth", abs(dotted.ms - eighth.ms * 1.5) < 0.1)

triplet = [d for d in r if d.note_value == '1/8T'][0]
check("Triplet = 2/3 of eighth", abs(triplet.ms - eighth.ms * 2/3) < 0.1)

check("Returns DelayTime objects", all(isinstance(x, type(quarter)) for x in r))
check("Has all division types", len(r) == 14)

# 2. Harmonic calculator
from server.apps.enhanced_calculators import calculate_harmonics
h = calculate_harmonics(55.0, 8)
check("Harmonics returns correct count", len(h) == 8)
check("Fundamental = 55 Hz", h[0].frequency_hz == 55.0)
check("Harmonics are n*55", all(h[i].frequency_hz == 55.0 * (i+1) for i in range(8)))
check("A4 = 440Hz maps correctly", calculate_harmonics(440, 1)[0].closest_note == "A4")

# 3. Reese notch
from server.apps.enhanced_calculators import calculate_reese_notches
rn = calculate_reese_notches(5.0)
check("Notch freq = detune/2", rn.frequency_hz == 2.5)
check("Wavelength > 0", rn.wavelength_cm > 0)
check("Destructive delay > 0", rn.destructive_delay_ms > 0)
check("Zero detune = all zero", all(
    getattr(calculate_reese_notches(0), f) == 0.0 
    for f in ['frequency_hz', 'wavelength_cm', 'destructive_delay_ms']
))

# 4. Hz to note
from server.apps.enhanced_calculators import _hz_to_note
n, c = _hz_to_note(440.0)
check("A4 = 440Hz", n == "A4" and abs(c) < 0.1)
check("Zero freq returns ---", _hz_to_note(0)[0] == "---")
n880, _ = _hz_to_note(880.0)
check("A5 = 880Hz", 'A' in n880)

# 5. Data types
from server.apps import DelayTime, Harmonic, ReeseNotch, OscillatorState, FilterState, ModAssignment, SerumPreset
dt = DelayTime("1/4", 348.84, 2.867)
check("DelayTime dataclass", dt.note_value == "1/4" and dt.ms == 348.84)

osc = OscillatorState("A", True, "Saw", 4, 8.0, -1, 0, 0, 0.0, 0.8)
check("OscillatorState dataclass", osc.name == "A" and osc.unison == 4)

fs = FilterState(True, "Low Pass 24dB", 2500.0, 0.6, 0.3, 1.0)
check("FilterState dataclass", fs.filter_type == "Low Pass 24dB" and fs.cutoff == 2500.0)

ma = ModAssignment("LFO 1", "Filter Cutoff", 60.0, False)
check("ModAssignment dataclass", ma.source == "LFO 1" and ma.amount == 60.0 and not ma.bipolar)

preset = SerumPreset("Test", "Bass", {"A": osc}, fs, [ma], ["Distortion"])
check("SerumPreset composition", preset.name == "Test" and len(preset.oscillators) == 1)

# Summary
print(f"\n{'='*50}")
print(f"NPOS Validation Tests")
print(f"{'='*50}")
for line in results:
    print(line)
passed = sum(1 for r in results if 'PASS' in r)
failed = sum(1 for r in results if 'FAIL' in r)
print(f"\nResults: {passed} passed, {failed} failed out of {len(results)} total")
print(f"{'='*50}")