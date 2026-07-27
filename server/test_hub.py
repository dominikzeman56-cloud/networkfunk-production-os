"""
NPOS Production Hub — Automated Tests
Tests for enhanced calculators and preset analyzer data structures.
"""

import unittest
import sys
import os
import math

# Ensure the server package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.apps.enhanced_calculators import (
    calculate_delay_times,
    calculate_harmonics,
    calculate_reese_notches,
    _hz_to_note,
)
from server.apps import (
    DelayTime,
    Harmonic,
    ReeseNotch,
    OscillatorState,
    FilterState,
    ModAssignment,
    SerumPreset,
)


class TestDelayCalculator(unittest.TestCase):
    """Test BPM-sync delay time calculations."""

    def setUp(self):
        self.bpm_172 = 172
        self.results = calculate_delay_times(self.bpm_172)

    def test_returns_list_of_delay_times(self):
        """Should return a list of DelayTime objects."""
        self.assertIsInstance(self.results, list)
        self.assertTrue(len(self.results) > 0)
        for item in self.results:
            self.assertIsInstance(item, DelayTime)

    def test_quarter_note_at_172_bpm(self):
        """Quarter note at 172 BPM should be ~348.84ms."""
        # 60000 / 172 = 348.837...
        quarter = [d for d in self.results if d.note_value == "1/4"][0]
        self.assertAlmostEqual(quarter.ms, 60000.0 / 172, delta=0.1)

    def test_eighth_note_at_172_bpm(self):
        """Eighth note at 172 BPM should be ~174.42ms."""
        eighth = [d for d in self.results if d.note_value == "1/8"][0]
        self.assertAlmostEqual(eighth.ms, 30000.0 / 172, delta=0.1)

    def test_sixteenth_note_at_172_bpm(self):
        """Sixteenth note at 172 BPM should be ~87.21ms."""
        sixteenth = [d for d in self.results if d.note_value == "1/16"][0]
        self.assertAlmostEqual(sixteenth.ms, 15000.0 / 172, delta=0.1)

    def test_dotted_eighth_note(self):
        """Dotted eighth note should be 1.5x eighth note."""
        eighth = [d for d in self.results if d.note_value == "1/8"][0]
        dotted = [d for d in self.results if d.note_value == "1/8D"][0]
        self.assertAlmostEqual(dotted.ms, eighth.ms * 1.5, delta=0.1)

    def test_triplet_relationship(self):
        """Triplet should be 2/3 of the straight division."""
        eighth = [d for d in self.results if d.note_value == "1/8"][0]
        triplet = [d for d in self.results if d.note_value == "1/8T"][0]
        self.assertAlmostEqual(triplet.ms, eighth.ms * 2 / 3, delta=0.1)

    def test_frequency_is_reciprocal_of_period(self):
        """Frequency in Hz should be 1000 / ms."""
        for item in self.results:
            if item.ms > 0:
                expected_hz = 1000.0 / item.ms
                self.assertAlmostEqual(item.frequency_hz, expected_hz, delta=0.001)

    def test_different_tempos(self):
        """Should work correctly for different BPM values."""
        for bpm in [140, 155, 174, 180]:
            results = calculate_delay_times(bpm)
            quarter = [d for d in results if d.note_value == "1/4"][0]
            expected  = 60000.0 / bpm
            self.assertAlmostEqual(quarter.ms, expected, delta=0.1)


