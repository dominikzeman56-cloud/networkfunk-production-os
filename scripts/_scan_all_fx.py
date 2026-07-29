"""Find ANY preset with non-empty FX rack across all folders"""
import sys; sys.path.insert(0, '.')
import importlib.util
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)
sp.DEFAULT_TEMPLATE_PATH = None

from pathlib import Path
root = Path(r'D:\VST\Xfer\Serum 2 Presets\Presets')

fx_presets = []
found = 0
dupes = set()

for p in root.rglob('*.SerumPreset'):
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue

    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue
        inner = fx.get('FX', {})
        if not isinstance(inner, dict): continue
        fx_pp = inner.get('plainParams', {})
        if isinstance(fx_pp, dict) and fx_pp:
            # Found an FX rack with real params!
            dn = fx.get('displayName', '') or inner.get('name', '') or inner.get('type', '')
            key = (ri, dn)
            if key not in dupes:
                dupes.add(key)
                print(f'\n── {p.parent.name}/{p.stem} → FXRack{ri} [{dn}] ──')
                print(f'  FX inner keys: {list(inner.keys())}')
                if fx_pp:
                    shown = {}
                    for k, v in fx_pp.items():
                        if isinstance(v, float):
                            shown[k] = round(v, 4)
                        else:
                            shown[k] = v
                    print(f'  params: {shown}')
                found += 1
            if found >= 20:
                break
    if found >= 20:
        break

print(f'\n\nTotal presets scanned: {len(list(root.rglob("*.SerumPreset")))}')
