"""Scan all LS presets for unknown parameter values"""
import sys, importlib.util
sys.path.insert(0, '.')
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

# Monkey-patch DEFAULT_TEMPLATE_PATH to avoid file-not-found
sp.DEFAULT_TEMPLATE_PATH = None

from pathlib import Path
root = r'D:\VST\Xfer\Serum 2 Presets\Presets\LS'
presets = list(Path(root).glob('*.SerumPreset'))
print(f'Found {len(presets)} presets')

# Collect unique values
filter_types = set()
warp_modes = set()
lfo_modes = set()
sub_shapes = set()
fx_chain_names = set()
detune_and_unison = []

for p in presets:
    try:
        _, cb = sp.decode_preset(str(p))
    except Exception as e:
        print(f'  SKIP {p.stem}: {e}')
        continue

    # Filter types (VoiceFilter0 and VoiceFilter1)
    for fi in range(2):
        vf = cb.get(f'VoiceFilter{fi}', {})
        pp = vf.get('plainParams', {})
        if isinstance(pp, dict):
            ft = pp.get('kParamType')
            if ft and isinstance(ft, str):
                filter_types.add(ft)

    # Warp modes in WTOsc
    for oi in range(5):
        osc = cb.get(f'Oscillator{oi}', {})
        if not isinstance(osc, dict): continue
        for subk in osc:
            if subk.startswith('WTOsc'):
                wto = osc[subk]
                if isinstance(wto, dict):
                    spp = wto.get('plainParams', {})
                    if isinstance(spp, dict) and spp.get('kParamWarpMenu'):
                        warp_modes.add(spp['kParamWarpMenu'])

    # LFO modes
    for li in range(10):
        lfo = cb.get(f'LFO{li}', {})
        if not isinstance(lfo, dict): continue
        pp = lfo.get('plainParams', {})
        if isinstance(pp, dict) and pp.get('kParamMode'):
            lfo_modes.add(pp['kParamMode'])

    # Sub shapes
    osc4 = cb.get('Oscillator4', {})
    if isinstance(osc4, dict):
        for subk in osc4:
            if subk == 'SubOsc4':
                so = osc4[subk]
                if isinstance(so, dict):
                    spp = so.get('plainParams', {})
                    if isinstance(spp, dict) and spp.get('kParamShape'):
                        sub_shapes.add(spp['kParamShape'])

    # FX Rack names
    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue
        extras = {k:v for k,v in fx.items() if k != 'plainParams'}
        dn = extras.get('displayName', '')
        if dn:
            fx_chain_names.add(dn)
        inner_fx = extras.get('FX', {})
        if isinstance(inner_fx, dict):
            fx_name = inner_fx.get('name') or inner_fx.get('type') or ''
            if fx_name:
                fx_chain_names.add(fx_name)

print(f'\n=== FILTER TYPES ({len(filter_types)}) ===')
for ft in sorted(filter_types):
    print(f'  {ft}')

print(f'\n=== WARP MODES ({len(warp_modes)}) ===')
for wm in sorted(warp_modes):
    print(f'  {wm}')

print(f'\n=== LFO MODES ({len(lfo_modes)}) ===')
for lm in sorted(lfo_modes):
    print(f'  {lm}')

print(f'\n=== SUB SHAPES ({len(sub_shapes)}) ===')
for ss in sorted(sub_shapes):
    print(f'  {ss}')

print(f'\n=== FX CHAINS ({len(fx_chain_names)}) ===')
for fx in sorted(fx_chain_names):
    print(f'  {fx}')
