"""Test serum preset tool with full roundtrip"""
import sys, importlib.util

sys.path.insert(0, '.')
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

# Create preset with modules
meta, cb = sp.make_minimal_preset(
    name='Skullstep Lead',
    author='NeuroMan',
    modules={
        'Oscillator0': sp.module_with_params({'kParamUnisonDetune': -38.0}),
        'Oscillator1': sp.module_with_params({'kParamUnisonDetune': 38.0}),
        'Global': sp.default_module(),
    }
)

blob = sp.encode_preset(meta, cb)
print(f"File size: {len(blob)} bytes")

# Decode back
meta2, cb2 = sp.decode_preset(blob)
print(f"Modules: {sorted(cb2.keys())}")
print(f"OSC0: {cb2['Oscillator0']['plainParams']}")
print(f"Global: {cb2['Global']['plainParams']}")

# Hex dump first 48 bytes
print("\nHex header (first 48 bytes):")
for i, b in enumerate(blob[:48]):
    print(f"{b:02x}", end=" ")
    if (i + 1) % 16 == 0:
        print()
print()

# Verify dump_tree works
print("--- dump_tree ---")
print(sp.dump_tree(cb, show_params=True))
print("--- dump_tree (no params) ---")
print(sp.dump_tree(cb, show_params=False))
