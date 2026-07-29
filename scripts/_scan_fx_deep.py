"""Deep dump of FXRack structure — find how FX types/params are stored"""
import sys, json; sys.path.insert(0, '.')
import importlib.util
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)
sp.DEFAULT_TEMPLATE_PATH = None

from pathlib import Path
root = Path(r'D:\VST\Xfer\Serum 2 Presets\Presets')

count = 0
for p in root.rglob('*.SerumPreset'):
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue

    # Check FXRack
    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue

        # Does it even have an 'FX' key?
        has_fx = 'FX' in fx
        extras = {k:v for k,v in fx.items() if k != 'plainParams'}

        if extras:
            print(f'\n── {p.parent.name}/{p.stem} / FXRack{ri} ──')
            print(f'  FXRack plainParams: {fx.get("plainParams", "N/A")}')
            for ek, ev in extras.items():
                if isinstance(ev, dict):
                    print(f'  {ek}: {json.dumps({k: (round(v,4) if isinstance(v,float) else v) for k,v in ev.items()}, indent=4)}')
                elif isinstance(ev, str):
                    print(f'  {ek}: {ev!r}')
                else:
                    print(f'  {ek}: {type(ev).__name__}')
            count += 1
            if count >= 15:
                break
    if count >= 15:
        break

print(f'\n\nShown: {count} presets with FXRack extras')

# Also look at how 'plainParams' works on FXRack — is it 'default' for empty?
print('\n\n=== FXRACK PLAINPARAMS PATTERNS ===')
patterns = {}
for p in list(root.rglob('*.SerumPreset'))[:200]:
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue
    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue
        pp = fx.get('plainParams', 'MISSING')
        pp_type = type(pp).__name__
        if isinstance(pp, dict):
            pp_type = f'dict[{len(pp)}]'
        key = f'FXRack{ri}: {pp_type}'
        patterns[key] = patterns.get(key, 0) + 1
for k, v in sorted(patterns.items()):
    print(f'  {k}: {v}')
