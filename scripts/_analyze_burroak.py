"""Deep analysis of Serum 2 preset differences"""
import sys; sys.path.insert(0, '.')
import importlib.util
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

default_path = r'D:\ObsidianVault\networkfunk-production-os\neuroman\default.SerumPreset'
burroak_path = r'D:\VST\Xfer\Serum 2 Presets\Presets\fractions\PHNM_burroak_serum2_01.SerumPreset'

_, cb_d = sp.decode_preset(default_path)
_, cb_b = sp.decode_preset(burroak_path)

# 1) Show all ENV plainParams (even defaults)
print("=== ENV PLAINPARAMS ===")
for i in range(4):
    env = cb_b.get(f'Env{i}', {}).get('plainParams', {})
    print(f"  Env{i}: {env}")

# 2) Show all Oscillator extras to understand waveform selection
print("\n=== OSCILLATOR EXTRAS (burroak) ===")
for i in range(5):
    osc = cb_b.get(f'Oscillator{i}', {})
    extras = {k:v for k,v in osc.items() if k != 'plainParams'}
    print(f"  Oscillator{i}: {list(extras.keys())}")

# 3) Show FXRack extras
print("\n=== FXRACK EXTRAS (burroak) ===")
for i in range(3):
    fx = cb_b.get(f'FXRack{i}', {})
    extras = {k:v for k,v in fx.items() if k != 'plainParams'}
    print(f"  FXRack{i}: {list(extras.keys())}")
    if 'FX' in extras:
        fx_data = extras['FX']
        if isinstance(fx_data, dict):
            print(f"    FX keys: {list(fx_data.keys())}")
            # Show FX type/name
            fx_params = fx_data.get('plainParams', {})
            if isinstance(fx_params, dict):
                print(f"    FX params: {fx_params}")

# 4) Show LFO extras (curveData shape)
print("\n=== LFO EXTRAS (burroak) ===")
for i in range(3):
    lfo = cb_b.get(f'LFO{i}', {})
    extras = {k:v for k,v in lfo.items() if k != 'plainParams'}
    print(f"  LFO{i}: {list(extras.keys())}")
    for ek, ev in extras.items():
        if isinstance(ev, dict):
            print(f"    {ek}: {list(ev.keys())}")
        elif isinstance(ev, list):
            print(f"    {ek}: {type(ev[0]).__name__}[{len(ev)}]")
        else:
            print(f"    {ek}: {type(ev).__name__}")

# 5) Show VoiceFilter0 params in detail
print("\n=== VOICEFILTER0 (burroak) ===")
vf = cb_b.get('VoiceFilter0', {}).get('plainParams', {})
for k,v in sorted(vf.items()):
    print(f"  {k}: {v!r}")

# 6) Show VoiceFilter0 in default
print("\n=== VOICEFILTER0 (default) ===")
vf = cb_d.get('VoiceFilter0', {})
if isinstance(vf, dict):
    pp = vf.get('plainParams', {})
    if isinstance(pp, dict):
        for k,v in sorted(pp.items()):
            print(f"  {k}: {v!r}")

# 7) Check which modules have "params with values" but the key doesn't exist in default
print("\n=== PARAMS THAT DON'T EXIST IN DEFAULT (newly set) ===")
for k in sorted(cb_b.keys()):
    v_b = cb_b.get(k, {})
    v_d = cb_d.get(k, {})
    if not isinstance(v_b, dict) or not isinstance(v_d, dict):
        continue
    pp_b = v_b.get('plainParams', {})
    pp_d = v_d.get('plainParams', {})
    if not isinstance(pp_b, dict): pp_b = {}
    if not isinstance(pp_d, dict): pp_d = {}
    new = {pk: pv for pk, pv in pp_b.items() if pk not in pp_d}
    if new:
        print(f"  {k}:")
        for pk, pv in sorted(new.items()):
            print(f"    {pk} = {pv!r}")

# 8) Check for string-type params in all modules
print("\n=== STRING PARAMS IN BURROAK ===")
for k in sorted(cb_b.keys()):
    v = cb_b.get(k, {})
    if not isinstance(v, dict): continue
    pp = v.get('plainParams', {})
    if not isinstance(pp, dict): continue
    for pk, pv in pp.items():
        if isinstance(pv, str):
            print(f"  {k}.{pk} = {pv!r}")
