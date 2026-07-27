"""Run NPOS validation and write results to results.txt"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import logging
logging.disable(logging.CRITICAL)

lines = []
def log(msg): lines.append(msg)

log("NPOS Validation Tests")
log("=" * 50)

# 1. Delay calculator
from server.apps.enhanced_calculators import calculate_delay_times
r = calculate_delay_times(172)
q = [d for d in r if d.note_value == '1/4'][0]
log(f"Quarter 172 BPM: {q.ms:.2f}ms (expected ~348.84) {'✅' if abs(q.ms - 348.84) < 1 else '❌'}")
e = [d for d in r if d.note_value == '1/8'][0]
log(f"Eighth 172 BPM:  {e.ms:.2f}ms (expected ~174.42) {'✅' if abs(e.ms - 174.42) < 1 else '❌'}")
s = [d for d in r if d.note_value == '1/16'][0]
log(f"16th 172 BPM:    {s.ms:.2f}ms (expected ~87.21) {'✅' if abs(s.ms - 87.21) < 1 else '❌'}")
log(f"Dotted 1.5x:     {d.ms:.2f}ms {'✅' if abs(d.ms - e.ms * 1.5) < 0.1 else '❌'}")
log(f"14 divisions:    {len(r)} {'✅' if len(r) == 14 else '❌'}")

# 2. Harmonics
from server.apps.enhanced_calculators import calculate_harmonics
h = calculate_harmonics(55.0, 8)
log(f"Harmonics:       {len(h)} total {'✅' if len(h) == 8 else '❌'}")
log(f"Fundamental:     {h[0].frequency_hz} Hz {'✅' if h[0].frequency_hz == 55.0 else '❌'}")
log(f"Harmonic 8:      {h[7].frequency_hz} Hz {'✅' if h[7].frequency_hz == 440.0 else '❌'}")
h440 = calculate_harmonics(440, 1)[0]
log(f"A4=440Hz note:   {h440.closest_note} {'✅' if h440.closest_note == 'A4' else '❌'}")

# 3. Reese notches
from server.apps.enhanced_calculators import calculate_reese_notches
rn = calculate_reese_notches(5.0)
log(f"Notch freq:      {rn.frequency_hz} Hz {'✅' if rn.frequency_hz == 2.5 else '❌'}")
log(f"Wavelength:      {rn.wavelength_cm:.1f} cm {'✅' if rn.wavelength_cm > 0 else '❌'}")
log(f"Delay:           {rn.destructive_delay_ms:.1f} ms {'✅' if rn.destructive_delay_ms > 0 else '❌'}")
rn0 = calculate_reese_notches(0)
log(f"Zero detune:     {rn0.frequency_hz} {'✅' if rn0.frequency_hz == 0 else '❌'}")

# 4. Hz to note
from server.apps.enhanced_calculators import _hz_to_note
log(f"A4=440Hz:        {_hz_to_note(440)} {'✅' if _hz_to_note(440)[0] == 'A4' else '❌'}")
log(f"0Hz:             {_hz_to_note(0)[0]} {'✅' if _hz_to_note(0)[0] == '---' else '❌'}")
log(f"A5=880Hz:        {_hz_to_note(880)[0]} {'✅' if _hz_to_note(880)[0] == 'A5' else '❌'}")

# 5. Data types
from server.apps import DelayTime, OscillatorState, FilterState, ModAssignment, SerumPreset
dt = DelayTime("1/4", 348.84, 2.867)
log(f"DelayTime:       {dt.note_value} {dt.ms}ms {'✅' if dt.note_value == '1/4' else '❌'}")
osc = OscillatorState("A", True, "Saw", 4, 8.0, -1, 0, 0, 0.0, 0.8)
log(f"Oscillator:      {osc.name} {osc.wave_shape} {'✅' if osc.name == 'A' else '❌'}")
fs = FilterState(True, "LP 24dB", 2500, 0.6, 0.3, 1.0)
log(f"Filter:          {fs.filter_type} {'✅' if 'LP' in fs.filter_type else '❌'}")
ma = ModAssignment("LFO 1", "Filter Cutoff", 60.0, False)
log(f"Mod:             {ma.source}->{ma.destination} {'✅' if ma.source == 'LFO 1' else '❌'}")

preset = SerumPreset("Test", "Bass", {"A": osc}, fs, [ma], ["Distortion"])
log(f"Preset:          {preset.name} {'✅' if preset.name == 'Test' else '❌'}")
log(f"Preset oscs:     {len(preset.oscillators)} {'✅' if len(preset.oscillators) == 1 else '❌'}")

log("\n" + "=" * 50)
passed = sum(1 for l in lines if '✅' in l)
total = sum(1 for l in lines if '✅' in l or '❌' in l)
log(f"Passed: {passed}/{total}")

# Write results
result_path = os.path.join(os.path.dirname(__file__), '..', 'results.txt')
with open(result_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print(f"Results written to {result_path}")
print('\n'.join(lines))