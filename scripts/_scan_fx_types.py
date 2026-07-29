"""Map all FX types and their parameters from real presets"""
import sys; sys.path.insert(0, '.')
import importlib.util, json
spec = importlib.util.spec_from_file_location('serum_preset', 'neuroman/tools/serum_preset.py')
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)
sp.DEFAULT_TEMPLATE_PATH = None

from pathlib import Path
root = Path(r'D:\VST\Xfer\Serum 2 Presets\Presets')

fx_types = {}  # type_id: {module_key, name, param_examples}

for p in root.rglob('*.SerumPreset'):
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue
    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue
        fx_list = fx.get('FX')
        if not isinstance(fx_list, list): continue
        for item in fx_list:
            if not isinstance(item, dict): continue
            tid = item.get('type')
            if tid is None: continue

            # Find the module key (FX* named key)
            mod_key = None
            for k in item:
                if k.startswith('FX') and k != 'FX':
                    mod_key = k
                    break

            if tid not in fx_types:
                fx_types[tid] = {'count': 0, 'names': set(), 'params': {}}

            fx_types[tid]['count'] += 1
            if mod_key:
                fx_types[tid]['names'].add(mod_key)

                # Get module params
                mod = item.get(mod_key, {})
                if isinstance(mod, dict):
                    pp = mod.get('plainParams', {})
                    if isinstance(pp, dict):
                        for pk, pv in pp.items():
                            if pk not in fx_types[tid]['params']:
                                fx_types[tid]['params'][pk] = {'val': pv, 'ex': p.stem}
            break
    break  # One preset is enough to get structure

# Now scan ALL presets to collect param examples for each FX type
fx_types = {}
for p in root.rglob('*.SerumPreset'):
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue
    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue
        fx_list = fx.get('FX')
        if not isinstance(fx_list, list): continue
        for item in fx_list:
            if not isinstance(item, dict): continue
            tid = item.get('type')
            if tid is None: continue
            if tid not in fx_types:
                fx_types[tid] = {'count': 0, 'names': set(), 'params': {}}
            fx_types[tid]['count'] += 1
            for k in item:
                if k.startswith('FX') and k != 'FX':
                    fx_types[tid]['names'].add(k)
                    mod = item.get(k, {})
                    if isinstance(mod, dict):
                        pp = mod.get('plainParams', {})
                        if isinstance(pp, dict):
                            for pk, pv in pp.items():
                                if pk not in fx_types[tid]['params']:
                                    fx_types[tid]['params'][pk] = pv if not isinstance(pv, float) else round(pv, 4)

print('=== FX TYPE MAP ===')
for tid in sorted(fx_types.keys()):
    info = fx_types[tid]
    names = ', '.join(sorted(info['names'])[:3])
    print(f'\n  Type {tid}: {names}  (found in {info["count"]} presets)')
    if info['params']:
        for pk, pv in sorted(info['params'].items()):
            print(f'    {pk}: {pv}')

# Also show a concrete example of Complex FX chain (like Skullstep would use)
print('\n\n=== EXAMPLE: Full FX chain from a complex preset ===')
for p in root.rglob('*.SerumPreset'):
    try:
        _, cb = sp.decode_preset(str(p))
    except:
        continue
    fx = cb.get('FXRack0', {})
    fx_list = fx.get('FX')
    if isinstance(fx_list, list) and len(fx_list) >= 4:
        print(f'{p.parent.name}/{p.stem}')
        for i, item in enumerate(fx_list):
            if not isinstance(item, dict): continue
            tid = item.get('type')
            mix = item.get('kUIParamMixOrGain', '?')
            mod_key = None
            for k in item:
                if k.startswith('FX') and k != 'FX':
                    mod_key = k
                    break
            mod = item.get(mod_key, {}) if mod_key else {}
            pp = mod.get('plainParams', {}) if isinstance(mod, dict) else {}
            if isinstance(pp, dict) and pp:
                short = {k: round(v,4) if isinstance(v,float) else v for k,v in pp.items()}
            else:
                short = '(default)'
            print(f'  [{i}] type={tid} {mod_key} mix={mix} params={short}')
        break
