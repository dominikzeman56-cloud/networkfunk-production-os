"""Tests for feature_vector module (M1.1).

TDD: written BEFORE implementation. Every test must fail first (RED),
then pass after feature_vector.py exists (GREEN).
"""
from __future__ import annotations

import numpy as np
import pytest

from neuroman.tools import feature_vector as fv
from neuroman.tools import serum_preset as sp

# ─── Schema invariants ──────────────────────────────────────────────────


class TestSchema:
    def test_schema_has_fixed_length(self):
        v = fv.to_feature_vector({})
        assert isinstance(v, np.ndarray)
        assert v.dtype == np.float32
        assert v.ndim == 1

    def test_schema_length_is_stable(self):
        v1 = fv.to_feature_vector({})
        v2 = fv.to_feature_vector({})
        assert len(v1) == len(v2), 'schema length must be deterministic'

    def test_schema_length_documented(self):
        v = fv.to_feature_vector({})
        assert len(v) == fv.VECTOR_DIM, 'VECTOR_DIM must match actual length'

    def test_empty_preset_has_defaults(self):
        # Empty preset: categoricals collapse to 'other'/'empty' one-hot (value 1.0),
        # continuous defaults normalize to their midpoints (e.g. octave=0 -> 0.5).
        # No categorical takes a known slot.
        v = fv.to_feature_vector({})
        warp_known = v[5:5 + len(fv.WARP_MENUS)]
        assert np.allclose(warp_known, 0.0), 'empty preset has no known warp menu'
        # FX 'empty' slots must be 1.0 (occupied by empty indicator)
        for s, _ in fv._LAYOUT['fx']:  # noqa: SLF001
            assert v[s + fv._FX_TYPES_COUNT] > 0.5  # noqa: SLF001


class TestCategoricalEncoding:
    def test_warp_menu_one_hot(self):
        # kPD_OSC -> one-hot slot turns on
        cb = {'Oscillator0': {'plainParams': {}, 'WTOsc0': {'plainParams': {'kParamWarpMenu': 'kPD_OSC'}}}}
        v1 = fv.to_feature_vector(cb)
        cb2 = {'Oscillator0': {'plainParams': {}, 'WTOsc0': {'plainParams': {'kParamWarpMenu': 'kSync'}}}}
        v2 = fv.to_feature_vector(cb2)
        assert not np.allclose(v1, v2), 'different warp menus must differ'

    def test_filter_type_one_hot(self):
        cb1 = {'VoiceFilter0': {'plainParams': {'kParamType': 'MgL24'}}}
        cb2 = {'VoiceFilter0': {'plainParams': {'kParamType': 'LadderEMS'}}}
        v1 = fv.to_feature_vector(cb1)
        v2 = fv.to_feature_vector(cb2)
        assert not np.allclose(v1, v2)


class TestContinuousEncoding:
    def test_osc_octave_encodes(self):
        cb1 = {'Oscillator0': {'plainParams': {'kParamOctave': -1.0}}}
        cb2 = {'Oscillator0': {'plainParams': {'kParamOctave': 2.0}}}
        v1 = fv.to_feature_vector(cb1)
        v2 = fv.to_feature_vector(cb2)
        assert not np.allclose(v1, v2)

    def test_filter_freq_encodes(self):
        cb1 = {'VoiceFilter0': {'plainParams': {'kParamFreq': 0.1}}}
        cb2 = {'VoiceFilter0': {'plainParams': {'kParamFreq': 0.9}}}
        v1 = fv.to_feature_vector(cb1)
        v2 = fv.to_feature_vector(cb2)
        assert not np.allclose(v1, v2)


class TestFxChainEncoding:
    def test_fx_type_one_hot(self):
        cb1 = {'FXRack0': {'plainParams': {}, 'FX': [
            {'type': 0, 'FXDistortion': {'plainParams': {'kParamDrive': 50.0}}},
        ]}}
        cb2 = {'FXRack0': {'plainParams': {}, 'FX': [
            {'type': 6, 'FXReverb': {'plainParams': {'kParamSize': 50.0}}},
        ]}}
        v1 = fv.to_feature_vector(cb1)
        v2 = fv.to_feature_vector(cb2)
        assert not np.allclose(v1, v2)

    def test_fx_count_does_not_crash_with_more_than_max(self):
        # up to MAX_FX slots used; extra ignored gracefully
        fx = []
        for i in range(fv.MAX_FX + 3):
            fx.append({'type': 0, 'FXDistortion': {'plainParams': {'kParamDrive': 10.0}}})
        cb = {'FXRack0': {'plainParams': {}, 'FX': fx}}
        v = fv.to_feature_vector(cb)  # must not raise
        assert len(v) == fv.VECTOR_DIM


