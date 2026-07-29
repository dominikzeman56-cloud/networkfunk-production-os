"""Find any preset with non-empty FXRack FX list"""
import sys; sys.path.insert(0, '.')
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
    for ri in range(3):
        fx = cb.get(f'FXRack{ri}', {})
        if not isinstance(fx, dict): continue
        fx_list = fx.get('FX')
        if isinstance(fx_list, list) and len(fx_list) > 0:
            print(f'{p.parent.name}/{p.stem}  FXRack{ri} len={len(fx_list)}')
            for i, item in enumerate(fx_list):
                t = type(item).__name__
                if isinstance(item, dict):
                    keys = list(item.keys())
                    print(f'  [{i}] dict keys: {keys}')
                    # Check for type/name/id field
                    for mk in ['name', 'type', 'id', 'effect', 'effectType']:
                        if mk in item:
                            print(f'       {mk}: {item[mk]}')
                else:
                    print(f'  [{i}] {t}: {str(item)[:80]}')
            count += 1
            if count >= 5:
                break
    if count >= 5:
        break

if count == 0:
    print("No presets found with non-empty FX list!")
    # Let's check what the default looks like
    print("\nChecking default.SerumPreset FXRacks:")
    try:
        _, cb = sp.decode_preset(r'D:\ObsidianVault\networkfunk-production-os\neuroman\default.SerumPreset')
        for ri in range(3):
            fx = cb.get(f'FXRack{ri}', {})
            if isinstance(fx, dict):
                fx_list = fx.get('FX')
                print(f'  FXRack{ri}: FX type={type(fx_list).__name__}', end='')
                if isinstance(fx_list, list):
                    print(f' len={len(fx_list)}')
                    for i, item in enumerate(fx_list):
                        print(f'    [{i}] {type(item).__name__}')
                else:
                    print()
    except Exception as e:
        print(f'  Error: {e}')
