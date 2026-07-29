import pathlib
r=pathlib.Path(r'd:/ObsidianVault/networkfunk-production-os/Web/src/pages')
d=chr(46)
s=chr(47)
up2=d+d+s+d+d
oldlay=d+s+d+s+'layouts/'
oldlib=d+s+d+s+'lib/'
newlay=up2+s+'layouts/'
newlib=up2+s+'lib/'
print('old',repr(oldlay),'new',repr(newlay))
for p in r.rglob('*.astro'):
    raw=p.read_text(encoding='utf-8')
    n=raw.replace(oldlay,newlay).replace(oldlib,newlib)
    if n!=raw:
        p.write_text(n,encoding='utf-8')
        print('FIXED',p.as_posix().split('pages/')[-1])
    else:
        bad=oldlay in raw or oldlib in raw
        print('STILLBAD' if bad else 'OK',p.as_posix().split('pages/')[-1])