class TestHarmonicCalculator(unittest.TestCase):
    """Test harmonic series calculations."""

    def test_returns_list_of_harmonics(self):
        """Should return a list of Harmonic objects."""
        harmonics = calculate_harmonics(55.0, 8)
        self.assertIsInstance(harmonics, list)
        self.assertEqual(len(harmonics), 8)
        for h in harmonics:
            self.assertIsInstance(h, Harmonic)

    def test_fundamental_frequency(self):
        """First harmonic should equal fundamental."""
        harmonics = calculate_harmonics(55.0, 8)
        self.assertEqual(harmonics[0].number, 1)
        self.assertEqual(harmonics[0].frequency_hz, 55.0)

    def test_harmonic_multiples(self):
        """Each harmonic should be n * fundamental."""
        fundamental = 55.0
        harmonics = calculate_harmonics(fundamental, 16)
        for h in harmonics:
            expected = fundamental * h.number
            self.assertEqual(h.frequency_hz, expected)

    def test_a4_440hz(self):
        """A4 = 440Hz should map to A4 with ~0 cents deviation."""
        harmonics = calculate_harmonics(440.0, 1)
        self.assertEqual(harmonics[0].closest_note, "A4")
        self.assertAlmostEqual(harmonics[0].cents_dev, 0.0, delta=0.1)

    def test_c4_261_63hz(self):
        """C4 ≈ 261.63Hz should map close to C4."""
        harmonics = calculate_harmonics(261.63, 1)
        self.assertIn("C", harmonics[0].closest_note)

    def test_num_harmonics_count(self):
        """Should generate exactly num_harmonics harmonics."""
        for n in [4, 8, 16, 32]:
            harmonics = calculate_harmonics(100.0, n)
            self.assertEqual(len(harmonics), n)

    def test_frequencies_are_increasing(self):
        """Harmonic frequencies should be monotonically increasing."""
        harmonics = calculate_harmonics(55.0, 16)
        freqs = [h.frequency_hz for h in harmonics]
        for i in range(1, len(freqs)):
            self.assertGreater(freqs[i], freqs[i-1])


class TestReeseNotchCalculator(unittest.TestCase):
    """Test Reese bass notch calculations."""

    def test_returns_reese_notch(self):
        """Should return a ReeseNotch object."""
        result = calculate_reese_notches(5.0)
        self.assertIsInstance(result, ReeseNotch)

    def test_notch_frequency_is_half_detune(self):
        """First notch frequency should be detune_hz / 2."""
        for detune in [2.0, 5.0, 8.0, 12.0]:
            result = calculate_reese_notches(detune)
            expected = detune / 2.0
            self.assertEqual(result.frequency_hz, expected)

    def test_wavelength_formula(self):
        """Wavelength (cm) = speed_of_sound (cm/s) / frequency (Hz)."""
        result = calculate_reese_notches(5.0)
        expected_wavelength = 34300.0 / result.frequency_hz
        self.assertAlmostEqual(result.wavelength_cm, expected_wavelength, delta=0.01)

    def test_destructive_delay_formula(self):
        """Destructive delay (ms) = 500 / notch_frequency (Hz)."""
        result = calculate_reese_notches(5.0)
        expected_delay = 500.0 / result.frequency_hz
        self.assertAlmostEqual(result.destructive_delay_ms, expected_delay, delta=0.001)

    def test_zero_detune_returns_zero(self):
        """Zero detune should return zero for all fields."""
        result = calculate_reese_notches(0.0)
        self.assertEqual(result.frequency_hz, 0.0)
        self.assertEqual(result.wavelength_cm, 0.0)
        self.assertEqual(result.destructive_delay_ms, 0.0)

    def test_large_detune(self):
        """Large detune values should still produce valid results."""
        result = calculate_reese_notches(20.0)
        self.assertGreater(result.frequency_hz, 0)
        self.assertGreater(result.wavelength_cm, 0)
        self.assertGreater(result.destructive_delay_ms, 0)


class TestHertzToNote(unittest.TestCase):
    """Test frequency-to-note conversion utility."""

    def test_a4_440(self):
        """A4 = 440Hz."""
        note, cents = _hz_to_note(440.0)
        self.assertEqual(note, "A4")
        self.assertAlmostEqual(cents, 0.0, delta=0.1)

    def test_c4_261_63(self):
        """C4 ≈ 261.63Hz."""
        note, cents = _hz_to_note(261.63)
        self.assertEqual(note[0], "C")  # Should be C something

    def test_negative_frequency(self):
        """Negative or zero frequency should return ('---', 0.0)."""
        note, cents = _hz_to_note(0.0)
        self.assertEqual(note, "---")
        self.assertEqual(cents, 0.0)
        note, cents = _hz_to_note(-100.0)
        self.assertEqual(note, "---")
        self.assertEqual(cents, 0.0)

    def test_a5_880(self):
        """A5 = 880Hz (one octave above A4)."""
        note, cents = _hz_to_note(880.0)
        self.assertIn("A", note)

    def test_octave_relationship(self):
        """Doubling frequency should increase octave by 1."""
        note1, _ = _hz_to_note(220.0)
        note2, _ = _hz_to_note(440.0)
        # Extract octave numbers
        import re
        oct1 = int(re.search(r'\d+', note1).group()) if re.search(r'\d+', note1) else 0
        oct2 = int(re.search(r'\d+', note2).group()) if re.search(r'\d+', note2) else 0
        self.assertEqual(oct2, oct1 + 1)


