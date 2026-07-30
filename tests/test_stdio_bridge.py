"""Tests for the stdio CLI bridge (M1.3 contract test)."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PYTHON = REPO / '.venv' / 'Scripts' / 'python.exe'


def _run_stdio(req: dict) -> dict:
    proc = subprocess.run(
        [str(PYTHON), '-m', 'neuroman.tools.preset_generator', '--stdio'],
        input=json.dumps(req),
        capture_output=True,
        text=True,
        timeout=15,
        cwd=str(REPO),
    )
    return json.loads(proc.stdout.strip())


class TestStdioContract:
    def test_valid_request_returns_ok_true(self):
        resp = _run_stdio({'archetype': 'growl', 'seed': 1})
        assert resp['ok'] is True

    def test_valid_request_has_required_fields(self):
        resp = _run_stdio({'archetype': 'reese', 'seed': 42, 'variation': 0.5})
        assert 'preset_bytes_base64' in resp
        assert 'feature_vector' in resp
        assert 'meta' in resp
        assert resp['preset_bytes_size'] > 100

    def test_unknown_archetype_returns_ok_false(self):
        resp = _run_stdio({'archetype': 'nonexistent'})
        assert resp['ok'] is False
        assert 'error' in resp

    def test_feature_vector_length(self):
        from neuroman.tools.feature_vector import VECTOR_DIM
        resp = _run_stdio({'archetype': 'tech', 'seed': 7})
        assert len(resp['feature_vector']) == VECTOR_DIM

    def test_meta_seed_matches_request(self):
        resp = _run_stdio({'archetype': 'growl', 'seed': 123})
        assert resp['meta']['seed'] == 123
