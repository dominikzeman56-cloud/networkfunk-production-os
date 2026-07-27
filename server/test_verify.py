"""Run quick verification and write to absolute path."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import all core functions
from server.apps.enhanced_calculators import calculate_delay_times, calculate_harmonics, calculate_reese_notches, _hz_to_note
from server.apps import DelayTime, Harmonic, ReeseNotch, OscillatorState, FilterState, ModAssignment, SerumPreset

results = []

def t(name, ok):
    results.append(f"{'PASS' if ok else 'FAIL'}: {name}")

# Delay tests
r = calculate_delay_times(172)
q = [d for d in r if d.note_value == '1/4'][0]
e = [d for d in r if d.note_value == '1/8'][0]
t("Quarter at 172 BPM", abs(q.ms - 348.84) < 1)
t("Eighth at 172 BPM", abs(e.ms - 174.42) < 1)
t("14 divisions", len(r) == 14)
t("Dotted 1.5x", abs([d for d in r if d.note_value == '1/8D'][0].ms - e.ms * 1.5) < 0.1)

# Harmonic tests
h = calculate_harmonics(55.0, 8)
t("8 harmonics", len(h) == 8)
t("Fundamental 55Hz", h[0].frequency_hz == 55.0)
t("A4=440Hz maps to A4", calculate_harmonics(440, 1)[0].closest_note == "A4")

# Reese tests
rn = calculate_reese_notches(5.0)
t("Notch = detune/2", rn.frequency_hz == 2.5)
t("Wavelength > 0", rn.wavelength_cm > 0)
t("Zero detune = zero", all(getattr(calculate_reese_notches(0), f) == 0.0 for f in ['frequency_hz', 'wavelength_cm', 'destructive_delay_ms']))

# Hz to note
t("A4=440Hz", _hz_to_note(440)[0] == "A4")
t("0Hz returns ---", _hz_to_note(0)[0] == "---")

# Data types
osc = OscillatorState("A", True, "Saw", 4, 8.0, -1, 0, 0, 0.0, 0.8)
t("OscillatorState", osc.name == "A" and osc.unison == 4)
fs = FilterState(True, "LP 24dB", 2500, 0.6, 0.3, 1.0)
t("FilterState", fs.filter_type == "LP 24dB")
ma = ModAssignment("LFO 1", "Filter Cutoff", 60.0, False)
t("ModAssignment", ma.source == "LFO 1")
preset = SerumPreset("Test", "Bass", {"A": osc}, fs, [ma], ["Dist"])
t("SerumPreset", preset.name == "Test" and len(preset.oscillators) == 1)

# Write report
out = []
out.append("NPOS Verification Results")
out.append("=" * 40)
for r in results:
    out.append(f"  {r}")
passed = sum(1 for r in results if r.startswith("PASS"))
total = len(results)
out.append("")
out.append(f"Passed: {passed}/{total}")
out.append("=" * 40)

output = "\n".join(out)

# Write to known location
report_path = r"d:\ObsidianVault\networkfunk-production-os\verify_results.txt"
with open(report_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(output)
print(f"\nReport written to: {report_path}")