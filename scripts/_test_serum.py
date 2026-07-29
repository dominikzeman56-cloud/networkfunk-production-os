"""Quick test of serum_preset.py"""
"""Quick test of serum_preset.py"""
import sys
sys.path.insert(0, r'D:\ObsidianVault\networkfunk-production-os')
import importlib
# import directly without going through __init__.py
spec = importlib.util.spec_from_file_location(
    "serum_preset",
    r"D:\ObsidianVault\networkfunk-production-os\neuroman\tools\serum_preset.py"
)
serum = importlib.util.module_from_spec(spec)
spec.loader.exec_module(serum)
make_minimal_preset = serum.make_minimal_preset
module_with_params = serum.module_with_params
encode_preset = serum.encode_preset
decode_preset = serum.decode_preset
dump_tree = serum.dump_tree

# Create a minimal preset with a few parameters
meta, cb = make_minimal_preset(
    name='Skullstep Test',
    author='NeuroMan',
    modules={
        'Oscillator0': module_with_params({
            'kParamUnisonDetune': -38.0,
            'kParamOctave': -1.0,
        }),
        'Oscillator1': module_with_params({
            'kParamUnisonDetune': 38.0,
            'kParamOctave': -1.0,
        }),
        'Global': module_with_params({
            'kParamGlobalTuning': 0.0,
        }),
    }
)

out = r'D:\ObsidianVault\networkfunk-production-os\Skullstep_Test.SerumPreset'
blob = encode_preset(meta, cb, path=out)
print(f'File size: {len(blob)} bytes')

# Roundtrip
meta2, cb2 = decode_preset(out)
print(f'Metadata: {meta2}')
print(f'Modules: {list(cb2.keys())[:5]}...')
osc0 = cb2['Oscillator0']['plainParams']
print(f'OSC0: {osc0}')
osc1 = cb2['Oscillator1']['plainParams']
print(f'OSC1: {osc1}')

# Quick dump
print('\n--- Tree ---')
print(dump_tree(cb2, show_params=True))
