"""Find FX chain structure in LS presets"""
import sys, importlib.util
sys.path.insert(0, '.')
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

from pathlib import Path
root = Path(r'D:\VST\Xfer\Serum 2 Presets\Presets\LS')
presets = list(root.glob('*.SerumPreset'))

# Find presets with FXRack data
for p in presets:
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue

    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue

        extras = {k:v for k,v in fx.items() if k != 'plainParams'}
        inner = extras.get('FX')
        if not isinstance(inner, dict): continue

        # Check if this FX has parameters (not empty)
        fx_pp = inner.get('plainParams', {})
        if isinstance(fx_pp, dict) and len(fx_pp) > 0:
            dname = extras.get('displayName', '?')
            print(f'\n=== {p.stem} / FXRack{ri} ({dname}) ===')
            print(f'  FX keys: {list(inner.keys())}')
            if fx_pp:
                print(f'  params: {fx_pp}')
            # Check for 'name' or 'type' in FX
            for k in inner:
                if k != 'plainParams':
                    print(f'  {k}: {inner[k]!r}')
            break
    else:
        continue
    break  # Just one for now