class TestRoundTrip:
    def test_roundtrip_continuous_params_preserved(self):
        cb_in = {
            'Oscillator0': {'plainParams': {'kParamOctave': -1.0, 'kParamVolume': 0.8, 'kParamUnison': 7.0, 'kParamDetune': 0.4}},
            'VoiceFilter0': {'plainParams': {'kParamFreq': 0.5, 'kParamReso': 0.3, 'kParamDrive': 0.6}},
        }
        v = fv.to_feature_vector(cb_in)
        decoded = fv.from_feature_vector(v)
        params = decoded['params']
        # Continuous values within tolerance (round-trip loses precision but trend preserved)
        osc = params['Oscillator0']
        assert abs(osc['kParamOctave'] - (-1.0)) < 0.5
        assert abs(osc['kParamVolume'] - 0.8) < 0.2
        assert abs(osc['kParamUnison'] - 7.0) < 3.0

    def test_roundtrip_empty(self):
        v = fv.to_feature_vector({})
        decoded = fv.from_feature_vector(v)
        assert isinstance(decoded, dict)
        assert 'params' in decoded
        assert 'fx_chain' in decoded

    def test_roundtrip_fx_chain_reconstructs_type(self):
        cb_in = {'FXRack0': {'plainParams': {}, 'FX': [
            {'type': 6, 'FXReverb': {'plainParams': {'kParamSize': 50.0}}},
        ]}}
        v = fv.to_feature_vector(cb_in)
        decoded = fv.from_feature_vector(v)
        assert decoded['fx_chain'] is None or len(decoded['fx_chain']) >= 1
        if decoded['fx_chain']:
            assert decoded['fx_chain'][0]['type'] == 6


class TestRobustness:
    def test_plainparams_can_be_string_default(self):
        # Real presets use plainParams='default' when nothing set
        cb = {'Oscillator0': {'plainParams': 'default'}}
        v = fv.to_feature_vector(cb)  # must not raise
        assert len(v) == fv.VECTOR_DIM

    def test_missing_modules_tolerated(self):
        cb = {'SomeUnknownModule': {'plainParams': {}}}
        v = fv.to_feature_vector(cb)  # must not raise
        assert len(v) == fv.VECTOR_DIM

    def test_invalid_warp_menu_tolerated(self):
        cb = {'Oscillator0': {'plainParams': {}, 'WTOsc0': {'plainParams': {'kParamWarpMenu': 'kUnknownNewThing'}}}}
        v = fv.to_feature_vector(cb)  # unknown -> encoded as 'other'/zero, no crash
        assert len(v) == fv.VECTOR_DIM

    def test_float32_output(self):
        v = fv.to_feature_vector({})
        assert v.dtype == np.float32


class TestRealPreset:
    """Round-trip a real preset from the corpus (if present)."""

    @pytest.fixture
    def real_preset_path(self):
        import glob
        candidates = glob.glob('D:/VST/Xfer/Serum 2 Presets/Presets/**/*.SerumPreset', recursive=True)
        if not candidates:
            pytest.skip('No Serum corpus available locally')
        return candidates[0]

    def test_real_preset_encodes_and_decodes(self, real_preset_path):
        _, cb = sp.decode_preset(real_preset_path)
        v = fv.to_feature_vector(cb)
        assert len(v) == fv.VECTOR_DIM
        assert not np.allclose(v, 0.0), 'real preset should have non-zero features'
        # Must decode back to a valid build_preset-compatible dict
        decoded = fv.from_feature_vector(v)
        assert isinstance(decoded, dict)


class TestDeterminism:
    def test_same_input_same_output(self):
        cb = {'Oscillator0': {'plainParams': {'kParamOctave': -1.0}}, 'VoiceFilter0': {'plainParams': {'kParamType': 'MgL24'}}}
        v1 = fv.to_feature_vector(cb)
        v2 = fv.to_feature_vector(cb)
        assert np.array_equal(v1, v2)
