"""
_extract_corpus.py — batch-extract feature vectors from Serum 2 preset corpus (M1.4).

Scans all .SerumPreset files under the configured directory, encodes each as a
feature vector via feature_vector.to_feature_vector(), and writes a JSONL file
with one line per preset.

Output: data/preset_corpus.jsonl
  Each line: {"name", "path", "feature_vector": [...], "oscillator_count", "fx_count"}

This JSONL is the training dataset for future M2 (statistical) / M3 (neural) generators.

Usage:
    python scripts/_extract_corpus.py [--input DIR] [--output FILE] [--limit N]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Ensure repo root importable
REPO = Path(__file__).resolve().parent.parent
if str(REPO) not in sys.path:
    sys.path.insert(0, str(REPO))

from neuroman.tools import feature_vector as fv
from neuroman.tools import serum_preset as sp


def scan_corpus(input_dir: str, limit: int = 0) -> list[dict]:
    results = []
    input_path = Path(input_dir)
    if not input_path.exists():
        print(f'ERROR: Directory not found: {input_dir}', file=sys.stderr)
        sys.exit(1)

    files = sorted(input_path.rglob('*.SerumPreset'))
    if not files:
        print(f'WARNING: No .SerumPreset files found in {input_dir}', file=sys.stderr)
        sys.exit(0)

    if limit > 0:
        files = files[:limit]

    errors = 0
    for i, fp in enumerate(files):
        try:
            meta, cb = sp.decode_preset(fp)
            vec = fv.to_feature_vector(cb)
            fxr = cb.get('FXRack0', {})
            fx_count = len(fxr.get('FX', [])) if isinstance(fxr, dict) else 0
            osc_count = sum(1 for k in cb if k.startswith('Oscillator') and isinstance(cb[k], dict))
            results.append({
                'name': meta.get('presetName', fp.stem),
                'path': str(fp),
                'feature_vector': vec.tolist(),
                'oscillator_count': osc_count,
                'fx_count': fx_count,
            })
            if (i + 1) % 50 == 0:
                print(f'  Processed {i + 1}/{len(files)}...', file=sys.stderr)
        except Exception as e:
            errors += 1
            print(f'  SKIP {fp.name}: {e}', file=sys.stderr)

    print(f'Extracted {len(results)} presets ({errors} errors, {len(files)} scanned)', file=sys.stderr)
    return results


def main():
    ap = argparse.ArgumentParser(description='Extract feature vectors from Serum 2 preset corpus')
    ap.add_argument('--input', default='D:/VST/Xfer/Serum 2 Presets/Presets', help='Corpus root directory')
    ap.add_argument('--output', default=str(REPO / 'data' / 'preset_corpus.jsonl'), help='Output JSONL path')
    ap.add_argument('--limit', type=int, default=0, help='Max presets to process (0 = all)')
    args = ap.parse_args()

    print(f'Scanning: {args.input}', file=sys.stderr)
    results = scan_corpus(args.input, limit=args.limit)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')

    print(f'Written: {out_path} ({len(results)} lines)', file=sys.stderr)


if __name__ == '__main__':
    main()
