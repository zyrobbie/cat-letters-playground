"""Validate the independent static app and stamp its exact deployment revision."""
import hashlib, json, os, pathlib, subprocess
root = pathlib.Path('public').resolve()
assert (root/'index.html').is_file(), 'Missing public/index.html'
allowed={'.html','.css','.js','.mjs','.json','.png','.jpg','.jpeg','.webp','.svg','.ico','.woff2','.mp3','.ogg','.wav','.txt'}
for p in root.rglob('*'):
    assert not p.is_symlink(), f'Symlink not allowed: {p}'
    if not p.is_file(): continue
    assert p.suffix.lower() in allowed or p.name == '.nojekyll', f'Unexpected public file: {p.name}'
    assert p.stat().st_size < 20*1024*1024, f'Asset too large: {p.name}'
    if p.suffix in {'.js','.mjs'}:
        subprocess.run(['node','--check',str(p)],check=True)
# Runtime files only; the manifest intentionally excludes itself.
entries=[]
for p in sorted(root.rglob('*')):
    if p.is_file() and p.name != 'version.json':
        b=p.read_bytes(); entries.append({'path':p.relative_to(root).as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
(root/'version.json').write_text(json.dumps({'revision':os.environ.get('GITHUB_SHA','local'),'files':entries},ensure_ascii=False,indent=2)+'\n')
print(f'Validated {len(entries)} static files')
