"""Scan lead presets to discover key parameter mappings"""
import sys; sys.path.insert(0, '.')
import importlib.util
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

root = r'D:\VST\Xfer\Serum 2 Presets\Presets'

# Presets to analyze - pick diverse leads
targets = [
    'Test Press Serum 2 Mutated DnB',
    'Test Press Serum 2 Mutated DnB',
    'Test Press Serum 2 Mutated DnB',
    'Lead',
    'Lead',
    'Lead',
    'synth',
]
names = [
    'TSP_S2MD_Lead_prodigy',
    'TSP_S2MD_Lead_huge_opener',
    'TSP_S2MD_Lead_quest',
    'LD - PWM Lead',
    'LD - PSY Lead',
    'LD - Synth Lead',
    'LD_hard lead',
]

for folder, name in zip(targets, names):
    path = f'{root}/{folder}/{name}.SerumPreset'
    try:
        _, cb = sp.decode_preset(path)
    except Exception as e:
        print(f"\n=== {name} === ERROR: {e}")
        continue

    print(f"\n=== {folder} / {name} ===")

    # 1) Oscillator configs
    for i in range(5):
        osc = cb.get(f'Oscillator{i}', {})
        pp = osc.get('plainParams', {})
        if not isinstance(pp, dict): pp = {}
        if pp:
            print(f"  OSC{i}: {pp}")
            # Show sub-modules (waveform type)
            for sub in [k for k in osc if k != 'plainParams']:
                print(f"    → {sub}")
                sub_data = osc[sub]
                if isinstance(sub_data, dict):
                    sub_pp = sub_data.get('plainParams', {})
                    if isinstance(sub_pp, dict) and sub_pp:
                        print(f"      params: {sub_pp}")

    # 2) Filter config
    vf = cb.get('VoiceFilter0', {})
    vf_pp = vf.get('plainParams', {})
    if isinstance(vf_pp, dict) and vf_pp:
        print(f"  VoiceFilter0: {vf_pp}")
    vf1 = cb.get('VoiceFilter1', {})
    vf1_pp = vf1.get('plainParams', {})
    if isinstance(vf1_pp, dict) and vf1_pp:
        print(f"  VoiceFilter1: {vf1_pp}")

    # 3) LFO modes
    for i in range(4):
        lfo = cb.get(f'LFO{i}', {})
        lfo_pp = lfo.get('plainParams', {})
        if isinstance(lfo_pp, dict) and lfo_pp:
            print(f"  LFO{i}: {lfo_pp}")
        # Check if it has envelope-like settings
        extras = {k:v for k,v in lfo.items() if k not in ('plainParams',)}
        if extras:
            cd = extras.get('curveData', {})
            if isinstance(cd, dict):
                npts = cd.get('numPoints', '?')
                print(f"    curve: {npts} points")

    # 4) FX Racks
    for i in range(3):
        fx = cb.get(f'FXRack{i}', {})
        fx_extras = {k:v for k,v in fx.items() if k != 'plainParams'}
        fx_inner = fx_extras.get('FX', {})
        fx_name = fx_extras.get('displayName', '')
        if isinstance(fx_inner, dict):
            fx_pp = fx_inner.get('plainParams', {})
            if isinstance(fx_pp, dict) and fx_pp:
                print(f"  FXRack{i} ({fx_name}): {fx_pp}")
            elif fx_name:
                print(f"  FXRack{i}: {fx_name}")
    print()
