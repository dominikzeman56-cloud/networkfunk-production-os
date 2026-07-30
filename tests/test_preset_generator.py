"""Tests for preset_generator + preset_archetypes (M1.2).

TDD: written before implementation.
"""
from __future__ import annotations

import numpy as np
import pytest

from neuroman.tools import feature_vector as fv
from neuroman.tools import preset_archetypes as pa
from neuroman.tools import preset_generator as pg
from neuroman.tools import serum_preset as sp

ARCHETYPES = ['growl', 'reese', 'hybrid', 'tech', 'pad']


# ─── Archetype registry ──────────────────────────────────────────────────


class TestArchetypeRegistry:
    def test_five_archetypes_present(self):
        names = pa.list_archetypes()
        for a in ARCHETYPES:
            assert a in names, f'{a} must be a registered archetype'

    def test_each_archetype_has_metadata(self):
        for a in ARCHETYPES:
            meta = pa.get_archetype(a)
            assert isinstance(meta, dict)
            assert 'name' in meta
            assert 'description' in meta
            assert 'params' in meta or 'fx_chain' in meta, 'archetype must define params or fx_chain'


# ─── Generator output ────────────────────────────────────────────────────


class TestGenerate:
    def test_generate_returns_bytes_and_vector(self):
        result = pg.generate('growl', seed=42)
        assert isinstance(result, dict)
        assert 'preset_bytes' in result
        assert 'feature_vector' in result
        assert 'meta' in result
        assert isinstance(result['preset_bytes'], (bytes, bytearray))
        assert len(result['preset_bytes']) > 100

    def test_generated_preset_is_valid_serum_file(self):
        result = pg.generate('reese', seed=1)
        # Must round-trip through decode_preset without error
        meta, cb = sp.decode_preset(result['preset_bytes'])
        assert 'presetName' in meta
        assert 'Oscillator0' in cb
        assert 'VoiceFilter0' in cb

    def test_seed_reproducibility(self):
        r1 = pg.generate('growl', seed=123)
        r2 = pg.generate('growl', seed=123)
        assert r1['preset_bytes'] == r2['preset_bytes'], 'same seed = same output'

    def test_different_seeds_differ(self):
        r1 = pg.generate('growl', seed=1)
        r2 = pg.generate('growl', seed=999)
        assert r1['preset_bytes'] != r2['preset_bytes']

    def test_each_archetype_generates_valid_preset(self):
        for a in ARCHETYPES:
            result = pg.generate(a, seed=7)
            meta, cb = sp.decode_preset(result['preset_bytes'])
            assert cb.get('Oscillator0'), f'{a}: Oscillator0 missing'

    def test_unknown_archetype_raises(self):
        with pytest.raises((ValueError, KeyError)):
            pg.generate('nonexistent_archetype', seed=1)


# ─── Feature-vector consistency ──────────────────────────────────────────


class TestFeatureVectorConsistency:
    def test_generated_vector_matches_round_trip(self):
        """The feature_vector returned must equal to_feature_vector(decoded)."""
        result = pg.generate('growl', seed=42)
        _, cb = sp.decode_preset(result['preset_bytes'])
        recomputed = fv.to_feature_vector(cb)
        # Allow small float drift but categorical one-hot must match exactly
        v1 = np.asarray(result['feature_vector'], dtype=np.float32)
        v2 = np.asarray(recomputed, dtype=np.float32)
        assert len(v1) == len(v2)
        assert np.allclose(v1, v2, atol=1e-3)

    def test_vector_is_correct_length(self):
        result = pg.generate('tech', seed=3)
        assert len(result['feature_vector']) == fv.VECTOR_DIM

    def test_different_archetypes_yield_different_vectors(self):
        vectors = {a: np.asarray(pg.generate(a, seed=5)['feature_vector']) for a in ARCHETYPES}
        archs = list(vectors)
        for i in range(len(archs)):
            for j in range(i + 1, len(archs)):
                assert not np.allclose(vectors[archs[i]], vectors[archs[j]]), \
                    f'{archs[i]} and {archs[j]} produce identical vectors'


# ─── Variation control ───────────────────────────────────────────────────


class TestVariation:
    def test_variation_zero_is_deterministic_regardless_of_seed(self):
        """variation=0 should produce archetype template unchanged."""
        r1 = pg.generate('growl', seed=1, variation=0.0)
        r2 = pg.generate('growl', seed=999, variation=0.0)
        assert r1['preset_bytes'] == r2['preset_bytes']

    def test_variation_one_produces_larger_change_than_zero(self):
        base = pg.generate('growl', seed=1, variation=0.0)
        varied = pg.generate('growl', seed=1, variation=1.0)
        # Hamming-ish distance: more positions differ with high variation
        v_base = np.asarray(base['feature_vector'])
        v_var = np.asarray(varied['feature_vector'])
        assert not np.allclose(v_base, v_var)


# ─── Meta payload ────────────────────────────────────────────────────────


class TestMeta:
    def test_meta_has_required_fields(self):
        result = pg.generate('growl', seed=1)
        meta = result['meta']
        for field in ['name', 'archetype', 'seed', 'variation', 'author', 'tags']:
            assert field in meta, f'meta missing {field}'

    def test_meta_name_includes_archetype(self):
        result = pg.generate('reese', seed=1)
        assert 'reese' in result['meta']['name'].lower() or 'Reese' in result['meta']['name']
