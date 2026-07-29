"""Deep scan recreations folder for filter+FU+FX chain patterns"""
import sys; sys.path.insert(0, '.')
import importlib.util
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)
sp.DEFAULT_TEMPLATE_PATH = None

from pathlib import Path
root = Path(r'D:\VST\Xfer\Serum 2 Presets\Presets\recreations')

# Focus on lead presets
leads = list(root.glob('LD*.SerumPreset'))
basses = list(root.glob('BS*.SerumPreset'))

print(f'=== LEAD PRESETS ({len(leads)}) ===')
for p in leads:
    try:
        meta, cb = sp.decode_preset(str(p))
    except Exception as e:
        print(f'\n{p.stem}: ERROR {e}')
        continue

    print(f'\n── {p.stem} ──')

    # Filter
    for fi in range(2):
        vf = cb.get(f'VoiceFilter{fi}', {})
        pp = vf.get('plainParams', {})
        if isinstance(pp, dict) and pp:
            print(f'  Filter{fi}: type={pp.get("kParamType")}  freq={pp.get("kParamFreq")}  reso={pp.get("kParamReso")}')

    # FXRack
    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue
        extras = {k:v for k,v in fx.items() if k != 'plainParams'}
        inner = extras.get('FX')
        dname = extras.get('displayName', '')
        if isinstance(inner, dict):
            # Check for FX name
            fx_name = inner.get('name') or inner.get('type') or ''
            fx_params = inner.get('plainParams', {})
            if isinstance(fx_params, dict) and fx_params:
                print(f'  FXRack{ri} [{dname}]: { {k: round(v,2) if isinstance(v, float) else v for k,v in fx_params.items()} }')
            elif fx_name or dname:
                print(f'  FXRack{ri}: {dname or fx_name}')

    # OSC & Warp
    for oi in range(3):
        osc = cb.get(f'Oscillator{oi}', {})
        if not isinstance(osc, dict): continue
        pp = osc.get('plainParams', {})
        if not isinstance(pp, dict): continue
        # Get warp from WTOsc
        for subk in osc:
            if subk.startswith('WTOsc'):
                wto = osc[subk]
                if isinstance(wto, dict):
                    wpp = wto.get('plainParams', {})
                    if isinstance(wpp, dict) and wpp.get('kParamWarpMenu'):
                        print(f'  OSC{oi} warp={wpp["kParamWarpMenu"]}  detune={pp.get("kParamDetune")}  unison={pp.get("kParamUnison")}  oct={pp.get("kParamOctave")}')

    # LFOs with envelope mode
    for li in range(10):
        lfo = cb.get(f'LFO{li}', {})
        if not isinstance(lfo, dict): continue
        pp = lfo.get('plainParams', {})
        if isinstance(pp, dict) and pp.get('kParamMode') == 'Envelope':
            print(f'  LFO{li}: ENVELOPE mode, rate={pp.get("kParamRate")}')

print(f'\n=== BASS PRESETS ({len(basses)}) — quick scan ===')
filter_types_bs = set()
for p in basses:
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue
    for fi in range(2):
        vf = cb.get(f'VoiceFilter{fi}', {})
        pp = vf.get('plainParams', {})
        if isinstance(pp, dict) and pp.get('kParamType'):
            filter_types_bs.add(pp['kParamType'])
print(f'Filter types in basses: {sorted(filter_types_bs)}')