class TestDataTypes(unittest.TestCase):
    """Test data type dataclasses."""

    def test_delay_time_dataclass(self):
        """DelayTime should store note_value, ms, and frequency_hz."""
        dt = DelayTime("1/4", 348.84, 2.867)
        self.assertEqual(dt.note_value, "1/4")
        self.assertEqual(dt.ms, 348.84)
        self.assertEqual(dt.frequency_hz, 2.867)

    def test_harmonic_dataclass(self):
        """Harmonic should store number, frequency, note, cents."""
        h = Harmonic(1, 55.0, "A1", -0.5)
        self.assertEqual(h.number, 1)
        self.assertEqual(h.frequency_hz, 55.0)
        self.assertEqual(h.closest_note, "A1")
        self.assertEqual(h.cents_dev, -0.5)

    def test_reese_notch_dataclass(self):
        """ReeseNotch should store frequency, wavelength, delay."""
        rn = ReeseNotch(2.5, 13720.0, 200.0)
        self.assertEqual(rn.frequency_hz, 2.5)
        self.assertEqual(rn.wavelength_cm, 13720.0)
        self.assertEqual(rn.destructive_delay_ms, 200.0)

    def test_oscillator_state_dataclass(self):
        """OscillatorState should store all oscillator parameters."""
        osc = OscillatorState(
            name="A", enabled=True, wave_shape="Saw",
            unison=4, detune=8.0, octave=-1, semi=0, fine=0,
            pan=-0.5, level=0.8,
        )
        self.assertEqual(osc.name, "A")
        self.assertTrue(osc.enabled)
        self.assertEqual(osc.wave_shape, "Saw")
        self.assertEqual(osc.unison, 4)
        self.assertEqual(osc.detune, 8.0)
        self.assertEqual(osc.pan, -0.5)

    def test_filter_state_dataclass(self):
        """FilterState should store all filter parameters."""
        fs = FilterState(
            enabled=True, filter_type="Low Pass 24dB",
            cutoff=2500.0, resonance=0.6, drive=0.3, mix=1.0,
        )
        self.assertTrue(fs.enabled)
        self.assertEqual(fs.filter_type, "Low Pass 24dB")
        self.assertEqual(fs.cutoff, 2500.0)
        self.assertEqual(fs.resonance, 0.6)

    def test_mod_assignment_dataclass(self):
        """ModAssignment should store source, destination, amount, bipolar."""
        ma = ModAssignment(
            source="LFO 1", destination="Filter Cutoff",
            amount=60.0, bipolar=False,
        )
        self.assertEqual(ma.source, "LFO 1")
        self.assertEqual(ma.destination, "Filter Cutoff")
        self.assertEqual(ma.amount, 60.0)
        self.assertFalse(ma.bipolar)

    def test_serum_preset_dataclass(self):
        """SerumPreset should compose all sub-objects."""
        osc_a = OscillatorState(
            name="A", enabled=True, wave_shape="Saw",
            unison=4, detune=8.0, octave=-1, semi=0, fine=0,
            pan=0.0, level=0.8,
        )
        osc_b = OscillatorState(
            name="B", enabled=True, wave_shape="Saw",
            unison=4, detune=-8.0, octave=-1, semi=0, fine=0,
            pan=0.0, level=0.8,
        )
        filter_state = FilterState(
            enabled=True, filter_type="Low Pass 24dB",
            cutoff=2500.0, resonance=0.6, drive=0.3, mix=1.0,
        )
        mods = [
            ModAssignment("LFO 1", "Filter Cutoff", 60.0, False),
            ModAssignment("Env 1", "Osc A Detune", 40.0, True),
        ]

        preset = SerumPreset(
            name="Test Preset",
            category="Bass",
            oscillators={"A": osc_a, "B": osc_b},
            filter=filter_state,
            modulations=mods,
            fx_chain=["Distortion", "Compressor"],
        )

        self.assertEqual(preset.name, "Test Preset")
        self.assertEqual(len(preset.oscillators), 2)
        self.assertEqual(len(preset.modulations), 2)
        self.assertEqual(len(preset.fx_chain), 2)
        self.assertEqual(preset.oscillators["A"].wave_shape, "Saw")
        self.assertEqual(preset.filter.cutoff, 2500.0)


if __name__ == "__main__":
    unittest.main(verbosity=2)